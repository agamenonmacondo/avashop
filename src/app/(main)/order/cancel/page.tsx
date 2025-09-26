
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id'); 

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-3xl font-bold font-headline">Proceso Cancelado</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg text-muted-foreground mb-6">
            {orderId 
              ? `El proceso de pago para el pedido ${orderId} fue cancelado.`
              : "El proceso de pago fue cancelado o no se completó."}
            <br />
            Tu carrito aún conserva tus artículos si deseas intentarlo de nuevo.
          </CardDescription>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="transition-transform hover:scale-105 active:scale-95">
              <Link href="/cart">Volver al Carrito</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="transition-transform hover:scale-105 active:scale-95">
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderCancelPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CancelContent />
    </Suspense>
  );
}
