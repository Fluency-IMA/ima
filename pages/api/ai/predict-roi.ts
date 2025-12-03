/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Endpoint: ROI Prediction
 * POST /api/ai/predict-roi
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../../../lib/admin';
import { predictROI, CampaignParameters } from '../../../services/ai-roi-prediction';

interface PredictROIRequest {
    campaignParameters: CampaignParameters;
}

interface PredictROIResponse {
    success: boolean;
    data?: {
        predictedROI: number;
        confidenceLevel: string;
        confidenceScore: number;
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
    };
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PredictROIResponse>
) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
    }

    try {
        const { campaignParameters } = req.body as PredictROIRequest;

        if (!campaignParameters || !campaignParameters.industry || !campaignParameters.budget) {
            return res.status(400).json({
                success: false,
                error: 'Invalid campaign parameters. Required: industry, budget',
            });
        }

        // Predict ROI using AI
        const result = await predictROI(campaignParameters);

        return res.status(200).json({
            success: true,
            data: {
                predictedROI: result.predictedROI,
                confidenceLevel: result.confidenceLevel,
                confidenceScore: result.confidenceScore,
                projectedMetrics: result.projectedMetrics,
                breakdown: result.breakdown,
                optimizations: result.optimizations,
                risks: result.risks,
                recommendations: result.recommendations,
                timelineProjection: result.timelineProjection,
            },
        });
    } catch (error) {
        console.error('ROI prediction error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
}
