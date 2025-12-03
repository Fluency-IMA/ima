/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Smart Matching Service
 * Matches brands with ideal creators using AI-powered compatibility analysis
 */

import { generateStructuredResponse } from '../lib/gemini';
import { verifyCreator, CreatorProfile } from './ai-creator-vetting';
import { analyzeAudience, CreatorAudienceData, AudienceAnalysis } from './ai-audience-analysis';

// Types
export interface BrandRequirements {
    industry: string;
    budget: number;
    campaignGoals: string[];
    targetAudience: {
        ageRange?: string;
        gender?: string;
        locations?: string[];
        interests?: string[];
    };
    brandVoice?: string;
    contentStyle?: string;
    minimumFollowers?: number;
    maximumFollowers?: number;
    platforms?: ('instagram' | 'tiktok' | 'youtube' | 'twitter')[];
}

export interface CreatorMatch {
    creatorId: string;
    username: string;
    platform: string;
    compatibilityScore: number; // 0-100
    matchReasons: string[];
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedROI: number;
    pricingEstimate: {
        min: number;
        max: number;
    };
    strengths: string[];
    considerations: string[];
}

export interface MatchingResult {
    matches: CreatorMatch[];
    totalAnalyzed: number;
    matchingCriteria: BrandRequirements;
    generatedAt: Date;
}

interface AIMatchResponse {
    compatibilityScore: number;
    matchReasons: string[];
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedROI: number;
    pricingMin: number;
    pricingMax: number;
    strengths: string[];
    considerations: string[];
}

/**
 * Find best creator matches for a brand
 */
export async function findCreatorMatches(
    brandReqs: BrandRequirements,
    availableCreators: (CreatorProfile & { audienceData?: CreatorAudienceData })[]
): Promise<MatchingResult> {
    const matches: CreatorMatch[] = [];

    // Filter creators by basic criteria first
    const filteredCreators = availableCreators.filter(creator => {
        if (brandReqs.minimumFollowers && creator.followers < brandReqs.minimumFollowers) return false;
        if (brandReqs.maximumFollowers && creator.followers > brandReqs.maximumFollowers) return false;
        if (brandReqs.platforms && !brandReqs.platforms.includes(creator.platform)) return false;
        return true;
    });

    // Analyze each creator with AI
    for (const creator of filteredCreators) {
        try {
            const match = await analyzeCreatorMatch(brandReqs, creator);
            if (match.compatibilityScore >= 50) { // Only include matches with 50+ score
                matches.push(match);
            }
        } catch (error) {
            console.error(`Error analyzing creator ${creator.username}:`, error);
        }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
        matches: matches.slice(0, 20), // Top 20 matches
        totalAnalyzed: filteredCreators.length,
        matchingCriteria: brandReqs,
        generatedAt: new Date(),
    };
}

/**
 * Analyze individual creator match using AI
 */
async function analyzeCreatorMatch(
    brandReqs: BrandRequirements,
    creator: CreatorProfile & { audienceData?: CreatorAudienceData }
): Promise<CreatorMatch> {
    const creatorId = `${creator.platform}_${creator.username}`;

    // Get creator verification (with caching)
    const verification = await verifyCreator(creator);

    // Get audience analysis if data available (with caching)
    let audienceAnalysis: AudienceAnalysis | null = null;
    if (creator.audienceData) {
        audienceAnalysis = await analyzeAudience(creator.audienceData);
    }

    // Build AI matching prompt
    const prompt = buildMatchingPrompt(brandReqs, creator, verification.authenticityScore, audienceAnalysis);

    // Get AI analysis
    const aiResponse = await generateStructuredResponse<AIMatchResponse>(
        prompt,
        `{
      "compatibilityScore": number (0-100),
      "matchReasons": string[],
      "estimatedReach": number,
      "estimatedEngagement": number,
      "estimatedROI": number,
      "pricingMin": number,
      "pricingMax": number,
      "strengths": string[],
      "considerations": string[]
    }`,
        { temperature: 0.4 }
    );

    return {
        creatorId,
        username: creator.username,
        platform: creator.platform,
        compatibilityScore: aiResponse.compatibilityScore,
        matchReasons: aiResponse.matchReasons,
        estimatedReach: aiResponse.estimatedReach,
        estimatedEngagement: aiResponse.estimatedEngagement,
        estimatedROI: aiResponse.estimatedROI,
        pricingEstimate: {
            min: aiResponse.pricingMin,
            max: aiResponse.pricingMax,
        },
        strengths: aiResponse.strengths,
        considerations: aiResponse.considerations,
    };
}

