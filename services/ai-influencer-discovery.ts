import { getInfluencerDataByUsername, InfluencerAnalytics } from './instagram-api';

export interface BusinessAnalysis {
    niche: string;
    keywords: string[];
    targetAudience: string;
    idealInfluencerPersona: string;
}

export interface DiscoveryCriteria {
    businessName: string;
    productDescription: string;
    goals: string;
}

export class AIInfluencerDiscoveryService {
    private accessToken: string;
    private accountId?: string;

    constructor(accessToken: string, accountId?: string) {
        this.accessToken = accessToken;
        this.accountId = accountId;
    }

    /**
     * Step 1: Analyze the business to understand niche and requirements
     */
    async analyzeBusiness(criteria: DiscoveryCriteria): Promise<BusinessAnalysis> {
        try {
            const response = await fetch('/api/ai-discovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'analyze',
                    criteria
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze business');
            }

            return await response.json();
        } catch (error) {
            console.error('Error analyzing business:', error);
            throw error;
        }
    }

    /**
     * Step 2: Generate a list of potential candidates using AI knowledge
     * Note: AI might hallucinate, so we must verify these later
     */
    async generateCandidateList(analysis: BusinessAnalysis): Promise<string[]> {
        try {
            const response = await fetch('/api/ai-discovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'generate_candidates',
                    analysis
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate candidates');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating candidate list:', error);
            throw error;
        }
    }
    /**
     * Step 3: Verify candidates and fetch real data
     */
    async searchAndFilterInfluencers(
        candidates: string[],
        minFollowers: number = 10000,
        maxFollowers: number = 1000000
    ): Promise<InfluencerAnalytics[]> {
        const verifiedInfluencers: InfluencerAnalytics[] = [];

        // Process in batches to avoid rate limits
        const BATCH_SIZE = 5;

        for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
            const batch = candidates.slice(i, i + BATCH_SIZE);

            const results = await Promise.allSettled(
                batch.map(username =>
                    getInfluencerDataByUsername(username, this.accessToken, this.accountId)
                )
            );

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    const influencer = result.value;

                    // Filter by follower count
                    if (influencer.followers >= minFollowers && influencer.followers <= maxFollowers) {
                        verifiedInfluencers.push(influencer);
                    }
                } else {
                    // Log error but continue (common for AI to suggest non-business accounts or changed usernames)
                    // console.warn('Failed to verify candidate:', result.reason);
                }
            }

            // Small delay between batches
            if (i + BATCH_SIZE < candidates.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return verifiedInfluencers;
    }

    /**
     * Main orchestration function
     */
    async findInfluencers(criteria: DiscoveryCriteria): Promise<{
        analysis: BusinessAnalysis;
        influencers: InfluencerAnalytics[];
    }> {
        // 1. Analyze
        const analysis = await this.analyzeBusiness(criteria);

        // 2. Generate Candidates
        const candidates = await this.generateCandidateList(analysis);

        // 3. Verify & Filter
        // Default to Micro + Macro range (10k - 1M)
        const influencers = await this.searchAndFilterInfluencers(candidates, 10000, 1000000);

        return {
            analysis,
            influencers
        };
    }
}
