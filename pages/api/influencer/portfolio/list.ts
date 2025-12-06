import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { influencerId } = req.query;

    if (!influencerId || typeof influencerId !== 'string') {
        return res.status(400).json({ error: 'Influencer ID is required' });
    }

    try {
        const q = query(
            collection(db, 'influencer_portfolios'),
            where('influencerId', '==', influencerId),
            orderBy('createdAt', 'desc'),
            // REQUIRES COMPOSITE INDEX: influencerId (ASC) + createdAt (DESC)
            limit(5)
        );

        const querySnapshot = await getDocs(q);
        const portfolioItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() // Convert Timestamp to string
        }));

        return res.status(200).json({ portfolioItems });
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
}
