"use client";

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    if (!auth) {
      setAuthState({
        user: null,
        loading: false,
        error: new Error('Firebase Auth not initialized'),
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          loading: false,
          error,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return authState;
}