'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';

export default function PhoneLoginForm() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    // Inicializa reCAPTCHA cuando el componente se monta
    const initRecaptcha = () => {
      try {
        // Limpia cualquier instancia previa
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
        }

        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA resuelto exitosamente');
          },
          'expired-callback': () => {
            setError('reCAPTCHA expirado. Recarga la página.');
          }
        });

        // Renderiza el reCAPTCHA
        recaptchaVerifierRef.current.render().then((widgetId) => {
          recaptchaWidgetId.current = widgetId;
          console.log('reCAPTCHA renderizado con ID:', widgetId);
        });
      } catch (err) {
        console.error('Error inicializando reCAPTCHA:', err);
        setError('Error al cargar el sistema de seguridad. Recarga la página.');
      }
    };

    // Espera un momento para asegurar que el DOM esté listo
    const timer = setTimeout(initRecaptcha, 100);

    // Limpia al desmontar
    return () => {
      clearTimeout(timer);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Error de configuración. Recarga la página.');
      setLoading(false);
      return;
    }

    try {
      // Valida formato de teléfono
      if (!phoneNumber.startsWith('+')) {
        throw new Error('El número debe incluir el código de país (ej: +57...)');
      }

      if (!recaptchaVerifierRef.current) {
        throw new Error('Sistema de seguridad no inicializado. Recarga la página.');
      }

      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep('code');
    } catch (err: any) {
      console.error('Error al enviar código:', err);
      
      if (err.code === 'auth/invalid-phone-number') {
        setError('Número de teléfono inválido');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('Cuota de SMS excedida');
      } else if (err.code === 'auth/missing-recaptcha-token') {
        setError('Error de seguridad. Recarga la página e intenta nuevamente.');
      } else {
        setError(err.message || 'Error al enviar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;

    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      console.log('Usuario autenticado:', result.user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error al verificar código:', err);
      
      if (err.code === 'auth/invalid-verification-code') {
        setError('Código inválido');
      } else if (err.code === 'auth/code-expired') {
        setError('El código ha expirado. Solicita uno nuevo.');
      } else {
        setError(err.message || 'Error al verificar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Iniciar Sesión con Teléfono
        </CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Ingresa tu número de teléfono para recibir un código' 
            : 'Ingresa el código de 6 dígitos enviado a tu teléfono'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Contenedor para reCAPTCHA invisible */}
        <div id="recaptcha-container"></div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+57 300 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Incluye el código de país (ej: +57 para Colombia)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Enviar Código SMS
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificación</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verificar Código
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('phone');
                setVerificationCode('');
                setError('');
                setConfirmationResult(null);
              }}
            >
              Cambiar número de teléfono
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}