import type { NextApiRequest, NextApiResponse } from 'next';
import { db, auth } from '../../../../lib/firebase-admin';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
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

    const { influencerId } = req.query;

    if (!influencerId || typeof influencerId !== 'string') {
        return res.status(400).json({ error: 'Influencer ID is required' });
    }

    // Ensure user can only list their own portfolio
    if (decodedToken.uid !== influencerId) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own portfolio' });
    }

    try {
        const snapshot = await db.collection('influencer_portfolios')
            .where('influencerId', '==', influencerId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const portfolioItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Handle Firestore Timestamp to ISO string conversion
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            };
        });

        return res.status(200).json({ portfolioItems });
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
}
