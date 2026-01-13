'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getSupabase } from '@/lib/supabaseClient';
import { Review } from '@/types/review';  // ✅ Importar desde tipos centrales

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data as Review[]);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="text-muted-foreground">Cargando reseñas...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-muted-foreground">No hay reseñas aún.</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.user_name}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{review.comment}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(review.created_at).toLocaleDateString('es-CO')}
          </p>
        </div>
      ))}
    </div>
  );
}