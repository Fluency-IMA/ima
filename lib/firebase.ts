import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fluency-2398a.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fluency-2398a",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fluency-2398a.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "100189578936",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:100189578936:web:04e43cd1cc146087a7f64d",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Q94TQN9HBS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, auth, db, analytics, storage };
