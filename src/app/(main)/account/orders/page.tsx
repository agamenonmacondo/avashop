'use client';

import { useEffect, useState } from 'react';
import OrderHistory from '@/components/account/OrderHistory';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Importar cliente de Supabase
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebaseConfig'; // Importar auth de Firebase
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]); // Estado para pedidos
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace(`/auth/login?redirect=/account/orders`);
      } else {
        loadOrdersFromDB(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Función para cargar pedidos desde Supabase
  const loadOrdersFromDB = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('orders')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los pedidos.', variant: 'destructive' });
      setOrders([]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
        <p className="text-xl text-muted-foreground">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" size="sm" asChild className="mb-0 md:mb-0">
          <Link href="/account">
            <ChevronLeft className="mr-1 h-4 w-4" /> Volver a la Cuenta
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-right">Panel de Pedidos</h1>
      </div>
      <OrderHistory orders={orders} />
    </div>
  );
}
