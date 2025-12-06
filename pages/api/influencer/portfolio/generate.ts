import type { NextApiRequest, NextApiResponse } from 'next';
import { NanoBananaService } from '../../../../services/nano-banana';
import { auth } from '../../../../lib/firebase-admin';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        await auth.verifyIdToken(token);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
        return res.status(400).json({ error: 'Prompt is required and must be at least 3 characters' });
    }

    try {
        const images = await NanoBananaService.generateImages(prompt);
        return res.status(200).json({ images });
    } catch (error) {
        console.error('Error generating images:', error);
        return res.status(500).json({ error: 'Failed to generate images' });
    }
}
