import type { NextApiRequest, NextApiResponse } from 'next';
import { db, storage, auth } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
    let decodedToken;

    try {
        decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { imageUrl, prompt, influencerId } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        return res.status(400).json({ error: 'Valid Image URL is required' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
        return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (!influencerId || typeof influencerId !== 'string') {
        return res.status(400).json({ error: 'Influencer ID is required' });
    }

    // Ensure user is saving to their own portfolio
    if (decodedToken.uid !== influencerId) {
        return res.status(403).json({ error: 'Forbidden: You can only save to your own portfolio' });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(400).json({
                error: `Failed to fetch image: ${response.status} ${response.statusText}`
            });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).json({ error: 'URL does not point to a valid image' });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const timestamp = Date.now();
        const filePath = `influencer-portfolios/${influencerId}/${timestamp}.jpg`;
        const bucket = storage.bucket();
        const file = bucket.file(filePath);

        await file.save(buffer, {
            metadata: { contentType: 'image/jpeg' }
        });

        // Make the file public to get a URL
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        // Add document to Firestore
        const docRef = await db.collection('influencer_portfolios').add({
            influencerId,
            originalPrompt: prompt,
            imageUrl: publicUrl,
            createdAt: FieldValue.serverTimestamp(),
        });

        return res.status(200).json({ success: true, id: docRef.id, imageUrl: publicUrl });

    } catch (error) {
        console.error('Error saving portfolio item:', error);
        return res.status(500).json({ error: 'Failed to save portfolio item' });
    }
}