/**
 * Build AI matching prompt
 */
function buildMatchingPrompt(
    brandReqs: BrandRequirements,
    creator: CreatorProfile,
    authenticityScore: number,
    audienceAnalysis: AudienceAnalysis | null
): string {
    const engagementRate = ((creator.averageLikes + creator.averageComments) / creator.followers) * 100;

    return `You are an expert influencer marketing matchmaker. Analyze how well this creator matches the brand's requirements.

BRAND REQUIREMENTS:
- Industry: ${brandReqs.industry}
- Budget: $${brandReqs.budget.toLocaleString()}
- Campaign Goals: ${brandReqs.campaignGoals.join(', ')}
- Target Audience Age: ${brandReqs.targetAudience.ageRange || 'Any'}
- Target Audience Gender: ${brandReqs.targetAudience.gender || 'Any'}
- Target Locations: ${brandReqs.targetAudience.locations?.join(', ') || 'Any'}
- Target Interests: ${brandReqs.targetAudience.interests?.join(', ') || 'Any'}
${brandReqs.brandVoice ? `- Brand Voice: ${brandReqs.brandVoice}` : ''}
${brandReqs.contentStyle ? `- Preferred Content Style: ${brandReqs.contentStyle}` : ''}

CREATOR PROFILE:
- Username: @${creator.username}
- Platform: ${creator.platform}
- Followers: ${creator.followers.toLocaleString()}
- Engagement Rate: ${engagementRate.toFixed(2)}%
- Authenticity Score: ${authenticityScore}/100
${creator.bio ? `- Bio: ${creator.bio}` : ''}

${audienceAnalysis ? `AUDIENCE ANALYSIS:
- Age Distribution: ${Object.entries(audienceAnalysis.demographics.ageRanges).map(([age, pct]) => `${age}: ${pct}%`).join(', ')}
- Gender Split: ${Object.entries(audienceAnalysis.demographics.genderSplit).map(([g, pct]) => `${g}: ${pct}%`).join(', ')}
- Top Locations: ${audienceAnalysis.demographics.topLocations.map(l => `${l.country} (${l.percentage}%)`).join(', ')}
- Interests: ${audienceAnalysis.demographics.interests.join(', ')}
- Brand Fit Score for ${brandReqs.industry}: ${audienceAnalysis.brandFitScores[brandReqs.industry] || 'N/A'}/100
- Engagement Level: ${audienceAnalysis.audienceQuality.engagementLevel}
- Purchasing Power: ${audienceAnalysis.audienceQuality.purchasingPower}` : ''}

ANALYSIS REQUIREMENTS:

1. COMPATIBILITY SCORE (0-100):
   Consider:
   - Audience alignment with brand's target
   - Creator authenticity (${authenticityScore}/100)
   - Budget fit (typical ${creator.platform} pricing)
   - Content style match
   - Campaign goals alignment

2. MATCH REASONS (3-5 bullet points):
   Specific reasons why this creator is a good match

3. ESTIMATED METRICS:
   - estimatedReach: How many people will see the content
   - estimatedEngagement: Expected likes + comments + shares
   - estimatedROI: Expected return on investment as percentage (e.g., 250 = 250% ROI)

4. PRICING ESTIMATE:
   - pricingMin: Minimum expected cost for this creator ($)
   - pricingMax: Maximum expected cost for this creator ($)
   
   Pricing guidelines by platform and followers:
   - Instagram: $100-$500 per 10k followers
   - TikTok: $50-$300 per 10k followers
   - YouTube: $200-$1000 per 10k subscribers
   - Twitter: $50-$200 per 10k followers

5. STRENGTHS (2-4 items):
   Key advantages of working with this creator

6. CONSIDERATIONS (1-3 items):
   Potential concerns or things to consider

Be realistic and data-driven. If compatibility is low, reflect that in the score.`;
}

/**
 * Get top N matches
 */
export function getTopMatches(result: MatchingResult, count: number = 5): CreatorMatch[] {
    return result.matches.slice(0, count);
}

/**
 * Filter matches by minimum score
 */
export function filterByScore(result: MatchingResult, minScore: number): CreatorMatch[] {
    return result.matches.filter(match => match.compatibilityScore >= minScore);
}

export default {
    findCreatorMatches,
    getTopMatches,
    filterByScore,
};
