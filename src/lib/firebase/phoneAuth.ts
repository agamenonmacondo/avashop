import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  type ConfirmationResult,
  type Auth
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseConfig';

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Inicializa el reCAPTCHA invisible en el contenedor especificado
 */
export function initializeRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier | null {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.error('Firebase Auth no está inicializado');
    return null;
  }

  try {
    // Limpia el verificador anterior si existe
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA resuelto');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expirado');
      }
    });

    return recaptchaVerifier;
  } catch (error) {
    console.error('Error inicializando reCAPTCHA:', error);
    return null;
  }
}

/**
 * Envía un código SMS al número de teléfono especificado
 * @param phoneNumber - Número en formato internacional (+57...)
 */
export async function sendPhoneVerification(phoneNumber: string): Promise<ConfirmationResult | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado');
  }

  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA no inicializado. Llama primero a initializeRecaptcha()');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error enviando código SMS:', error);
    
    // Manejo de errores comunes
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Número de teléfono inválido');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Intenta más tarde');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('Cuota de SMS excedida');
    }
    
    throw error;
  }
}

/**
 * Verifica el código SMS ingresado por el usuario
 */
export async function verifyPhoneCode(confirmationResult: ConfirmationResult, code: string) {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error: any) {
    console.error('Error verificando código:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Código inválido');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('El código ha expirado');
    }
    
    throw error;
  }
}

/**
 * Limpia el reCAPTCHA (útil al desmontar el componente)
 */
export function cleanupRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}