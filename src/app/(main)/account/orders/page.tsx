'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { useForm } from 'react-hook-form';

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
  status: string;
  payment_status: string;
  created_at: string;
  user_email: string;
  items: OrderItem[];
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return; // ✅ Verificar que auth no sea null
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        form.setValue('email', user.email || '');
        form.setValue('name', user.displayName || '');
      }
    });
    return () => unsubscribe();
  }, [form]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      setError('No se pudo inicializar Firebase');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setLoading(false);
        setError('Debes iniciar sesión para ver tus pedidos');
        return;
      }

      setUserEmail(firebaseUser.email);
      
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        setError('No se pudo conectar con la base de datos');
        return;
      }

      try {
        console.log('🔍 Buscando órdenes para:', firebaseUser.email);

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_email', firebaseUser.email.toLowerCase().trim())
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('❌ Error cargando órdenes:', ordersError);
          setError('Error al cargar tus pedidos');
          setLoading(false);
          return;
        }

        console.log('✅ Órdenes encontradas:', ordersData?.length || 0);

        if (ordersData && ordersData.length > 0) {
          const ordersWithItems = await Promise.all(
            ordersData.map(async (order) => {
              const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.order_id);
              
              if (itemsError) {
                console.error(`❌ Error cargando items para ${order.order_id}:`, itemsError);
              }

              return { ...order, items: items || [] };
            })
          );

          setOrders(ordersWithItems);
        } else {
          setOrders([]);
        }

        setLoading(false);
      } catch (err: unknown) {
        console.error('❌ Error general:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      declined: { label: 'Rechazado', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      error: { label: 'Error', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

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

function OrdersLoading() {
  return (
    <div className="container mx-auto p-4">
      <p>Cargando órdenes...</p>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
}
