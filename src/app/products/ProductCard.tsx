'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import { useState } from 'react';
import { useProductRating } from '@/hooks/useProductsRating';

interface ProductCardProps {
  product: Product;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.round(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { rating: supabaseRating, loading } = useProductRating(product.id);

  const rating = supabaseRating?.averageRating ?? product.rating ?? 0;
  const reviewsCount = supabaseRating?.reviewsCount ?? product.reviewsCount ?? 0;

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full">
        <CardHeader className="p-0 relative">
          {rating > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
          <div
            className="block aspect-[4/3] relative overflow-hidden cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Image
              src={product.imageUrls?.[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-2 sm:p-4 flex-grow">
          <CardTitle className="text-base sm:text-lg font-headline mb-1">
            <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </Link>
          </CardTitle>
          
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description?.substring(0, 60)}...
          </CardDescription>
          
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={rating} />
            {loading ? (
              <span className="text-xs text-muted-foreground animate-pulse">...</span>
            ) : reviewsCount > 0 ? (
              <span className="text-xs text-muted-foreground">({reviewsCount})</span>
            ) : (
              <span className="text-xs text-muted-foreground">(Sin reseñas)</span>
            )}
          </div>
          
          <p className="text-lg sm:text-xl font-semibold text-primary">
            {formatColombianCurrency(product.price)}
          </p>
        </CardContent>
        
        <CardFooter className="p-2 sm:p-4 pt-0">
          <Button asChild className="w-full">
            <Link href={`/products/${product.id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Ver Detalles
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowModal(false)}>
          <div className="relative w-full max-w-md mx-auto">
            <Image src={product.imageUrls?.[0] || '/images/placeholder.jpg'} alt={product.name} width={600} height={800} className="rounded-lg object-contain bg-white" onClick={e => e.stopPropagation()} />
            <button className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-black" onClick={() => setShowModal(false)}>X</button>
          </div>
        </div>
      )}
    </>
  );
}
