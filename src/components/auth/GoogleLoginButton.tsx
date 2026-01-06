'use client';

import { useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { syncUserProfile } from '@/lib/auth/syncUserProfile';


const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13.5v6l5.25 3.15.75-1.23-4.5-2.67V8.5H11z"
    />
  </svg>
);

interface GoogleLoginButtonProps {
  className?: string;
  text?: string;
  redirectTo?: string;
}

export default function GoogleLoginButton({ 
  className = '', 
  text = 'Continuar con Google',
  redirectTo
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      toast({
        title: 'Error',
        description: 'Firebase no está configurado correctamente.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente con Google.',
      });

      // Prioridad: prop redirectTo > sessionStorage > /dashboard
      let destination = redirectTo;
      if (!destination) {
        destination = sessionStorage.getItem('authRedirect') || '/dashboard';
        sessionStorage.removeItem('authRedirect');
      }
      router.push(destination);
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar sesión con Google.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span>{loading ? 'Cargando...' : text}</span>
    </button>
  );
}