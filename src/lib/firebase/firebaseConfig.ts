// src/lib/firebase/firebaseConfig.ts
// IMPORTANT: Replace with your actual Firebase project configuration values.
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration (Config option)

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage as getStorageService, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

let _app: any = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let storage: FirebaseStorage | null = null;

function ensureInitialized() {
  if (!firebaseConfig.apiKey) return;
  if (!getApps().length) _app = initializeApp(firebaseConfig);
  else _app = getApp();
  if (!auth) auth = getAuth(_app);
  if (!db) db = getFirestore(_app);
  if (!storage) storage = getStorageService(_app);
}

/**
 * Getter seguro: inicializa en runtime y devuelve Auth o null.
 */
export function getFirebaseAuth(): Auth | null {
  try {
    ensureInitialized();
    return auth;
  } catch {
    return null;
  }
}

export default getFirebaseAuth;
