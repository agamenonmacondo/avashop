'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/types';
import { CreditCard, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Cargar carrito desde localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = localStorage.getItem('cart');
        const items = cartData ? JSON.parse(cartData) : [];
        setCartItems(items);
      } catch (error) {
        console.error('Error cargando carrito:', error);
        setCartItems([]);
      }
    };

    loadCart();

    // Escuchar cambios en el carrito
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Guardar carrito en localStorage
  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartItems
      .map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, Math.min(newQuantity, item.stock ?? 0)) }
          : item
      )
      .filter(item => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    saveCart(updatedCart);
    toast({
      title: "Artículo Eliminado",
      description: "El artículo ha sido eliminado de tu carrito.",
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  const shippingCost = subtotal > 200000 ? 0 : 15000;
  const totalAmount = subtotal + taxAmount + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Tu Carrito está Vacío</h1>
        <p className="text-muted-foreground mb-6">Parece que aún no has añadido nada a tu carrito.</p>
        <Button asChild size="lg">
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
            <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4">
              <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image 
                  src={item.imageUrls?.[0] || '/placeholder-product.png'}
                  alt={item.name} 
                  fill
                  className="object-cover" 
                />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <Link href={`/products/${item.id}`} className="text-lg font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">{item.category?.name || 'Sin categoría'}</p>
                <p className="text-lg font-medium text-primary mt-1">
                  {formatColombianCurrency(item.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  type="number" 
                  value={item.quantity} 
                  readOnly 
                  className="h-8 w-12 text-center"
                />
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-semibold text-lg">
                {formatColombianCurrency(item.price * item.quantity)}
              </p>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Resumen del Pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatColombianCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatColombianCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos (19%)</span>
                <span>{formatColombianCurrency(taxAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formatColombianCurrency(totalAmount)}</span>
              </div>
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                <CreditCard className="mr-2 h-5 w-5" /> Proceder al Pago
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}