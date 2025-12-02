'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Share2, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatColombianCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import type { Review, ReviewStats } from '@/types/review';
import ReviewStatsComponent from '@/components/reviews/ReviewStats';
import ReviewList from '@/components/reviews/ReviewList';
import ShareProductModal from '@/components/products/ShareProductModal';
import Image from 'next/image';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Estado para reseñas
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Cargar reseñas al montar el componente
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await fetch(`/api/reviews?productId=${product.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setReviewStats(data.stats || {
            average: 0,
            total: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product.id]);

  const handleAddToCart = () => {
    try {
      const cartData = localStorage.getItem('cart');
      const currentCart = cartData ? JSON.parse(cartData) : [];

      const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = currentCart.map((item: any, index: number) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [
          ...currentCart,
          {
            ...product,
            quantity
          }
        ];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));

      toast({
        title: '¡Producto agregado!',
        description: `${quantity} ${product.name} agregado(s) al carrito`,
      });

      setTimeout(() => {
        router.push('/cart');
      }, 500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el producto al carrito',
        variant: 'destructive'
      });
    }
  };

  // ✅ Abrir modal de compartir
  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <div>
            <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-secondary">
              <Image
                src={product.imageUrls[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <Image
                    src={url}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.category.name}
              </p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-primary mb-4">
                {formatColombianCurrency(product.price)}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock !== undefined && quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {product.stock !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {product.stock} disponibles
                </span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al Carrito
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleShare}
                className="w-full"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Compartir Producto
              </Button>
            </div>
          </div>
        </div>

        {/* Sección de reseñas */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Reseñas de Clientes</h2>
          
          {loadingReviews ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando reseñas...</p>
            </div>
          ) : (
            <>
              <ReviewStatsComponent stats={reviewStats} />
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Opiniones Verificadas
                </h3>
                <ReviewList reviews={reviews} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Modal de compartir */}
      <ShareProductModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={{
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrls[0]
        }}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </>
  );
}