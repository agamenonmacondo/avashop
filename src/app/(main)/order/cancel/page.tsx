'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || 'N/A';

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Pago Cancelado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            El pago ha sido cancelado. Tu pedido no se ha procesado.
          </p>
          {orderId !== 'N/A' && (
            <p className="text-sm text-muted-foreground">
              Orden: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button asChild variant="outline">
              <Link href="/cart">Volver al Carrito</Link>
            </Button>
            <Button asChild>
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CancelLoading() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<CancelLoading />}>
      <CancelContent />
    </Suspense>
  );
}
