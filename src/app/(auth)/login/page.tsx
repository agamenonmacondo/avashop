import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-bold text-3xl font-headline">CCS 724</span>
          </Link>
          <h2 className="text-2xl font-semibold text-foreground">¡Bienvenido de Nuevo!</h2>
          <p className="text-muted-foreground">Inicia sesión para continuar a tu cuenta.</p>
        </div>

        {/* Solo formulario de email, sin pestañas */}
        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            ¿No tienes una cuenta?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto">
              <Link href="/signup">Regístrate</Link>
            </Button>
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a la Tienda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
