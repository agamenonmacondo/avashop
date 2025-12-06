import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getImageHint = (product: Product) => {
    if (product.category.slug === 'iphones' || product.category.slug === 'otros-celulares') {
      return 'phone photo';
    }
    if (product.category.slug === 'accesorios') {
      if (product.name.toLowerCase().includes('airpods')) return 'earbuds product';
      if (product.name.toLowerCase().includes('cargador')) return 'charger product';
      if (product.name.toLowerCase().includes('cable')) return 'cable product';
      return 'accessory product';
    }
    return 'product photo';
  };

  // ✅ Renderizar estrellas (siempre visible)
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 fill-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // ✅ Valores seguros
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount ?? 0;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block aspect-[4/3] relative overflow-hidden">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint={getImageHint(product)}
            priority={product.id === '1' || product.id === '2'} 
          />
        </Link>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </Link>
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </CardDescription>
        
        {/* ✅ Rating y Reviews - SIEMPRE VISIBLE */}
        <div className="flex items-center gap-2 mb-3">
          {renderStars(rating)}
          {reviewsCount > 0 ? (
            <>
              <span className="text-sm font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewsCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              (Sin reseñas)
            </span>
          )}
        </div>
        
        {/* ✅ Precio */}
        <p className="text-2xl font-bold text-primary">
          {formatColombianCurrency(product.price)}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full transition-transform hover:scale-105 active:scale-95">
          <Link href={`/products/${product.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Ver Detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
