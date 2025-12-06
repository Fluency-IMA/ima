import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import path from 'path';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    try {
        const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
        const serviceAccount = require(serviceAccountPath);
        initializeApp({
            credential: cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

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
        decodedToken = await getAuth().verifyIdToken(token);
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
