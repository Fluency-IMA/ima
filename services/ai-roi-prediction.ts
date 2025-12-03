/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI ROI Prediction Service
 * Predicts campaign outcomes and ROI using AI analysis
 */

import { generateStructuredResponse } from '../lib/gemini';

// Types
export interface CampaignParameters {
    industry: string;
    budget: number;
    campaignType: 'product_launch' | 'brand_awareness' | 'sales_conversion' | 'engagement' | 'app_installs';
    duration: number; // in days
    creatorTier: 'micro' | 'mid' | 'macro' | 'mega';
    totalCreators: number;
    averageFollowers: number;
    averageEngagementRate: number;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'mixed';
    targetAudience: {
        size: number;
        demographics: string;
    };
    historicalData?: {
        previousCampaigns: number;
        averageROI: number;
    };
}

export interface ROIPrediction {
    predictedROI: number; // percentage (e.g., 340 = 340% ROI)
    confidenceLevel: 'high' | 'medium' | 'low';
    confidenceScore: number; // 0-100
    projectedMetrics: {
        reach: number;
        impressions: number;
        engagement: number;
        clicks: number;
        conversions: number;
        revenue: number;
    };
    breakdown: {
        costPerImpression: number;
        costPerClick: number;
        costPerConversion: number;
        conversionRate: number;
    };
    optimizations: string[];
    risks: string[];
    recommendations: string[];
    timelineProjection: {
        week1: { reach: number; conversions: number };
        week2: { reach: number; conversions: number };
        week3: { reach: number; conversions: number };
        week4: { reach: number; conversions: number };
    };
    generatedAt: Date;
}

interface AIROIResponse {
    predictedROI: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    confidenceScore: number;
    projectedReach: number;
    projectedImpressions: number;
    projectedEngagement: number;
    projectedClicks: number;
    projectedConversions: number;
    projectedRevenue: number;
    costPerImpression: number;
    costPerClick: number;
    costPerConversion: number;
    conversionRate: number;
    optimizations: string[];
    risks: string[];
    recommendations: string[];
    week1Reach: number;
    week1Conversions: number;
    week2Reach: number;
    week2Conversions: number;
    week3Reach: number;
    week3Conversions: number;
    week4Reach: number;
    week4Conversions: number;
}

/**
 * Predict campaign ROI using AI
 */
export async function predictROI(params: CampaignParameters): Promise<ROIPrediction> {
    // Build AI prompt
    const prompt = buildROIPrompt(params);

    // Get AI prediction
    const aiResponse = await generateStructuredResponse<AIROIResponse>(
        prompt,
        `{
      "predictedROI": number,
      "confidenceLevel": "high" | "medium" | "low",
      "confidenceScore": number (0-100),
      "projectedReach": number,
      "projectedImpressions": number,
      "projectedEngagement": number,
      "projectedClicks": number,
      "projectedConversions": number,
      "projectedRevenue": number,
      "costPerImpression": number,
      "costPerClick": number,
      "costPerConversion": number,
      "conversionRate": number,
      "optimizations": string[],
      "risks": string[],
      "recommendations": string[],
      "week1Reach": number,
      "week1Conversions": number,
      "week2Reach": number,
      "week2Conversions": number,
      "week3Reach": number,
      "week3Conversions": number,
      "week4Reach": number,
      "week4Conversions": number
    }`,
        { temperature: 0.3 }
    );

    return {
        predictedROI: aiResponse.predictedROI,
        confidenceLevel: aiResponse.confidenceLevel,
        confidenceScore: aiResponse.confidenceScore,
        projectedMetrics: {
            reach: aiResponse.projectedReach,
            impressions: aiResponse.projectedImpressions,
            engagement: aiResponse.projectedEngagement,
            clicks: aiResponse.projectedClicks,
            conversions: aiResponse.projectedConversions,
            revenue: aiResponse.projectedRevenue,
        },
        breakdown: {
            costPerImpression: aiResponse.costPerImpression,
            costPerClick: aiResponse.costPerClick,
            costPerConversion: aiResponse.costPerConversion,
            conversionRate: aiResponse.conversionRate,
        },
        optimizations: aiResponse.optimizations,
        risks: aiResponse.risks,
        recommendations: aiResponse.recommendations,
        timelineProjection: {
            week1: { reach: aiResponse.week1Reach, conversions: aiResponse.week1Conversions },
            week2: { reach: aiResponse.week2Reach, conversions: aiResponse.week2Conversions },
            week3: { reach: aiResponse.week3Reach, conversions: aiResponse.week3Conversions },
            week4: { reach: aiResponse.week4Reach, conversions: aiResponse.week4Conversions },
        },
        generatedAt: new Date(),
    };
}

