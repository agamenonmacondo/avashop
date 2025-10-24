'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || null;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold font-headline">
            ¡Pedido Realizado con Éxito!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg text-muted-foreground mb-6">
            {orderId 
              ? `Gracias por tu compra. Tu pedido con ID ${orderId} ha sido recibido y está siendo procesado.`
              : `Gracias por tu compra. Tu pedido ha sido recibido y está siendo procesado.`
            }
            <br />
            Te enviaremos una confirmación por correo electrónico pronto.
          </CardDescription>
          {loading && <div className="my-6">Cargando resumen de tu compra...</div>}
          {order && (
            <div className="my-6 text-left">
              <div className="font-semibold mb-2">Resumen de tu compra:</div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left">Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td>${item.price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between"><span>Subtotal:</span><span>${order.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>IVA:</span><span>${order.iva?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Envío:</span><span>${order.envio?.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-lg mt-2"><span>Total pagado:</span><span>${order.total?.toLocaleString()}</span></div>
              <div className="mt-4">
                <div className="font-semibold">Enviado a:</div>
                <div>{order.shipping?.name}</div>
                <div>{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.country}</div>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Estado del pago:</span> {order.status}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="transition-transform hover:scale-105 active:scale-95">
              <Link href="/dashboard">Ver Mis Pedidos</Link>
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
