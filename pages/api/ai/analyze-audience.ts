/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Endpoint: Audience Analysis
 * POST /api/ai/analyze-audience
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../../../lib/admin';
import { analyzeAudience, CreatorAudienceData } from '../../../services/ai-audience-analysis';

interface AnalyzeAudienceRequest {
    audienceData: CreatorAudienceData;
}

interface AnalyzeAudienceResponse {
    success: boolean;
    data?: {
        demographics: {
            ageRanges: Record<string, number>;
            genderSplit: Record<string, number>;
            topLocations: { country: string; percentage: number }[];
            interests: string[];
        };
        brandFitScores: Record<string, number>;
        audienceQuality: {
            engagementLevel: string;
            purchasingPower: string;
            brandAffinity: number;
        };
        insights: string;
    };
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AnalyzeAudienceResponse>
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
        const { audienceData } = req.body as AnalyzeAudienceRequest;

        if (!audienceData || !audienceData.creatorId || !audienceData.platform) {
            return res.status(400).json({
                success: false,
                error: 'Invalid audience data. Required: creatorId, platform',
            });
        }

        // Analyze audience using AI
        const result = await analyzeAudience(audienceData);

        return res.status(200).json({
            success: true,
            data: {
                demographics: result.demographics,
                brandFitScores: result.brandFitScores,
                audienceQuality: result.audienceQuality,
                insights: result.insights,
            },
        });
    } catch (error) {
        console.error('Audience analysis error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
}
