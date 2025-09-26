
import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProductMarqueeProps {
  products: Product[];
}

export default function ProductMarquee({ products }: ProductMarqueeProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Duplicate for seamless loop
  const marqueeProducts = [...products, ...products];

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
    <section className="py-8 md:py-12 bg-background overflow-hidden">
      <div className="marquee-container relative flex overflow-x-hidden">
        <div className="marquee-content flex animate-marquee whitespace-nowrap py-4">
          {marqueeProducts.map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/products/${product.id}`}
              className="marquee-item block relative w-60 h-60 md:w-72 md:h-72 flex-shrink-0"
              aria-label={`Ver ${product.name}`}
            >
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 240px, 288px"
                className="object-contain p-2"
                data-ai-hint={getImageHint(product)}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
