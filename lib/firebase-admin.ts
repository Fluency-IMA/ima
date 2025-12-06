import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';

let app: App;

if (!getApps().length) {
    try {
        const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

        // Ensure environment variables are loaded if needed, though they should be available in Next.js API routes
        // Check if service account file exists or use environment variable strategy if preferred globally
        // For now, sticking to the existing pattern of reading the file

        app = initializeApp({
            credential: cert(serviceAccountPath), // cert can verify path or object
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        throw new Error('Failed to initialize Firebase Admin');
    }
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
