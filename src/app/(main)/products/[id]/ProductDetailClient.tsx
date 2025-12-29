'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Share2, Minus, Plus, CheckCircle2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatColombianCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import ShareProductModal from '@/components/products/ShareProductModal';
import Image from 'next/image';
import { getSupabase } from '@/lib/supabaseClient';

interface ProductDetailClientProps {
  product: Product;
  initialReviews?: Review[];
  initialStats?: ReviewStats | null;
}

interface Review {
  id: number;
  product_id: string;
  user_email: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  photo_url?: string | null;
  created_at: string;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function ProductDetailClient({
  product,
  initialReviews = [],
  initialStats = null,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [reviewStats, setReviewStats] = useState<ReviewStats>(
    initialStats ?? {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  );
  const [loadingReviews, setLoadingReviews] = useState(initialReviews && initialReviews.length > 0 ? false : true);

  useEffect(() => {
    // Si ya viene data inicial del server, no forzar fetch; sino traer desde API
    if (initialReviews && initialReviews.length > 0) {
      setLoadingReviews(false);
      return;
    }

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
  }, [product.id, initialReviews]);
  
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // 1. Obtener usuario autenticado de Supabase
      const supabase = getSupabase();
      let userId: string;
      let isGuest = false;

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          // Usuario autenticado - buscar en tabla profiles
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_email')
            .eq('id', session.user.id)
            .single();

          if (!error && profile?.user_email) {
            userId = profile.user_email;
            console.log('✅ Usuario autenticado desde profiles:', userId);
          } else {
            // Fallback al email de la sesión
            userId = session.user.email || session.user.id;
            console.log('✅ Usuario autenticado desde session:', userId);
          }
        } else {
          // Usuario guest - generar ID temporal
          const storedGuestId = localStorage.getItem('guestUserId');
          if (storedGuestId) {
            userId = storedGuestId;
            isGuest = true;
            console.log('🔄 Usando guest ID existente:', userId);
          } else {
            userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('guestUserId', userId);
            isGuest = true;
            console.log('🆕 Nuevo guest ID generado:', userId);
          }
        }
      } else {
        // Fallback si Supabase no está disponible
        const storedGuestId = localStorage.getItem('guestUserId');
        userId = storedGuestId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!storedGuestId) {
          localStorage.setItem('guestUserId', userId);
        }
        isGuest = true;
        console.log('⚠️ Supabase no disponible, usando:', userId);
      }

      // 2. Guardar en localStorage (sincronización inmediata)
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

      // 3. Guardar en Supabase (tabla carts) - Solo si NO es guest
      if (!isGuest) {
        console.log('💾 Guardando en Supabase...', { userId, productId: product.id, quantity });
        
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            productId: product.id,
            quantity: quantity
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('❌ Error en API:', data);
          toast({
            title: 'Advertencia',
            description: 'Producto guardado localmente. Sincronización pendiente.',
            variant: 'default',
          });
        } else {
          console.log('✅ Guardado en Supabase:', data);
        }
      } else {
        console.log('⚠️ Usuario guest - solo guardado en localStorage');
      }

      // 4. Mostrar toast y redirigir
      toast({
        title: '¡Producto agregado!',
        description: `${quantity} ${product.name} agregado(s) al carrito`,
      });

      setTimeout(() => {
        router.push(`/cart?userId=${userId}`);
      }, 500);

    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      
      toast({
        title: 'Producto guardado localmente',
        description: 'El producto se guardó en tu navegador.',
        variant: 'default',
      });
      
      // Aún así, redirigir al carrito
      setTimeout(() => {
        const guestId = localStorage.getItem('guestUserId');
        router.push(`/cart${guestId ? `?userId=${guestId}` : ''}`);
      }, 500);
    } finally {
      setIsAddingToCart(false);
    }
  };

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
                disabled={product.stock === 0 || isAddingToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAddingToCart ? 'Agregando...' : 'Agregar al Carrito'}
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
              {/* Rating Summary */}
              <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="flex flex-col items-center justify-center bg-card p-6 rounded-lg border">
                  <div className="text-6xl font-bold mb-2">{reviewStats.average.toFixed(1)}</div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(reviewStats.average) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{reviewStats.total} reseña{reviewStats.total !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewStats.distribution[rating as keyof typeof reviewStats.distribution];
                    const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2 mb-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Opiniones Verificadas */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6">
                  Opiniones Verificadas
                </h3>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6 bg-card">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-14 w-14 border-2 border-primary">
                            <AvatarImage 
                              src={review.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_email.split('@')[0])}&background=4f46e5&color=fff&size=128&bold=true`} 
                              alt={review.user_email}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                              {review.user_email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg">
                              {review.user_email.split('@')[0]}
                            </h4>
                            {review.is_verified && (
                              <span className="inline-flex items-center gap-1 text-green-600 text-xs bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Compra Verificada
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300 fill-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <p className="text-foreground leading-relaxed text-base">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="text-center py-16 bg-card rounded-lg border border-dashed">
                      <div className="flex flex-col items-center gap-3">
                        <Star className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">
                          Aún no hay reseñas para este producto
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ¡Sé el primero en compartir tu opinión!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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