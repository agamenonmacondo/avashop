import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);

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

  return (
    <>
      {/* Usar article ayuda a los buscadores a entender que es un item independiente */}
      <article className="h-full"> 
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full">
          <CardHeader className="p-0">
            <div
              className="block aspect-[4/3] sm:aspect-[4/3] xs:aspect-[4/5] relative overflow-hidden cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <Image
                src={product.imageUrls[0]}
                alt={`Comprar ${product.name} - Precio ${formatColombianCurrency(product.price)}`} // Alt más descriptivo
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                data-ai-hint={getImageHint(product)}
                priority={product.id === '1' || product.id === '2'}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 flex-grow">
            <CardTitle className="text-base sm:text-lg font-headline mb-1">
              <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                {product.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
              {product.description.substring(0, 60)}...
            </CardDescription>
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg sm:text-xl font-semibold text-primary">{formatColombianCurrency(product.price)}</p>
              {product.rating && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">({product.reviewsCount || 0})</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-2 sm:p-4 pt-0">
            <Button asChild className="w-full transition-transform hover:scale-105 active:scale-95 text-xs sm:text-base">
              <Link href={`/products/${product.id}`}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Ver Detalles
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </article>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setShowModal(false)}
        >
          <div className="relative w-full max-w-md mx-auto">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              width={600}
              height={800}
              className="rounded-lg object-contain bg-white"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-black"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </>
  );
}