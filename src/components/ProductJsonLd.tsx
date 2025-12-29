import React, { useEffect, useState } from 'react';
import type { Product, Review } from '@/types';

type Props = {
  product: Product;
  priceCurrency?: string;
  priceValidUntil?: string;
};

export default function ProductJsonLd({ product, priceCurrency = 'COP', priceValidUntil }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reviews desde la API
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${product.id}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  if (loading) return null; // O un placeholder si prefieres

  const availability = product.stock && product.stock > 0 ? 'InStock' : 'OutOfStock';

  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrls || [],
    description: product.description || product.name,
    sku: product.slug || product.id,
    brand: product.category?.name ? { '@type': 'Brand', name: product.category.name } : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://www.ccs724.com/products/${product.slug ?? product.id}`,  // ✅ Cambiado: Construye la URL dinámicamente
      priceCurrency,
      price: String(product.price),
      availability: `https://schema.org/${availability}`,
    },
  };

  if (priceValidUntil) ld.offers.priceValidUntil = priceValidUntil;

  // Incluir aggregateRating si hay rating y reviewsCount > 0
  if (product.rating !== undefined && product.reviewsCount !== undefined && product.reviewsCount > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    };
  }

  // Incluir reviews individuales si existen
  if (reviews.length > 0) {
    ld.review = reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', 'name': r.author },
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.ratingValue,
        bestRating: r.bestRating ?? 5,
      },
    }));
  }

  const jsonLd = JSON.stringify(ld);

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}