'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { formatColombianCurrency } from '@/lib/utils';
import type { CartItem } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const product = products.find(p => p.id === resolvedParams.id);

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Producto no encontrado</div>;
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    
    try {
      const cartData = localStorage.getItem('cart');
      const currentCart: CartItem[] = cartData ? JSON.parse(cartData) : [];
      
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          ...product,
          quantity,
          stock: Number(product.stock ?? 0),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        currentCart.push(newItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(currentCart),
      }));
      
      toast({
        title: "¡Agregado al carrito!",
        description: `${product.name} x${quantity}`,
      });
      
      // Redirigir al checkout
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.category.name}</p>
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatColombianCurrency(product.price)}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Stock:</span>
            <span className={`text-sm font-medium ${(product.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(product.stock ?? 0) > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Cantidad:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isAdding}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock ?? 0, quantity + 1))}
                disabled={isAdding}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={(product.stock ?? 0) === 0 || isAdding}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isAdding ? 'Agregando...' : 'Comprar Ahora'}
          </Button>
        </div>
      </div>
    </div>
  );
}
