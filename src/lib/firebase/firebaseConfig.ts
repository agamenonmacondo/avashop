// src/lib/firebase/firebaseConfig.ts
// IMPORTANT: Replace with your actual Firebase project configuration values.
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration (Config option)

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Inicialización solo en cliente (evita build-time)
let app: any = null;
export function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (!app) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export const auth = getFirebaseApp() ? getAuth(getFirebaseApp()) : null;
export const db = getFirebaseApp() ? getFirestore(getFirebaseApp()) : null;
export const storage = getFirebaseApp() ? getStorage(getFirebaseApp()) : null;

export default getFirebaseApp;
