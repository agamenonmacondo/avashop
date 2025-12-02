'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Package, MapPin, CreditCard, Truck, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getSupabase } from '@/lib/supabaseClient';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string | null;
}

interface Order {
  order_id: string;
  total_amount: number;
  subtotal: number;
  iva: number;
  shipping_cost: number;
  status: string;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
  user_email: string;
  shipping_details: any;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.order_id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabase();
      if (!supabase) {
        setError('No se pudo conectar con la base de datos');
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          order_id,
          total_amount,
          subtotal,
          iva,
          shipping_cost,
          status,
          payment_status,
          created_at,
          user_email,
          shipping_details,
          paid_at
        `)
        .eq('order_id', orderId)
        .single();

      if (orderError) {
        setError('Orden no encontrada');
        setLoading(false);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, price, image_url, created_at')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error cargando items:', itemsError);
      }

      setOrder({ 
        ...orderData,
        items: items || [] 
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el pedido');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      approved: { label: 'Aprobado', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      paid: { label: 'Pagado', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      declined: { label: 'Rechazado', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      error: { label: 'Error', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-4 py-2 rounded-full text-base font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getEstimatedDelivery = () => {
    if (!order?.created_at) return 'Por confirmar';
    
    try {
      const orderDate = new Date(order.created_at);
      const minDays = new Date(orderDate);
      minDays.setDate(minDays.getDate() + 3);
      
      const maxDays = new Date(orderDate);
      maxDays.setDate(maxDays.getDate() + 5);
      
      return `${minDays.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} - ${maxDays.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}`;
    } catch (e) {
      return 'Por confirmar';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
          <p className="text-lg text-muted-foreground">Cargando detalle del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
            <p className="text-lg text-red-600 mb-6">{error || 'Pedido no encontrado'}</p>
            <Button asChild size="lg">
              <Link href="/account/orders">Volver a Pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6 text-base">
        <Link href="/account/orders">
          <ChevronLeft className="mr-2 h-5 w-5" /> Volver a Mis Pedidos
        </Link>
      </Button>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header del pedido */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl md:text-4xl flex items-center gap-3">
                  <Package className="h-8 w-8" />
                  Pedido #{order.order_id}
                </CardTitle>
                <CardDescription className="mt-3 text-base">
                  Realizado el {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <div className="text-right">
                {getStatusBadge(order.payment_status)}
                <p className="text-3xl md:text-4xl font-bold mt-3">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Estado y Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Estado del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Timeline del pedido */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.payment_status === 'approved' || order.payment_status === 'paid' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="w-0.5 h-16 bg-gray-300"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-lg">Pedido Confirmado</p>
                  <p className="text-base text-muted-foreground mt-1">
                    {formatDate(order.created_at)}
                  </p>
                  {order.paid_at && (
                    <p className="text-base text-green-600 mt-2 font-medium">
                      ✓ Pago confirmado el {formatDate(order.paid_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="w-0.5 h-16 bg-gray-300"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-lg">En Proceso</p>
                  <p className="text-base text-muted-foreground mt-1">
                    Tu pedido se está preparando para el envío
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-lg">Entrega Estimada</p>
                  <p className="text-base text-muted-foreground mt-1">
                    {getEstimatedDelivery()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    * Según <Link href="/politica-de-envios" className="text-primary hover:underline font-medium">política de envíos</Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-base text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong className="text-lg">ℹ️ Información importante:</strong><br />
                Recibirás un correo electrónico cuando tu pedido sea despachado con el número de guía para rastrear tu envío.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Productos ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-5 border-b last:border-b-0">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-base md:text-lg">{item.product_name}</p>
                        <p className="text-base text-muted-foreground mt-1">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="font-bold text-lg md:text-xl mt-2">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-muted-foreground text-center py-6">
                    No hay productos disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de envío y pago */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_details ? (
                  <div className="space-y-3 text-base">
                    {order.shipping_details.fullName && (
                      <p className="font-semibold text-lg">{order.shipping_details.fullName}</p>
                    )}
                    {order.shipping_details.address && (
                      <p className="text-base">{order.shipping_details.address}</p>
                    )}
                    {order.shipping_details.city && order.shipping_details.state && (
                      <p className="text-base">
                        {order.shipping_details.city}, {order.shipping_details.state}
                      </p>
                    )}
                    {order.shipping_details.country && (
                      <p className="text-base">{order.shipping_details.country}</p>
                    )}
                    {order.shipping_details.postalCode && (
                      <p className="text-base">CP: {order.shipping_details.postalCode}</p>
                    )}
                    <Separator className="my-4" />
                    {order.shipping_details.phone && (
                      <p className="text-base text-muted-foreground">
                        📱 Tel: {order.shipping_details.phone}
                      </p>
                    )}
                    {order.shipping_details.email && (
                      <p className="text-base text-muted-foreground">
                        📧 Email: {order.shipping_details.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-base text-muted-foreground">
                    No hay información de envío disponible
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Resumen del Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal productos:</span>
                    <span className="font-semibold text-lg">{formatCurrency(order.subtotal)}</span>
                  </div>
                  
                  {order.shipping_cost > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Costo de envío:</span>
                      <span className="font-semibold text-lg">{formatCurrency(order.shipping_cost)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Envío:</span>
                      <span className="font-semibold text-lg text-green-600">¡Gratis! 🎉</span>
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-bold text-xl">Total Pagado:</span>
                    <span className="font-bold text-2xl md:text-3xl text-green-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <div className="mt-5 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm md:text-base text-green-800 dark:text-green-200 text-center font-medium">
                      ✓ Pago procesado exitosamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ayuda */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base">
                <p className="text-muted-foreground leading-relaxed">
                  Si tienes alguna duda sobre tu pedido, contáctanos:
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-base">📧 ventas@ccs724.com</p>
                  <p className="font-semibold text-base">💬 WhatsApp: +57 350 401 7710</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}