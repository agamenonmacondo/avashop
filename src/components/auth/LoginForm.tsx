'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
    <path fill="#EA4335" d="M24 9.5c3.266 0 5.978 1.12 7.983 3.008l-2.475 2.396C28.196 13.405 26.334 12.5 24 12.5c-4.734 0-8.726 3.07-10.15 7.172l-2.67-2.083C13.034 13.09 18.082 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.156 24.488c0-1.508-.134-2.965-.396-4.348H24v8.17h12.43c-.523 2.69-2.035 4.836-4.34 6.383l2.677 2.09c2.208-2.03 3.748-5.07 3.748-8.734c0-.79-.08-1.552-.23-2.262z"/>
    <path fill="#34A853" d="M13.85 31.328c1.424 4.102 5.416 7.172 10.15 7.172c2.804 0 5.218-.932 6.955-2.525l-2.67-2.083c-.984.66-2.278 1.045-3.785 1.045c-2.996 0-5.58-1.604-6.885-3.81l-2.67 2.083c1.53 2.915 4.726 4.92 8.385 4.92c2.713 0 5.107-.884 6.885-2.44l2.67 2.083c-2.25 2.103-5.39 3.357-8.855 3.357c-5.942 0-10.99-3.515-13.082-8.583z"/>
    <path fill="#FBBC05" d="M13.85 19.672c-.42-.984-.655-2.04-.655-3.172s.234-2.188.655-3.172L11.18 11.24C10.06 13.658 9.5 16.275 9.5 19c0 2.725.56 5.342 1.68 7.76l2.67-2.088z"/>
  </svg>
);

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({ title: 'Error', description: 'Autenticación no disponible.', variant: 'destructive' });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Email sign in error', error);
      const message = error?.message || 'Ocurrió un error al iniciar sesión';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({ title: 'Error', description: 'Autenticación no disponible.', variant: 'destructive' });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Inicio con Google exitoso' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google sign in error full:', error);
      // Mostrar código y mensaje en consola y toast
      const code = error?.code || 'unknown';
      const message = error?.message || 'Ocurrió un error desconocido';
      console.error('Google sign in error code:', code, 'message:', message);

      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        toast({ title: 'Acceso bloqueado', description: 'El popup de Google fue bloqueado o cerrado. Intentando redirigir...', variant: 'destructive' });
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error('Redirect fallback error', redirectErr);
          toast({ title: 'Error', description: 'No se pudo iniciar sesión con Google.', variant: 'destructive' });
          return;
        }
      }

      if (code === 'auth/unauthorized-domain') {
        toast({ title: 'Dominio no autorizado', description: 'Añade tu origen en Firebase Auth → Authorized domains.', variant: 'destructive' });
        return;
      }

      if (code === 'auth/operation-not-allowed') {
        toast({ title: 'Proveedor deshabilitado', description: 'Habilita Google en Firebase Console → Authentication → Sign-in method.', variant: 'destructive' });
        return;
      }

      if (code === 'auth/account-exists-with-different-credential') {
        toast({ title: 'Cuenta existente', description: 'Ya existe una cuenta con este correo usando otro método.', variant: 'destructive' });
        return;
      }

      // fallback
      toast({ title: 'Error de Google', description: message, variant: 'destructive' });
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader><CardTitle className="text-center text-xl">Iniciar Sesión</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="tu@ejemplo.com" {...field} className="pl-10" disabled={form.formState.isSubmitting} /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input type="password" placeholder="••••••••" {...field} className="pl-10" disabled={form.formState.isSubmitting} /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <Separator className="flex-1" /><span className="mx-4 text-xs text-muted-foreground">O CONTINUAR CON</span><Separator className="flex-1" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={form.formState.isSubmitting}>
          <GoogleIcon /> <span className="ml-2">Iniciar sesión con Google</span>
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-xs text-muted-foreground">
        <Button variant="link" className="text-xs p-0 h-auto mt-2">¿Olvidaste tu contraseña?</Button>
      </CardFooter>
    </Card>
  );
}
