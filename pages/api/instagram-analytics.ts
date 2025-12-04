import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateInfluencerAnalytics, InfluencerAnalytics } from '../../services/instagram-api';

type ResponseData = {
    success: boolean;
    data?: InfluencerAnalytics;
    error?: string;
};

/**
 * API Route: /api/instagram-analytics
 * 
 * Calculates Instagram influencer analytics including average views
 * 
 * Method: POST
 * Body: {
 *   accessToken: string (required) - Instagram Graph API access token
 *   accountId?: string (optional) - Instagram Business Account ID
 *   postsToAnalyze?: number (optional) - Number of recent posts to analyze (default: 25)
 * }
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { accessToken, accountId, postsToAnalyze = 25 } = req.body;

        // Validate required fields
        if (!accessToken) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: accessToken'
            });
        }

        // Validate postsToAnalyze is a reasonable number
        const numPosts = Math.min(Math.max(parseInt(postsToAnalyze), 1), 100);

        // Calculate analytics
        const analytics = await calculateInfluencerAnalytics(
            accessToken,
            accountId || undefined,
            numPosts
        );

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Instagram Analytics API Error:', error);

        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to calculate analytics'
        });
    }
}
