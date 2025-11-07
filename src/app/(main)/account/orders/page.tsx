'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  orderId: string;
  status: string;
  total: number;
  subtotal: number;
  iva: number;
  envio: number;
  items: OrderItem[];
  shipping: {
    fullName?: string;
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: string;
  paidAt?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Aquí deberías obtener las órdenes del usuario autenticado
      // Por ahora, intentamos cargar desde localStorage o sessionStorage
      const storedOrders = localStorage.getItem('user_orders');
      
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      } else {
        // Si no hay órdenes guardadas, intenta cargar desde la API
        // Necesitarás implementar una ruta API que devuelva todas las órdenes del usuario
        console.log('No hay órdenes guardadas localmente');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError('Error al cargar tus pedidos. Por favor, intenta de nuevo.');
    } finally {
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
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      paid: { label: 'Pagado', variant: 'default' },
      approved: { label: 'Aprobado', variant: 'default' },
      processing: { label: 'Procesando', variant: 'outline' },
      shipped: { label: 'Enviado', variant: 'outline' },
      delivered: { label: 'Entregado', variant: 'default' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar pedidos</h3>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={loadOrders}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes pedidos aún</h3>
            <p className="text-muted-foreground text-center mb-6">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <Button onClick={() => router.push('/')}>
              Ir a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            Revisa el estado de tus pedidos y su historial
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Pedido #{order.orderId}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Realizado el {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-lg font-bold">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Items del pedido */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground">
                    Productos ({order.items.length})
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Resumen de costos */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span>{formatCurrency(order.iva)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío:</span>
                    <span>
                      {order.envio === 0 ? 'Gratis' : formatCurrency(order.envio)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Información de envío */}
                {order.shipping && Object.keys(order.shipping).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase text-muted-foreground">
                      Información de envío
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-1">
                      {order.shipping.fullName && (
                        <p className="font-medium">{order.shipping.fullName}</p>
                      )}
                      {order.shipping.address && <p>{order.shipping.address}</p>}
                      {order.shipping.city && order.shipping.state && (
                        <p>
                          {order.shipping.city}, {order.shipping.state}
                        </p>
                      )}
                      {order.shipping.country && <p>{order.shipping.country}</p>}
                      {order.shipping.email && (
                        <p className="text-muted-foreground">
                          {order.shipping.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Botón para ver detalles */}
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/order/success?order_id=${order.orderId}`)}
                  >
                    Ver detalles completos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
