import type { NextApiRequest, NextApiResponse } from 'next';
import { generateStructuredResponse } from '../../lib/gemini';

type AnalysisRequest = {
    action: 'analyze';
    criteria: {
        businessName: string;
        productDescription: string;
        goals: string;
    };
};

type GenerateRequest = {
    action: 'generate_candidates';
    analysis: {
        niche: string;
        keywords: string[];
        targetAudience: string;
        idealInfluencerPersona: string;
    };
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action } = req.body;

    try {
        if (action === 'analyze') {
            const { criteria } = req.body as AnalysisRequest;

            const prompt = `
                Analyze the following business to identify the best influencer marketing strategy:
                Business Name: ${criteria.businessName}
                Product/Service: ${criteria.productDescription}
                Goals: ${criteria.goals}

                Provide a structured analysis including:
                1. The specific niche (e.g., "Sustainable Fashion", "Tech Gadgets").
                2. 5-7 relevant hashtags/keywords.
                3. Description of the target audience.
                4. A persona of the ideal influencer (e.g., "Eco-conscious lifestyle vlogger, 25-35, focuses on minimalism").
            `;

            const schema = `{
                "niche": "string",
                "keywords": ["string"],
                "targetAudience": "string",
                "idealInfluencerPersona": "string"
            }`;

            const analysis = await generateStructuredResponse(prompt, schema, {
                modelType: 'flash',
                temperature: 0.4
            });

            return res.status(200).json(analysis);
        }

        if (action === 'generate_candidates') {
            const { analysis } = req.body as GenerateRequest;

            const prompt = `
                Based on this influencer persona, list 20-30 REAL Instagram usernames of influencers who fit this description.
                
                Niche: ${analysis.niche}
                Persona: ${analysis.idealInfluencerPersona}
                Keywords: ${analysis.keywords.join(', ')}

                Rules:
                - Provide ONLY the usernames (no @ symbol).
                - Focus on a mix of Micro (10k-100k) and Macro (100k-1m) influencers.
                - Ensure they are likely to be real, active accounts.
                - Do not make up fake names. Use your knowledge of real public figures/creators.
            `;

            const schema = `{
                "usernames": ["string"]
            }`;

            const result = await generateStructuredResponse<{ usernames: string[] }>(prompt, schema, {
                modelType: 'pro',
                temperature: 0.7
            });

            if (!result?.usernames || !Array.isArray(result.usernames)) {
                throw new Error('Invalid response format from AI');
            }

            // Clean usernames
            const cleanedUsernames = result.usernames
                .map(u => u.replace('@', '').trim())
                .filter(u => u.length > 0);

            return res.status(200).json(cleanedUsernames);
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
        console.error('AI Discovery API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


