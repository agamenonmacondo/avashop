import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from './firebaseConfig';

/**
 * Envía un correo electrónico de recuperación de contraseña
 * @param email - Correo electrónico del usuario
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado');
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`, // URL de redirección después de resetear
      handleCodeInApp: false,
    });
  } catch (error: any) {
    console.error('Error enviando email de recuperación:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este correo electrónico');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Correo electrónico inválido');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Intenta más tarde');
    }
    
    throw error;
  }
}