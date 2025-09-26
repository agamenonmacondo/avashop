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
import { Mail, Lock, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { auth } from '@/lib/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], 
});

// Simple SVG for Google Icon (can be moved to a shared utility if used elsewhere)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#EA4335" d="M24 9.5c3.266 0 5.978 1.12 7.983 3.008l-2.475 2.396C28.196 13.405 26.334 12.5 24 12.5c-4.734 0-8.726 3.07-10.15 7.172l-2.67-2.083C13.034 13.09 18.082 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.156 24.488c0-1.508-.134-2.965-.396-4.348H24v8.17h12.43c-.523 2.69-2.035 4.836-4.34 6.383l2.677 2.09c2.208-2.03,3.748-5.07,3.748-8.734c0-.79-.08-1.552-.23-2.262z"/>
    <path fill="#34A853" d="M13.85 31.328c1.424 4.102 5.416 7.172 10.15 7.172c2.804 0 5.218-.932 6.955-2.525l-2.67-2.083c-.984.66-2.278 1.045-3.785 1.045c-2.996 0-5.58-1.604-6.885-3.81l-2.67 2.083c1.53 2.915 4.726 4.92 8.385 4.92c2.713 0 5.107-.884 6.885-2.44l2.67 2.083c-2.25 2.103-5.39 3.357-8.855 3.357c-5.942 0-10.99-3.515-13.082-8.583z"/>
    <path fill="#FBBC05" d="M13.85 19.672c-.42-.984-.655-2.04-.655-3.172s.234-2.188.655-3.172L11.18 11.24C10.06 13.658 9.5 16.275 9.5 19c0 2.725.56 5.342 1.68 7.76l2.67-2.088z"/>
  </svg>
);


export default function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Error de Configuración",
        description: "El servicio de autenticación no está disponible. Inténtalo de nuevo más tarde.",
        variant: 'destructive',
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      toast({
        title: "Registro/Inicio de Sesión con Google Exitoso",
        description: `¡Bienvenido, ${user.displayName || user.email}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error during Google sign in:", error);
      let errorMessage = "Ocurrió un error al iniciar sesión con Google.";
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Ya existe una cuenta con este correo electrónico usando un método de inicio de sesión diferente.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "El proceso de inicio de sesión con Google fue cancelado.";
        toast({ title: "Proceso Cancelado", description: errorMessage });
        return;
      }
      toast({
        title: "Error de Inicio de Sesión con Google",
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({
        title: "Error de Configuración",
        description: "El servicio de autenticación no está disponible. Inténtalo de nuevo más tarde.",
        variant: 'destructive',
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: values.name,
        });
      }
      toast({
        title: "Registro Exitoso",
        description: "¡Bienvenido a GigaGO! Serás redirigido.",
      });
      router.push('/dashboard'); 
    } catch (error: any) {
      console.error("Error during sign up:", error);
      let errorMessage = "Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil.";
      }
      toast({
        title: "Error de Registro",
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-xl">Regístrate</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Ej: Ana Pérez" {...field} className="pl-10" disabled={form.formState.isSubmitting}/>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="tu@ejemplo.com" {...field} className="pl-10" disabled={form.formState.isSubmitting}/>
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
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" disabled={form.formState.isSubmitting}/>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" disabled={form.formState.isSubmitting}/>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
        </Form>
        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">O REGISTRARSE CON</span>
          <Separator className="flex-1" />
        </div>
        <Button variant="outline" className="w-full transition-transform hover:scale-105 active:scale-95" onClick={handleGoogleSignIn} disabled={form.formState.isSubmitting}>
           <GoogleIcon /> <span className="ml-2">Continuar con Google</span>
        </Button>
      </CardContent>
       <CardFooter className="flex flex-col items-center text-xs text-muted-foreground">
          <p className="text-center text-xs">Al registrarte, aceptas nuestros Términos y Política de Privacidad.</p>
      </CardFooter>
    </Card>
  );
}
