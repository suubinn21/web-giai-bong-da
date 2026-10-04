import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBefArRNbcnvO6Kr55PPAT3jM7I1jONayQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "itftms-bongda-76d1b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "itftms-bongda-76d1b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "itftms-bongda-76d1b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "706078304178",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:706078304178:web:a252585fa1694e2301e6ab",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Q6B6JYZVT8"
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;
