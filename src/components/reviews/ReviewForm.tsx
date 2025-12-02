'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  orderId: string;
  productId: string;
  token: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ 
  orderId, 
  productId, 
  token, 
  onSuccess 
}: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una calificación',
        variant: 'destructive'
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'El comentario debe tener al menos 10 caracteres',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: parseInt(orderId),
          product_id: productId,
          rating,
          comment: comment.trim(),
          token
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar reseña');
      }

      toast({
        title: '¡Reseña enviada!',
        description: 'Gracias por compartir tu opinión',
      });

      // Reset form
      setRating(0);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la reseña',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selector de estrellas */}
      <div>
        <label className="block text-sm font-medium mb-3">
          ¿Cómo calificarías este producto?
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star 
                className={`h-10 w-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-500 text-yellow-500' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {rating === 5 && '¡Excelente! ⭐⭐⭐⭐⭐'}
            {rating === 4 && 'Muy bueno ⭐⭐⭐⭐'}
            {rating === 3 && 'Bueno ⭐⭐⭐'}
            {rating === 2 && 'Regular ⭐⭐'}
            {rating === 1 && 'Malo ⭐'}
          </p>
        )}
      </div>

      {/* Campo de comentario */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Cuéntanos tu experiencia
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te gustó o no te gustó del producto? ¿Recomendarías esta compra?"
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
          required
          minLength={10}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Mínimo 10 caracteres ({comment.length}/10)
        </p>
      </div>

      {/* Botón de envío */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={submitting || rating === 0 || comment.trim().length < 10}
      >
        {submitting ? 'Enviando...' : 'Enviar Reseña'}
      </Button>
    </form>
  );
}