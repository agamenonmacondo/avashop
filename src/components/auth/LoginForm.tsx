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
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import GoogleLoginButton from './GoogleLoginButton';
import { syncUserProfile } from '@/lib/auth/syncUserProfile';

const formSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const auth = getFirebaseAuth();
    if (!auth) {
      toast({ title: 'Error', description: 'Autenticación no disponible.', variant: 'destructive' });
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await syncUserProfile(userCredential.user, false);

      toast({ 
        title: 'Inicio de sesión exitoso', 
        description: 'Bienvenido de vuelta.' 
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
      let message = 'Ocurrió un error al iniciar sesión';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Correo o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Intenta más tarde';
      }
      
      toast({ 
        title: 'Error de inicio de sesión', 
        description: message, 
        variant: 'destructive' 
      });
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-xl">Iniciar Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleLoginButton disabled={form.formState.isSubmitting} isNewUser={false} />

        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground uppercase">O continuar con email</span>
          <Separator className="flex-1" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
              control={form.control} 
              name="email" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        placeholder="tu@ejemplo.com" 
                        {...field} 
                        className="pl-10" 
                        disabled={form.formState.isSubmitting} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField 
              control={form.control} 
              name="password" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="pl-10" 
                        disabled={form.formState.isSubmitting} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full transition-transform hover:scale-105" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-center text-xs text-muted-foreground">
        <ForgotPasswordDialog />
      </CardFooter>
    </Card>
  );
}