/**
 * Build ROI prediction prompt
 */
function buildROIPrompt(params: CampaignParameters): string {
    const costPerCreator = params.budget / params.totalCreators;

    return `You are an expert influencer marketing analyst specializing in ROI prediction. Analyze this campaign and provide realistic projections.

CAMPAIGN PARAMETERS:
- Industry: ${params.industry}
- Total Budget: $${params.budget.toLocaleString()}
- Campaign Type: ${params.campaignType}
- Duration: ${params.duration} days
- Creator Tier: ${params.creatorTier}
- Number of Creators: ${params.totalCreators}
- Budget per Creator: $${costPerCreator.toLocaleString()}
- Average Followers per Creator: ${params.averageFollowers.toLocaleString()}
- Average Engagement Rate: ${params.averageEngagementRate}%
- Platform: ${params.platform}
- Target Audience Size: ${params.targetAudience.size.toLocaleString()}
- Target Demographics: ${params.targetAudience.demographics}
${params.historicalData ? `- Previous Campaigns: ${params.historicalData.previousCampaigns}
- Historical Average ROI: ${params.historicalData.averageROI}%` : ''}

INDUSTRY BENCHMARKS TO CONSIDER:
- ${params.industry} typical conversion rates
- ${params.platform} engagement patterns
- ${params.creatorTier} creator performance
- ${params.campaignType} expected outcomes

PREDICTION REQUIREMENTS:

1. ROI PREDICTION:
   - predictedROI: Expected ROI as percentage (e.g., 340 for 340% ROI)
   - confidenceLevel: "high" (80%+ confidence), "medium" (50-79%), "low" (<50%)
   - confidenceScore: Numerical confidence (0-100)

2. PROJECTED METRICS:
   - projectedReach: Unique people reached
   - projectedImpressions: Total views
   - projectedEngagement: Likes + comments + shares
   - projectedClicks: Click-throughs to brand
   - projectedConversions: Actual purchases/signups
   - projectedRevenue: Total revenue generated ($)

3. COST BREAKDOWN:
   - costPerImpression: CPM
   - costPerClick: CPC
   - costPerConversion: Cost per acquisition
   - conversionRate: Percentage of clicks that convert

4. OPTIMIZATIONS (3-5 suggestions):
   Specific ways to improve campaign performance

5. RISKS (2-4 items):
   Potential challenges or concerns

6. RECOMMENDATIONS (3-5 items):
   Actionable advice for maximizing ROI

7. TIMELINE PROJECTION (4 weeks):
   For each week, estimate:
   - Cumulative reach
   - Cumulative conversions

CALCULATION GUIDELINES:
- Use realistic industry benchmarks
- Account for creator tier and engagement rates
- Consider platform-specific performance
- Factor in campaign type objectives
- Be conservative but optimistic
- Ensure revenue > budget for positive ROI

Example ROI calculation:
ROI = ((Revenue - Budget) / Budget) × 100

Make predictions data-driven and realistic.`;
}

/**
 * Compare multiple campaign scenarios
 */
export async function compareScenarios(scenarios: CampaignParameters[]): Promise<ROIPrediction[]> {
    const predictions: ROIPrediction[] = [];

    for (const scenario of scenarios) {
        const prediction = await predictROI(scenario);
        predictions.push(prediction);
    }

    return predictions;
}

/**
 * Get best scenario from comparisons
 */
export function getBestScenario(predictions: ROIPrediction[]): ROIPrediction {
    return predictions.reduce((best, current) =>
        current.predictedROI > best.predictedROI ? current : best
    );
}

export default {
    predictROI,
    compareScenarios,
    getBestScenario,
};
