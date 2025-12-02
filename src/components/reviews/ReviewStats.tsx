'use client';

import { Star } from 'lucide-react';
import type { ReviewStats } from '@/types/review';

interface ReviewStatsProps {
  stats: ReviewStats;
}

export default function ReviewStatsComponent({ stats }: ReviewStatsProps) {
  const { average, total, distribution } = stats;

  if (total === 0) {
    return (
      <div className="bg-secondary/20 rounded-lg p-6">
        <div className="flex items-center gap-6">
          {/* Promedio visual con 3 estrellas */}
          <div className="text-center">
            <div className="text-5xl font-bold text-muted-foreground mb-2">
              0.0
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < 3 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-gray-200 dark:text-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              0 reseñas
            </p>
          </div>

          {/* Mensaje motivacional */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              Este producto aún no tiene reseñas
            </h3>
            <p className="text-sm text-muted-foreground">
              ¡Sé el primero en opinar! Compra este producto y comparte tu experiencia con otros clientes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 rounded-lg p-6">
      <div className="flex items-center gap-6 mb-6">
        {/* Promedio general */}
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            {average.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(average)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>

        {/* Distribución de estrellas */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium w-6">{stars}</span>
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}