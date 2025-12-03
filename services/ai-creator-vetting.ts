/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Creator Verification & Vetting Service
 * Analyzes creator profiles to detect fake followers and calculate authenticity scores
 */

import { generateStructuredResponse } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Types
export interface CreatorProfile {
    username: string;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
    followers: number;
    following: number;
    totalPosts: number;
    averageLikes: number;
    averageComments: number;
    bio?: string;
    recentPosts?: {
        likes: number;
        comments: number;
        engagement: number;
    }[];
    accountAge?: number; // in months
    verifiedBadge?: boolean;
}

export interface VerificationResult {
    creatorId: string;
    authenticityScore: number; // 0-100
    verifiedAt: Date;
    redFlags: string[];
    analysis: {
        followerQuality: number; // 0-100
        engagementAuthenticity: number; // 0-100
        contentConsistency: number; // 0-100
        audienceRelevance: number; // 0-100
    };
    report: string;
    recommendation: 'approved' | 'review' | 'rejected';
    expiresAt: Date;
}

interface AIVerificationResponse {
    authenticityScore: number;
    followerQuality: number;
    engagementAuthenticity: number;
    contentConsistency: number;
    audienceRelevance: number;
    redFlags: string[];
    detailedAnalysis: string;
    recommendation: 'approved' | 'review' | 'rejected';
}

/**
 * Verify creator authenticity using AI analysis
 */
export async function verifyCreator(profile: CreatorProfile): Promise<VerificationResult> {
    const creatorId = `${profile.platform}_${profile.username}`;

    // Check cache first
    const cached = await getCachedVerification(creatorId);
    if (cached && cached.expiresAt > new Date()) {
        console.log('Returning cached verification for:', creatorId);
        return cached;
    }

    // Calculate engagement metrics
    const engagementRate = calculateEngagementRate(profile);
    const followerFollowingRatio = profile.followers / Math.max(profile.following, 1);

    // Build AI prompt
    const prompt = buildVerificationPrompt(profile, engagementRate, followerFollowingRatio);

    // Get AI analysis
    const aiResponse = await generateStructuredResponse<AIVerificationResponse>(
        prompt,
        `{
      "authenticityScore": number (0-100),
      "followerQuality": number (0-100),
      "engagementAuthenticity": number (0-100),
      "contentConsistency": number (0-100),
      "audienceRelevance": number (0-100),
      "redFlags": string[],
      "detailedAnalysis": string,
      "recommendation": "approved" | "review" | "rejected"
    }`,
        { temperature: 0.3 }
    );

    // Build verification result
    const result: VerificationResult = {
        creatorId,
        authenticityScore: aiResponse.authenticityScore,
        verifiedAt: new Date(),
        redFlags: aiResponse.redFlags,
        analysis: {
            followerQuality: aiResponse.followerQuality,
            engagementAuthenticity: aiResponse.engagementAuthenticity,
            contentConsistency: aiResponse.contentConsistency,
            audienceRelevance: aiResponse.audienceRelevance,
        },
        report: aiResponse.detailedAnalysis,
        recommendation: aiResponse.recommendation,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Cache the result
    await cacheVerification(result);

    return result;
}

/**
 * Build AI verification prompt
 */
function buildVerificationPrompt(
    profile: CreatorProfile,
    engagementRate: number,
    followerFollowingRatio: number
): string {
    return `You are an expert influencer marketing analyst. Analyze this creator profile for authenticity and detect fake followers or engagement.

CREATOR PROFILE:
- Platform: ${profile.platform}
- Username: @${profile.username}
- Followers: ${profile.followers.toLocaleString()}
- Following: ${profile.following.toLocaleString()}
- Total Posts: ${profile.totalPosts}
- Average Likes: ${profile.averageLikes.toLocaleString()}
- Average Comments: ${profile.averageComments.toLocaleString()}
- Engagement Rate: ${engagementRate.toFixed(2)}%
- Follower/Following Ratio: ${followerFollowingRatio.toFixed(2)}
- Account Age: ${profile.accountAge || 'Unknown'} months
- Verified Badge: ${profile.verifiedBadge ? 'Yes' : 'No'}
${profile.bio ? `- Bio: ${profile.bio}` : ''}

${profile.recentPosts ? `RECENT POSTS ENGAGEMENT:
${profile.recentPosts.map((post, i) => `Post ${i + 1}: ${post.likes} likes, ${post.comments} comments (${post.engagement.toFixed(2)}% engagement)`).join('\n')}` : ''}

ANALYSIS CRITERIA:
1. Follower Quality (0-100): Assess likelihood of real vs. fake followers based on follower/following ratio, engagement rate, and account age
2. Engagement Authenticity (0-100): Analyze if engagement (likes, comments) is genuine or artificially inflated
3. Content Consistency (0-100): Evaluate posting frequency and engagement consistency
4. Audience Relevance (0-100): Assess if the audience appears real and engaged

RED FLAGS TO DETECT:
- Sudden follower spikes
- Very low engagement rate (<1% is suspicious for ${profile.platform})
- High follower count but low engagement
- Follower/following ratio issues
- Inconsistent engagement patterns
- Bot-like comment patterns

SCORING GUIDELINES:
- 80-100: Highly authentic, verified quality creator
- 60-79: Mostly authentic, some minor concerns
- 40-59: Moderate concerns, needs review
- 0-39: High risk of fake followers/engagement

RECOMMENDATION:
- "approved": Score 70+, minimal red flags
- "review": Score 40-69, some concerns
- "rejected": Score <40, major red flags

Provide a comprehensive analysis with specific red flags if found.`;
}

/**
 * Calculate engagement rate
 */
function calculateEngagementRate(profile: CreatorProfile): number {
    if (profile.followers === 0) return 0;

    const totalEngagement = profile.averageLikes + profile.averageComments;
    return (totalEngagement / profile.followers) * 100;
}

/**
 * Get cached verification from Firestore
 */
async function getCachedVerification(creatorId: string): Promise<VerificationResult | null> {
    try {
        const docRef = doc(db, 'ai_creator_verifications', creatorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                verifiedAt: data.verifiedAt.toDate(),
                expiresAt: data.expiresAt.toDate(),
            } as VerificationResult;
        }

        return null;
    } catch (error) {
        console.error('Error fetching cached verification:', error);
        return null;
    }
}

/**
 * Cache verification result in Firestore
 */
async function cacheVerification(result: VerificationResult): Promise<void> {
    try {
        const docRef = doc(db, 'ai_creator_verifications', result.creatorId);
        await setDoc(docRef, {
            ...result,
            verifiedAt: Timestamp.fromDate(result.verifiedAt),
            expiresAt: Timestamp.fromDate(result.expiresAt),
        });
    } catch (error) {
        console.error('Error caching verification:', error);
    }
}

/**
 * Batch verify multiple creators
 */
export async function batchVerifyCreators(profiles: CreatorProfile[]): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    // Process in batches of 3 to avoid rate limits
    for (let i = 0; i < profiles.length; i += 3) {
        const batch = profiles.slice(i, i + 3);
        const batchResults = await Promise.all(
            batch.map(profile => verifyCreator(profile))
        );
        results.push(...batchResults);

        // Small delay between batches
        if (i + 3 < profiles.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

export default {
    verifyCreator,
    batchVerifyCreators,
};
