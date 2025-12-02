'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewForm from '@/components/reviews/ReviewForm';
import { CheckCircle2 } from 'lucide-react';

interface ReviewPageClientProps {
  orderId: string;
  token: string;
}

interface OrderProduct {
  product_id: string;
  product_name: string;
  product_image: string;
  hasReview: boolean;
}

export default function ReviewPageClient({ orderId, token }: ReviewPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: Validar token y obtener productos de la orden
    // Por ahora mostramos un producto de ejemplo
    setLoading(false);
    setProducts([
      {
        product_id: 'ejemplo-1',
        product_name: 'Producto de Ejemplo',
        product_image: '/placeholder.jpg',
        hasReview: false
      }
    ]);
  }, [orderId, token]);

  const handleReviewSubmitted = (productId: string) => {
    setSubmittedReviews(prev => new Set([...prev, productId]));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Verificando información...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error
        </h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const allReviewsSubmitted = products.every(
    p => p.hasReview || submittedReviews.has(p.product_id)
  );

  if (allReviewsSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">
          ¡Gracias por tus reseñas!
        </h1>
        <p className="text-muted-foreground mb-6">
          Tus opiniones nos ayudan a mejorar y ayudan a otros clientes a tomar mejores decisiones.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">
          ¿Qué te pareció tu compra?
        </h1>
        <p className="text-muted-foreground">
          Tu opinión es muy importante para nosotros y para otros clientes.
        </p>
      </div>

      <div className="space-y-8">
        {products.map(product => {
          const hasSubmitted = submittedReviews.has(product.product_id);
          const alreadyHasReview = product.hasReview;

          if (alreadyHasReview || hasSubmitted) {
            return (
              <div key={product.product_id} className="border rounded-lg p-6 bg-secondary/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-md" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.product_name}</h3>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  ✓ Reseña enviada
                </p>
              </div>
            );
          }

          return (
            <div key={product.product_id} className="border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-md" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.product_name}</h3>
                </div>
              </div>
              
              <ReviewForm
                orderId={orderId}
                productId={product.product_id}
                token={token}
                onSuccess={() => handleReviewSubmitted(product.product_id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}