import type { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
        decodedToken = await getAuth().verifyIdToken(token);
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
        const storageRef = ref(storage, `influencer-portfolios/${influencerId}/${timestamp}.jpg`);

        const snapshot = await uploadBytes(storageRef, buffer, { contentType: 'image/jpeg' });
        const downloadURL = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(collection(db, 'influencer_portfolios'), {
            influencerId,
            originalPrompt: prompt,
            imageUrl: downloadURL,
            createdAt: serverTimestamp(),
        });

        return res.status(200).json({ success: true, id: docRef.id, imageUrl: downloadURL });

    } catch (error) {
        console.error('Error saving portfolio item:', error);
        return res.status(500).json({ error: 'Failed to save portfolio item' });
    }
}
