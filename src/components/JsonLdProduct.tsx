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
};

export default function JsonLdProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  const offer = {
    '@type': 'Offer',
    url: product.url || `https://www.ccs724.com/products/${product.id}`,
    priceCurrency: product.currency || 'COP',
    price: product.price != null ? String(product.price) : undefined,
    availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceValidUntil: product.priceValidUntil || undefined,
  };

  const ld: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images || [],
    description: product.description || '',
    sku: product.sku || product.id,
    brand: { '@type': 'Brand', name: product.brand || 'CCS724' },
    offers: offer,
  };

  if (product.aggregateRating) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
    };
  }

  if (product.reviews) {
    ld.review = product.reviews;
  }

  return (
    <Script
      id={`ld-product-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}