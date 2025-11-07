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
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/account">
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver a Mi Cuenta
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Panel de Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            {userEmail && `Pedidos de: ${userEmail}`}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aún no hay Pedidos</h3>
            <p className="text-muted-foreground mb-6">
              No has realizado ningún pedido. Empieza a comprar para ver tu historial de pedidos aquí.
            </p>
            <Button asChild>
              <Link href="/">Empezar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.order_id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.order_id}</CardTitle>
                    <CardDescription>{formatDate(order.created_at)}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                    <div className="mt-2">
                      {getStatusBadge(order.payment_status)}
                    </div>
                    {/* Enlace al detalle */}
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href={`/account/orders/${order.order_id}`}>Ver Detalle</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Productos:</h4>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                        </div>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay items disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
