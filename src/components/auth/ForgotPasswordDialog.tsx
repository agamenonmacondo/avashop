'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Mail, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';

const formSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
});

export default function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const auth = getFirebaseAuth();
    if (!auth) {
      toast({
        title: 'Error',
        description: 'Autenticación no disponible.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, values.email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      
      setEmailSent(true);
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    } catch (error: any) {
      console.error('Error:', error);
      
      let message = 'No se pudo enviar el correo de recuperación.';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Correo electrónico inválido';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Intenta más tarde';
      }
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }

  const handleClose = () => {
    setOpen(false);
    setEmailSent(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs p-0 h-auto text-primary">
          ¿Olvidaste tu contraseña?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Correo enviado!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Button onClick={handleClose} className="w-full">
              Entendido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}