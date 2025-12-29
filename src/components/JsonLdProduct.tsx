import Script from 'next/script';
import React from 'react';

type Product = {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  sku?: string;
  brand?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  priceValidUntil?: string; // YYYY-MM-DD
  aggregateRating?: { ratingValue: number; reviewCount: number } | null;
  reviews?: any[] | null;
  url?: string;
  gtin?: string;
  sale_price?: number; // ✅ Añadido para descuentos
  availability?: string; // ✅ Añadido para stock (ej. 'in_stock' o 'out_of_stock')
};

export default function JsonLdProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';

  const imagesRaw = (product.images ?? []) as string[];
  const images = imagesRaw.map((u) => {
    const url = u ?? '';
    return url.startsWith('http') ? url : `${site}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  const priceValidUntil = product.sale_price ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;

  const offer = {
    '@type': 'Offer',
    url: product.url || `${site}/products/${product.id}`,
    priceCurrency: product.currency || 'COP',
    price: product.price != null ? Number(product.price).toFixed(2) : undefined,
    availability: product.availability === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceValidUntil,
  };

  const ld: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: product.description || '',
    sku: product.sku || product.id,
    brand: { '@type': 'Brand', name: product.brand || 'CCS724' },
    offers: offer,
  };

  if (product.gtin) {
    ld.gtin = product.gtin;
    ld.identifier_exists = true;
  }

  if (product.aggregateRating && product.aggregateRating.reviewCount > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    ld.review = product.reviews.map((r: any) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: (r.user_name ?? r.user_email?.split?.('@')?.[0]) ?? 'Cliente' },
      datePublished: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : undefined,
      reviewRating: r.rating ? { '@type': 'Rating', ratingValue: String(r.rating) } : undefined,
      reviewBody: r.comment || r.body || ''
    }));
  }

  return (
    <Script
      id={`ld-product-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}