'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderData {
  orderId: string;
  status: string;
  total: number;
  subtotal: number;
  iva: number;
  envio: number;
  items: OrderItem[];
  shipping: any;
  createdAt: string;
  paidAt?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || null;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando orden:', err);
        setError(true);
        setLoading(false);
      });
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-3xl font-bold font-headline">
              ¡Pedido Realizado con Éxito!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {orderId 
                ? `Tu pedido #${orderId} ha sido recibido y está siendo procesado.`
                : `Tu pedido ha sido recibido y está siendo procesado.`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Cargando resumen de tu compra...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No pudimos cargar los detalles de tu pedido, pero tu compra fue procesada correctamente.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Te enviaremos una confirmación por correo electrónico pronto.
                </p>
              </div>
            )}

            {!loading && !error && order && (
              <div className="space-y-6">
                {/* Productos comprados */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Productos comprados:</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Producto</th>
                          <th className="text-center p-3 font-medium">Cantidad</th>
                          <th className="text-right p-3 font-medium">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{item.name}</td>
                            <td className="text-center p-3">{item.quantity}</td>
                            <td className="text-right p-3">{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Separator />

                {/* Resumen de costos */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (18%):</span>
                    <span>{formatCurrency(order.iva)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío:</span>
                    <span>{order.envio === 0 ? 'Gratis' : formatCurrency(order.envio)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total pagado:</span>
                    <span className="text-green-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <Separator />

                {/* Información de envío */}
                {order.shipping && Object.keys(order.shipping).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Información de envío:</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                      {order.shipping.name && <p className="font-medium">{order.shipping.name}</p>}
                      {order.shipping.address && <p>{order.shipping.address}</p>}
                      {order.shipping.city && order.shipping.country && (
                        <p>{order.shipping.city}, {order.shipping.country}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Estado del pago */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Estado del pago:</span>{' '}
                    <span className="text-green-600 dark:text-green-400 uppercase">
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje de confirmación */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm text-center">
              <p className="text-blue-800 dark:text-blue-200">
                📧 Te enviaremos una confirmación por correo electrónico pronto.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/dashboard">Ver Mis Pedidos</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="flex-1">
                <Link href="/">Continuar Comprando</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
