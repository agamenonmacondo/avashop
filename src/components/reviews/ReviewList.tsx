'use client';

import { Star } from 'lucide-react';
import type { Review } from '@/types/review';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border border-border rounded-lg p-4 hover:bg-secondary/5 transition-colors"
        >
          {/* Header con estrellas y usuario */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Estrellas */}
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

              {/* Usuario */}
              <span className="text-sm font-medium">
                {maskEmail(review.user_email)}
              </span>

              {/* Badge de verificación */}
              {review.is_verified && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                  ✓ Compra Verificada
                </span>
              )}
            </div>

            {/* Fecha */}
            <span className="text-sm text-muted-foreground">
              {formatDate(review.created_at)}
            </span>
          </div>

          {/* Comentario */}
          <p className="text-sm text-foreground leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}