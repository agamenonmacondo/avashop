'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email';

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
  
  const orderId = searchParams?.get('bold-order-id') || searchParams?.get('order_id') || null;
  const txStatus = searchParams?.get('bold-tx-status') || 'approved';
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Función para enviar correo de confirmación
  const sendConfirmationEmail = async (orderData: OrderData) => {
    const customerEmail = orderData.shipping?.email;
    
    if (!customerEmail) {
      console.warn('⚠️ No se encontró email del cliente');
      return;
    }

    if (!orderData.items || orderData.items.length === 0) {
      console.warn('⚠️ No hay items en el pedido');
      return;
    }

    setSendingEmail(true);
    console.log('📧 Enviando correo de confirmación a:', customerEmail);

    try {
      const html = getOrderConfirmationEmail({
        orderId: orderData.orderId,
        customerName: orderData.shipping?.fullName || 'Cliente',
        items: orderData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: orderData.total,
      });

      await sendEmail({
        to: customerEmail,
        subject: `✅ Confirmación de Pedido #${orderData.orderId} - CCS724`,
        html,
      });

      console.log('✅ Correo de confirmación enviado exitosamente');
      setEmailSent(true);
    } catch (error) {
      console.error('❌ Error enviando correo de confirmación:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      console.warn('⚠️ No se encontró order_id en la URL');
      setLoading(false);
      return;
    }

    console.log('🔍 [SUCCESS] Cargando orden:', orderId, '- Estado Bold:', txStatus);
    setLoading(true);

    // Actualizar estado si Bold indica aprobado
    if (txStatus === 'approved') {
      console.log('✅ [SUCCESS] Bold indica pago aprobado, actualizando estado...');
      
      fetch('/api/bold/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          status: 'approved',
          transactionDate: new Date().toISOString(),
        }),
      })
        .then(res => res.json())
        .then(webhookResult => {
          console.log('✅ [SUCCESS] Webhook ejecutado:', webhookResult);
        })
        .catch(err => {
          console.error('⚠️ [SUCCESS] Error llamando webhook:', err);
        });
    }

    // Cargar los datos de la orden
    fetch(`/api/orders/${orderId}`)
      .then(res => {
        console.log('📡 [SUCCESS] Status de respuesta:', res.status);
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        console.log('✅ [SUCCESS] Datos completos de la orden:', data);
        
        if (txStatus === 'approved' && data.status === 'pending') {
          data.status = 'approved';
        }
        
        setOrder(data);
        setLoading(false);

        // 📧 Enviar correo de confirmación automáticamente
        sendConfirmationEmail(data);
      })
      .catch(err => {
        console.error('❌ [SUCCESS] Error cargando orden:', err);
        setError(true);
        setLoading(false);
      });
  }, [orderId, txStatus]);

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
                <p className="text-muted-foreground mb-4">
                  No pudimos cargar los detalles de tu pedido, pero tu compra fue procesada correctamente.
                </p>
                {orderId && (
                  <div className="bg-muted p-4 rounded-lg inline-block">
                    <p className="text-sm font-mono">
                      <strong>Referencia:</strong> {orderId}
                    </p>
                    <p className="text-sm font-mono mt-1">
                      <strong>Estado:</strong> <span className="text-green-600">{txStatus}</span>
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  Te enviaremos una confirmación por correo electrónico pronto.
                </p>
              </div>
            )}

            {/* Estado del envío de correo */}
            {!loading && !error && order && (
              <>
                {sendingEmail && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Enviando confirmación por correo electrónico...
                    </p>
                  </div>
                )}

                {emailSent && (
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-center gap-3">
                    <MailCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✅ Correo de confirmación enviado
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Revisa tu bandeja de entrada: {order.shipping?.email}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Renderizar items */}
            {!loading && !error && order && (
              <div className="space-y-6">
                {order.items && order.items.length > 0 ? (
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
                              <td className="text-right p-3">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Los detalles de los productos se están procesando. Recibirás la información completa por correo.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Resumen de costos */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span>{formatCurrency(order.iva || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío:</span>
                    <span>{order.envio === 0 ? 'Gratis' : formatCurrency(order.envio || 0)}</span>
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
                      {order.shipping.fullName && <p className="font-medium">{order.shipping.fullName}</p>}
                      {order.shipping.address && <p>{order.shipping.address}</p>}
                      {order.shipping.city && order.shipping.state && (
                        <p>{order.shipping.city}, {order.shipping.state}</p>
                      )}
                      {order.shipping.country && <p>{order.shipping.country}</p>}
                      {order.shipping.email && <p className="text-muted-foreground">{order.shipping.email}</p>}
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
                <Link href="/account/orders">Ver Mis Pedidos</Link>
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
