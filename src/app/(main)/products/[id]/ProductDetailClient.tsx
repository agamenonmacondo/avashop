'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import type { CartItem } from '@/types';
import { products } from '@/lib/placeholder-data';
import { trackViewContent, trackAddToCart } from '@/lib/meta-pixel';

export default function ProductDetailClient({ product }: { product: typeof products[number] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Track cuando se ve el producto (solo una vez al montar)
  useEffect(() => {
    trackViewContent(product.id, product.name, product.price);
  }, [product.id, product.name, product.price]);

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

      // Track ANTES de mostrar el toast para asegurar que se envíe
      trackAddToCart(product.id, product.name, product.price, quantity);

      toast({
        title: "¡Agregado al carrito!",
        description: `${product.name} x${quantity}`,
      });

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-background">
          <Image
            src={product.imageUrls[selectedImageIdx]}
            alt={product.name}
            fill
            className="object-contain p-2"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.imageUrls.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIdx(idx)}
              className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                selectedImageIdx === idx ? 'ring-2 ring-primary' : ''
              }`}
            >
              <Image
                src={url}
                alt={`Vista ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
        <p className="text-muted-foreground">{product.category.name}</p>

        <div className="text-3xl font-bold text-primary">
          {formatColombianCurrency(product.price)}
        </div>

        <p className="text-base text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
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

          <Button onClick={handleAddToCart} className="w-full sm:w-auto" disabled={isAdding}>
            {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
          </Button>
        </div>
      </div>
    </div>
  );
}