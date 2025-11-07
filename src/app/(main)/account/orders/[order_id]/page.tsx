'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Package, MapPin, CreditCard } from 'lucide-react';
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
  user_email: string;
  shipping_details: any;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetail();
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

      console.log('🔍 Cargando detalle de orden:', orderId);

      // Obtener la orden - CORREGIDO: usando los nombres de columna correctos
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
        console.error('❌ Error cargando orden:', orderError);
        setError('Orden no encontrada');
        setLoading(false);
        return;
      }

      console.log('✅ Orden encontrada:', orderData);

      // Obtener items de la orden - CORREGIDO: nombres de columna correctos
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, price, image_url, created_at')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('❌ Error cargando items:', itemsError);
      }

      console.log('📦 Items encontrados:', items?.length || 0, items);

      setOrder({ 
        ...orderData,
        items: items || [] 
      });
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error general:', err);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando detalle del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-red-600 mb-4">{error || 'Pedido no encontrado'}</p>
            <Button asChild>
              <Link href="/account/orders">Volver a Pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/account/orders">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver a Mis Pedidos
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Header del pedido */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Pedido #{order.order_id}
                </CardTitle>
                <CardDescription className="mt-2">
                  Realizado el {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <div className="text-right">
                {getStatusBadge(order.payment_status)}
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="font-semibold mt-1">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_details ? (
                  <div className="space-y-2 text-sm">
                    {order.shipping_details.fullName && (
                      <p className="font-semibold">{order.shipping_details.fullName}</p>
                    )}
                    {order.shipping_details.address && (
                      <p>{order.shipping_details.address}</p>
                    )}
                    {order.shipping_details.city && order.shipping_details.state && (
                      <p>
                        {order.shipping_details.city}, {order.shipping_details.state}
                      </p>
                    )}
                    {order.shipping_details.country && (
                      <p>{order.shipping_details.country}</p>
                    )}
                    {order.shipping_details.postalCode && (
                      <p>CP: {order.shipping_details.postalCode}</p>
                    )}
                    <Separator className="my-3" />
                    {order.shipping_details.phone && (
                      <p className="text-muted-foreground">
                        Tel: {order.shipping_details.phone}
                      </p>
                    )}
                    {order.shipping_details.email && (
                      <p className="text-muted-foreground">
                        Email: {order.shipping_details.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No hay información de envío disponible
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Resumen del Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal || order.total_amount * 0.84)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span>{formatCurrency(order.iva || order.total_amount * 0.16)}</span>
                  </div>
                  {order.shipping_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío:</span>
                      <span>{formatCurrency(order.shipping_cost)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}