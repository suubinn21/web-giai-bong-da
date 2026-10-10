import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';

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

// Khởi tạo Firestore với cấu hình Auto-Detect Long Polling
// Giúp tự động nhận diện và chuyển sang Long Polling trên các mạng di động (3G/4G/5G)
// hoặc trình duyệt Safari/iOS khi kết nối streaming WebChannel bị hạn chế
let dbInstance: Firestore;
try {
  if (typeof window !== 'undefined') {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } else {
    dbInstance = getFirestore(app);
  }
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export default app;

