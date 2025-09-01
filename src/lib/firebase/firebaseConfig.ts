// src/lib/firebase/firebaseConfig.ts
// IMPORTANT: Replace with your actual Firebase project configuration values.
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration (Config option)

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

let _auth: Auth | null = null;

/**
 * Devuelve Auth sólo en runtime (cliente). Retorna null si falta config (evita crash en build).
 */
export function getFirebaseAuth(): Auth | null {
  if (!firebaseConfig.apiKey) return null;
  if (!getApps().length) initializeApp(firebaseConfig);
  if (!_auth) _auth = getAuth();
  return _auth;
}

// Export por defecto para compatibilidad con imports que usan default
export default getFirebaseAuth;
