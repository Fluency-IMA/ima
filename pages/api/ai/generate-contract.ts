import type { NextApiRequest, NextApiResponse } from 'next';
import { generateContract, ContractDetails } from '../../../services/ai-legal';

interface GenerateContractResponse {
    success: boolean;
    contract?: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GenerateContractResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const details = req.body as ContractDetails;

        // Basic validation
        if (!details.clientName || !details.influencerName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: clientName and influencerName are mandatory.'
            });
        }

        const contract = await generateContract(details);

        return res.status(200).json({
            success: true,
            contract,
        });
    } catch (error) {
        console.error('Contract generation error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
}
