import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <Link href="/" className="inline-block mb-4">
            <span className="font-bold text-3xl font-headline">AVA Shop</span>
          </Link>
          <h2 className="text-2xl font-semibold text-foreground">Crear una Cuenta</h2>
          <p className="text-muted-foreground">Únete a AVA Shop hoy para empezar.</p>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Button variant="link" asChild className="text-primary p-0 h-auto">
            <Link href="/login">Inicia sesión</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
