'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Loader2, MailCheck, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email';
import { trackPurchase } from '@/lib/meta-pixel';

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
  user_email?: string; // Email del usuario que realizó la orden
}

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  addresses: Array<{
    city?: string;
    state?: string;
    address?: string;
  }>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams?.get('bold-order-id') || searchParams?.get('order_id') || null;
  const txStatus = searchParams?.get('bold-tx-status') || 'approved';
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!orderId) {
      console.warn('⚠️ No se encontró order_id en la URL');
      setLoading(false);
      return;
    }

    // ✅ Función para obtener perfil del usuario desde la base de datos
    const getUserProfile = async (userEmail: string): Promise<UserProfile | null> => {
      try {
        console.log('👤 Obteniendo perfil del usuario:', userEmail);
        
        const response = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
          console.warn('⚠️ No se pudo obtener el perfil del usuario');
          return null;
        }

        const profileData = await response.json();
        console.log('✅ Perfil del usuario obtenido:', profileData);
        
        return profileData;
      } catch (error) {
        console.error('❌ Error obteniendo perfil del usuario:', error);
        return null;
      }
    };

    // ✅ Función para notificar a la empresa por WhatsApp usando datos de la BD
    const notifyCompanyWhatsApp = async (orderData: OrderData) => {
      const companyPhone = '573504017710';
      
      // Obtener datos del cliente desde shipping o desde la BD
      let customerName = orderData.shipping?.fullName || 'Cliente';
      let customerPhone = orderData.shipping?.phone || 'No proporcionado';
      let customerEmail = orderData.shipping?.email || orderData.user_email || 'No proporcionado';
      let customerAddress = orderData.shipping?.address || 'No proporcionada';
      let customerCity = orderData.shipping?.city || '';
      let customerState = orderData.shipping?.state || '';
      
      // Variable para rastrear si se usó perfil de BD
      let usedProfileData = false;

      // Si tenemos el email del usuario, intentar obtener más datos de la BD
      if (customerEmail && customerEmail !== 'No proporcionado') {
        const userProfile = await getUserProfile(customerEmail);
        
        if (userProfile) {
          // Usar datos del perfil si están disponibles
          customerName = userProfile.name || customerName;
          customerPhone = userProfile.phone || customerPhone;
          
          if (userProfile.addresses && userProfile.addresses.length > 0) {
            const primaryAddress = userProfile.addresses[0];
            customerCity = primaryAddress.city || customerCity;
            customerState = primaryAddress.state || customerState;
            customerAddress = primaryAddress.address || customerAddress;
          }
          
          usedProfileData = true;
          console.log('✅ Usando datos del perfil de la BD');
        }
      }
      
      // Construir lista de productos
      const productList = orderData.items
        .map((item, index) => `${index + 1}. ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString('es-CO')}`)
        .join('%0A');

      // Mensaje completo con resumen de la compra
      const message = 
        `🔔 *NUEVO PEDIDO* 🔔%0A%0A` +
        `📦 *Pedido:* #${orderData.orderId}%0A` +
        `📅 *Fecha:* ${new Date(orderData.createdAt).toLocaleString('es-CO')}%0A%0A` +
        `👤 *CLIENTE*%0A` +
        `Nombre: ${customerName}%0A` +
        `📧 Email: ${customerEmail}%0A` +
        `📱 Tel: ${customerPhone}%0A` +
        `📍 Dirección: ${customerAddress}%0A` +
        `${customerCity ? `Ciudad: ${customerCity}, ${customerState}%0A` : ''}%0A` +
        `🛍️ *PRODUCTOS*%0A${productList}%0A%0A` +
        `💰 *RESUMEN DE PAGO*%0A` +
        `Subtotal: $${orderData.subtotal.toLocaleString('es-CO')}%0A` +
        `IVA (19%%): $${orderData.iva.toLocaleString('es-CO')}%0A` +
        `Envío: ${orderData.envio === 0 ? 'Gratis' : '$' + orderData.envio.toLocaleString('es-CO')}%0A` +
        `*TOTAL: $${orderData.total.toLocaleString('es-CO')}*%0A%0A` +
        `✅ Estado: PAGADO%0A%0A` +
        `_Notificación automática de CCS724_`;

      // Construir URL de WhatsApp
      const whatsappUrl = `https://wa.me/${companyPhone}?text=${message}`;
      
      console.log('💬 Abriendo WhatsApp para notificar a la empresa:', companyPhone);
      console.log('📄 Datos del cliente obtenidos de:', usedProfileData ? 'Base de datos' : 'Datos de envío');
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
    };

    // ✅ Función para solicitar reseña
    const requestReview = async (orderData: OrderData) => {
      try {
        console.log('⭐ Programando solicitud de reseña...');
        
        const products = orderData.items.map(item => ({
          name: item.name,
          imageUrl: item.imageUrl
        }));

        await fetch('/api/reviews/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            userEmail: orderData.shipping?.email || orderData.user_email,
            customerName: orderData.shipping?.fullName || 'Cliente',
            products
          })
        });

        console.log('✅ Solicitud de reseña programada');
      } catch (error) {
        console.error('❌ Error programando reseña:', error);
      }
    };

    // Función para enviar correo de confirmación
    const sendConfirmationEmail = async (orderData: OrderData) => {
      const customerEmail = orderData.shipping?.email || orderData.user_email;
      
      if (!customerEmail) {
        console.warn('⚠️ No se encontró email del cliente para enviar confirmación.');
        setEmailStatus('error');
        return;
      }

      if (!orderData.items || orderData.items.length === 0) {
        console.warn('⚠️ No hay items en el pedido, no se envía correo.');
        return;
      }

      setEmailStatus('sending');
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
        setEmailStatus('sent');
      } catch (error) {
        console.error('❌ Error enviando correo de confirmación:', error);
        setEmailStatus('error');
      }
    };

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

        // Track Purchase cuando se carga la orden
        if (data.items && data.items.length > 0) {
          trackPurchase(
            data.orderId,
            data.total,
            data.items.map((item: OrderItem) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          );
        }

        // ✅ Enviar correo de confirmación automáticamente
        sendConfirmationEmail(data);

        // ✅ Notificar a la empresa por WhatsApp (con datos de la BD)
        notifyCompanyWhatsApp(data);

        // ✅ Solicitar reseña (programada)
        requestReview(data);

        // Limpiar carrito después de compra exitosa
        localStorage.removeItem('cart');
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
            {!loading && (
              <>
                {emailStatus === 'sending' && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Enviando confirmación por correo electrónico...
                    </p>
                  </div>
                )}

                {emailStatus === 'sent' && (
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-center gap-3">
                    <MailCheck className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✅ Correo de confirmación enviado
                      </p>
                      {order?.shipping?.email && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Enviado a: {order.shipping.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {emailStatus === 'error' && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        No pudimos enviar el correo automáticamente
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        No te preocupes, tu pedido fue recibido. Te enviaremos la confirmación manualmente.
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
                      {order.shipping.phone && <p className="text-muted-foreground">📱 {order.shipping.phone}</p>}
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