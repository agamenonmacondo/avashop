'use client';

import { useEffect } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { syncUserProfile } from '@/lib/auth/syncUserProfile';

export default function DashboardSync() {
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔄 Verificando perfil en base de datos para:', user.email);
        syncUserProfile(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // Este componente no renderiza nada visualmente
}