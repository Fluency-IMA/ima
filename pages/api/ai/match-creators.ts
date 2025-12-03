/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Endpoint: Smart Creator Matching
 * POST /api/ai/match-creators
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../../../lib/admin';
import { findCreatorMatches, BrandRequirements } from '../../../services/ai-matching';
import { CreatorProfile } from '../../../services/ai-creator-vetting';
import { CreatorAudienceData } from '../../../services/ai-audience-analysis';

interface MatchCreatorsRequest {
    brandRequirements: BrandRequirements;
    availableCreators: (CreatorProfile & { audienceData?: CreatorAudienceData })[];
}

interface MatchCreatorsResponse {
    success: boolean;
    data?: {
        matches: Array<{
            creatorId: string;
            username: string;
            platform: string;
            compatibilityScore: number;
            matchReasons: string[];
            estimatedReach: number;
            estimatedEngagement: number;
            estimatedROI: number;
            pricingEstimate: { min: number; max: number };
            strengths: string[];
            considerations: string[];
        }>;
        totalAnalyzed: number;
    };
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<MatchCreatorsResponse>
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
        const { brandRequirements, availableCreators } = req.body as MatchCreatorsRequest;

        if (!brandRequirements || !brandRequirements.industry || !brandRequirements.budget) {
            return res.status(400).json({
                success: false,
                error: 'Invalid brand requirements. Required: industry, budget',
            });
        }

        if (!availableCreators || !Array.isArray(availableCreators) || availableCreators.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No creators provided for matching',
            });
        }

        // Find matches using AI
        const result = await findCreatorMatches(brandRequirements, availableCreators);

        return res.status(200).json({
            success: true,
            data: {
                matches: result.matches,
                totalAnalyzed: result.totalAnalyzed,
            },
        });
    } catch (error) {
        console.error('Creator matching error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
}
