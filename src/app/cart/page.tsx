'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { CartItem, Product } from '@/types';
import { products as allProducts } from '@/lib/placeholder-data';
import { CreditCard, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';

import { getSupabase } from '@/lib/supabaseClient';
// No crear el cliente con createClient en top-level. Llama getSupabase() dentro de useEffect/handlers.

// --- AGREGADO PARA LOGIN ---
// Remover import duplicado y corregir rutas basadas en Supabase
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
// ---------------------------

const initialCartItems: CartItem[] = [
  {
    ...allProducts[0],
    quantity: 1,
    stock: Number(allProducts[0].stock ?? 0),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ...allProducts[2],
    quantity: 2,
    stock: Number(allProducts[2].stock ?? 0),
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  // --- AGREGADO PARA LOGIN ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      router.replace(`/auth/login?redirect=/cart`);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace(`/auth/login?redirect=/cart`);
      } else {
        loadCartFromDB(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Función para cargar carrito desde Supabase
  const loadCartFromDB = async (userId: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        // fallback (localStorage) durante prerender/build o cuando no hay env
        console.warn('Supabase no disponible: usando fallback local.');
        return;
      }
      const { data, error } = await supabase
        .from('carts')
        .select('items')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 es "not found"
        throw error;
      }

      if (data) {
        // Filtra y mapea para asegurar que todos los items tengan la estructura correcta
        const cleanItems = (data.items || []).filter(Boolean).map((item: any) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          // agrega aquí otras propiedades requeridas por CartItem
        }));
        setCartItems(cleanItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      toast({ title: 'Error', description: 'No se pudo cargar el carrito.', variant: 'destructive' });
    }
  };

  // Función para guardar carrito en Supabase
  const saveCartToDB = async (items: CartItem[]) => {
    if (!user) return;
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('Supabase no disponible en este contexto; omitiendo guardado.');
        return;
      }
      const { error } = await supabase
        .from('carts')
        .upsert({ user_id: user.uid, items }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0 && user) {
      saveCartToDB(cartItems); // Guardar cambios en DB
    }
  }, [cartItems, user]);
  // ---------------------------

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInStock = allProducts.find(p => p.id === productId);
    if (!productInStock) return;

    if (newQuantity > (productInStock.stock ?? 0)) {
      toast({
        title: "Stock Insuficiente",
        description: `Solo quedan ${productInStock.stock ?? 0} unidades de ${productInStock.name}.`,
        variant: "destructive",
      });
      setCartItems(currentItems => {
        const updatedCart = currentItems.map(item =>
          item.id === productId ? { ...item, quantity: Number(productInStock.stock ?? 0) } : { ...item, quantity: Number(item.quantity ?? 0) }
        )
        .map(i => ({ ...i, quantity: Number(i.quantity ?? 0) }))
        .filter(item => item.quantity > 0);
        saveCartToDB(updatedCart);
        return updatedCart;
      });
      return;
    }

    setCartItems(currentItems => {
      const updatedCart = currentItems.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(0, newQuantity) } : { ...item, quantity: Number(item.quantity ?? 0) }
      )
      .map(i => ({ ...i, quantity: Number(i.quantity ?? 0) }))
      .filter(item => item.quantity > 0);
      saveCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const removeItem = (productId: string) => {
    setCartItems(currentItems => {
      const updatedCart = currentItems.filter(item => item.id !== productId);
      // Guarda el carrito actualizado en Supabase
      saveCartToDB(updatedCart);
      return updatedCart;
    });
    toast({
      title: "Artículo Eliminado",
      description: "El artículo ha sido eliminado de tu carrito.",
    });
  };

  const addToCart = (product: CartItem) => {
    if (!user) {
      toast({ title: "Debes iniciar sesión para agregar productos al carrito." });
      return;
    }
    setCartItems(currentItems => {
      const existing = currentItems.find(item => item.id === product.id);
      let updatedCart;
      if (existing) {
        updatedCart = currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        updatedCart = [...currentItems, product];
      }
      saveCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  const shippingCost = subtotal > 200000 ? 0 : 15000;
  const totalAmount = subtotal + taxAmount + shippingCost;

  const getImageHint = (product: Product) => {
    if (product.category.slug === 'iphones' || product.category.slug === 'otros-celulares') {
      return 'phone photo';
    }
    if (product.category.slug === 'accesorios') {
      if (product.name.toLowerCase().includes('airpods')) return 'earbuds product';
      if (product.name.toLowerCase().includes('cargador')) return 'charger product';
      if (product.name.toLowerCase().includes('cable')) return 'cable product';
      return 'accessory product';
    }
    return 'product photo';
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Tu Carrito está Vacío</h1>
        <p className="text-muted-foreground mb-6">Parece que aún no has añadido nada a tu carrito.</p>
        <Button asChild size="lg" className="transition-transform hover:scale-105 active:scale-95">
          <Link href="/">Continuar Comprando</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Tu Carrito de Compras</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map(item => (
            <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                <Image 
                  src={item.imageUrls[0]}
                  alt={item.name} 
                  fill sizes="10vw" 
                  className="object-cover" 
                  data-ai-hint={getImageHint(item)}
                />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <Link href={`/products/${item.id}`} className="text-lg font-semibold hover:text-primary transition-colors">{item.name}</Link>
                <p className="text-sm text-muted-foreground">{item.category.name}</p>
                <p className="text-lg font-medium text-primary mt-1">{formatColombianCurrency(item.price)}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8">
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  type="number" 
                  value={item.quantity} 
                  readOnly 
                  className="h-8 w-12 text-center focus-visible:ring-0"
                  aria-label={`${item.name} cantidad`}
                />
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-semibold text-lg w-32 text-right hidden sm:block">
                {formatColombianCurrency(item.price * item.quantity)}
              </p>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Eliminar {item.name}</span>
              </Button>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatColombianCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatColombianCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos ({(taxRate * 100).toFixed(0)}%)</span>
                <span>{formatColombianCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formatColombianCurrency(totalAmount)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full text-base transition-transform hover:scale-105 active:scale-95" asChild>
                <Link href="/checkout">
                  <CreditCard className="mr-2 h-5 w-5" /> Proceder al Pago
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}