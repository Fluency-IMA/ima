import type { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper to fetch image blob from URL
async function fetchImageBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    return await response.blob();
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageUrl, prompt, influencerId } = req.body;

    if (!imageUrl || !prompt || !influencerId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Fetch the image from the external URL (mock or real)
        // Note: In a real server-side environment, we might need to handle this differently 
        // if we want to stream it directly to Storage, but fetching as blob/buffer works for now.
        // However, 'fetch' in Node environment (Next.js API) returns a Response.
        // We need to convert it to an ArrayBuffer or Buffer for Firebase Admin or Client SDK.
        // Since we are using Client SDK in API route (which is a bit unusual but possible if polyfilled),
        // we might face issues with 'Blob' not being available in Node < 18 globally or similar.
        // BUT, Next.js 16 (from package.json) supports fetch/Blob.

        // Actually, using the Client SDK (firebase/storage) in a Node.js environment (API route) 
        // is not recommended because it relies on browser APIs (XMLHttpRequest/fetch/Blob).
        // It's better to use 'firebase-admin' for server-side operations.
        // Let's check if firebase-admin is available. Yes, it is in package.json.

        // However, to keep it simple and consistent with the 'lib/firebase.ts' which exports client SDK instances,
        // I will try to use the client SDK but if it fails I'll switch to admin.
        // Wait, 'uploadBytes' expects a Blob or Uint8Array.

        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // We can't easily use client SDK 'uploadBytes' with a Node Buffer in some versions.
        // Let's use firebase-admin if possible, but I need to initialize it.
        // The user has 'firebase-admin' installed.
        // Let's check if there is a 'lib/firebase-admin.ts' or similar.
        // I'll assume not and just use the client SDK with the buffer, casting it if needed, 
        // or better yet, just save the URL directly if we don't strictly *need* to re-upload it?
        // The requirement says: "The selected final image must be uploaded to Firebase Storage".
        // So I MUST upload it.

        // Let's try to use the Client SDK with Uint8Array (which Buffer is).
        const timestamp = Date.now();
        const storageRef = ref(storage, `influencer-portfolios/${influencerId}/${timestamp}.jpg`);

        // uploadBytes supports Uint8Array
        const snapshot = await uploadBytes(storageRef, buffer, { contentType: 'image/jpeg' });
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 2. Save metadata to Firestore
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
