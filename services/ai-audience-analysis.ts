/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Audience Analysis Service
 * Analyzes creator audiences to extract demographics, interests, and brand fit
 */

import { generateStructuredResponse } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Types
export interface CreatorAudienceData {
    creatorId: string;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
    followers: number;
    sampleComments?: string[];
    contentTopics?: string[];
    engagementPatterns?: {
        peakHours: number[];
        activeRegions: string[];
    };
}

export interface AudienceAnalysis {
    creatorId: string;
    analyzedAt: Date;
    demographics: {
        ageRanges: {
            '13-17': number;
            '18-24': number;
            '25-34': number;
            '35-44': number;
            '45-54': number;
            '55+': number;
        };
        genderSplit: {
            male: number;
            female: number;
            other: number;
        };
        topLocations: {
            country: string;
            percentage: number;
        }[];
        interests: string[];
    };
    brandFitScores: {
        [industry: string]: number; // 0-100
    };
    audienceQuality: {
        engagementLevel: 'high' | 'medium' | 'low';
        purchasingPower: 'high' | 'medium' | 'low';
        brandAffinity: number; // 0-100
    };
    insights: string;
    expiresAt: Date;
}

interface AIAudienceResponse {
    ageRanges: {
        '13-17': number;
        '18-24': number;
        '25-34': number;
        '35-44': number;
        '45-54': number;
        '55+': number;
    };
    genderSplit: {
        male: number;
        female: number;
        other: number;
    };
    topLocations: {
        country: string;
        percentage: number;
    }[];
    interests: string[];
    brandFitScores: {
        ecommerce: number;
        saas: number;
        cpg: number;
        fashion: number;
        tech: number;
        healthcare: number;
        finance: number;
        travel: number;
    };
    engagementLevel: 'high' | 'medium' | 'low';
    purchasingPower: 'high' | 'medium' | 'low';
    brandAffinity: number;
    insights: string;
}

/**
 * Analyze creator's audience using AI
 */
export async function analyzeAudience(audienceData: CreatorAudienceData): Promise<AudienceAnalysis> {
    const { creatorId } = audienceData;

    // Check cache first
    const cached = await getCachedAnalysis(creatorId);
    if (cached && cached.expiresAt > new Date()) {
        console.log('Returning cached audience analysis for:', creatorId);
        return cached;
    }

    // Build AI prompt
    const prompt = buildAudiencePrompt(audienceData);

    // Get AI analysis
    const aiResponse = await generateStructuredResponse<AIAudienceResponse>(
        prompt,
        `{
      "ageRanges": {
        "13-17": number,
        "18-24": number,
        "25-34": number,
        "35-44": number,
        "45-54": number,
        "55+": number
      },
      "genderSplit": {
        "male": number,
        "female": number,
        "other": number
      },
      "topLocations": [
        {
          "country": string,
          "percentage": number
        }
      ],
      "interests": string[],
      "brandFitScores": {
        "ecommerce": number,
        "saas": number,
        "cpg": number,
        "fashion": number,
        "tech": number,
        "healthcare": number,
        "finance": number,
        "travel": number
      },
      "engagementLevel": "high" | "medium" | "low",
      "purchasingPower": "high" | "medium" | "low",
      "brandAffinity": number,
      "insights": string
    }`,
        { temperature: 0.4 }
    );

    // Build analysis result
    const result: AudienceAnalysis = {
        creatorId,
        analyzedAt: new Date(),
        demographics: {
            ageRanges: aiResponse.ageRanges,
            genderSplit: aiResponse.genderSplit,
            topLocations: aiResponse.topLocations,
            interests: aiResponse.interests,
        },
        brandFitScores: aiResponse.brandFitScores,
        audienceQuality: {
            engagementLevel: aiResponse.engagementLevel,
            purchasingPower: aiResponse.purchasingPower,
            brandAffinity: aiResponse.brandAffinity,
        },
        insights: aiResponse.insights,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Cache the result
    await cacheAnalysis(result);

    return result;
}

/**
 * Build AI audience analysis prompt
 */
function buildAudiencePrompt(data: CreatorAudienceData): string {
    return `You are an expert audience analyst for influencer marketing. Analyze this creator's audience to extract demographics, interests, and brand fit.

CREATOR DATA:
- Creator ID: ${data.creatorId}
- Platform: ${data.platform}
- Total Followers: ${data.followers.toLocaleString()}
${data.contentTopics ? `- Content Topics: ${data.contentTopics.join(', ')}` : ''}
${data.engagementPatterns?.activeRegions ? `- Active Regions: ${data.engagementPatterns.activeRegions.join(', ')}` : ''}

${data.sampleComments ? `SAMPLE AUDIENCE COMMENTS (for sentiment/demographic analysis):
${data.sampleComments.slice(0, 20).map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

ANALYSIS REQUIREMENTS:

1. DEMOGRAPHICS:
   - Estimate age distribution (percentages must sum to 100)
   - Estimate gender split (percentages must sum to 100)
   - Identify top 5 countries/regions with percentages
   - Extract key interests from content and engagement

2. BRAND FIT SCORES (0-100 for each industry):
   - ecommerce: How well does this audience fit e-commerce brands?
   - saas: Software/tech products
   - cpg: Consumer packaged goods
   - fashion: Fashion and beauty brands
   - tech: Technology products
   - healthcare: Health and wellness
   - finance: Financial services
   - travel: Travel and hospitality

3. AUDIENCE QUALITY:
   - engagementLevel: "high" (very active), "medium" (moderately active), "low" (passive)
   - purchasingPower: "high" (affluent), "medium" (middle class), "low" (budget-conscious)
   - brandAffinity: 0-100 score for how receptive audience is to brand partnerships

4. INSIGHTS:
   Provide 2-3 sentences of actionable insights about this audience for brands.

ESTIMATION GUIDELINES:
- Use platform norms for ${data.platform}
- Consider content topics and engagement patterns
- Be realistic and data-driven
- Acknowledge uncertainty where appropriate`;
}

/**
 * Get brand fit score for specific industry
 */
export function getBrandFitScore(analysis: AudienceAnalysis, industry: string): number {
    return analysis.brandFitScores[industry] || 0;
}

/**
 * Get cached analysis from Firestore
 */
async function getCachedAnalysis(creatorId: string): Promise<AudienceAnalysis | null> {
    try {
        const docRef = doc(db, 'ai_audience_analyses', creatorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                analyzedAt: data.analyzedAt.toDate(),
                expiresAt: data.expiresAt.toDate(),
            } as AudienceAnalysis;
        }

        return null;
    } catch (error) {
        console.error('Error fetching cached analysis:', error);
        return null;
    }
}

/**
 * Cache analysis result in Firestore
 */
async function cacheAnalysis(result: AudienceAnalysis): Promise<void> {
    try {
        const docRef = doc(db, 'ai_audience_analyses', result.creatorId);
        await setDoc(docRef, {
            ...result,
            analyzedAt: Timestamp.fromDate(result.analyzedAt),
            expiresAt: Timestamp.fromDate(result.expiresAt),
        });
    } catch (error) {
        console.error('Error caching analysis:', error);
    }
}

export default {
    analyzeAudience,
    getBrandFitScore,
};
