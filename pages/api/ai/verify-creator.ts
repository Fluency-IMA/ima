/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Endpoint: Creator Verification
 * POST /api/ai/verify-creator
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../../../lib/admin';
import { verifyCreator, CreatorProfile } from '../../../services/ai-creator-vetting';

interface VerifyCreatorRequest {
    creator: CreatorProfile;
}

interface VerifyCreatorResponse {
    success: boolean;
    data?: {
        authenticityScore: number;
        recommendation: string;
        redFlags: string[];
        analysis: {
            followerQuality: number;
            engagementAuthenticity: number;
            contentConsistency: number;
            audienceRelevance: number;
        };
        report: string;
    };
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<VerifyCreatorResponse>
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
        const { creator } = req.body as VerifyCreatorRequest;

        if (!creator || !creator.username || !creator.platform || !creator.followers) {
            return res.status(400).json({
                success: false,
                error: 'Invalid creator data. Required: username, platform, followers',
            });
        }

        // Verify creator using AI
        const result = await verifyCreator(creator);

        return res.status(200).json({
            success: true,
            data: {
                authenticityScore: result.authenticityScore,
                recommendation: result.recommendation,
                redFlags: result.redFlags,
                analysis: result.analysis,
                report: result.report,
            },
        });
    } catch (error) {
        console.error('Creator verification error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
}
