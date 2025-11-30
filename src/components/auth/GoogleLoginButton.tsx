'use client';

import { Button } from '@/components/ui/button';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { syncUserProfile } from '@/lib/auth/syncUserProfile'; // ✅ Importar

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

export default function GoogleLoginButton({ text = "Continuar con Google", className }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // ✅ AQUÍ GUARDAMOS EL PERFIL EN LA BASE DE DATOS
      await syncUserProfile(result.user);

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${result.user.displayName || 'Usuario'}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error en login con Google:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión con Google.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" className={`w-full ${className}`} onClick={handleGoogleLogin}>
      <GoogleIcon />
      {text}
    </Button>
  );
}