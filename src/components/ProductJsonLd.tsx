import React, { useEffect, useState } from 'react';
import type { Product, Review } from '@/types';

type Props = {
  product: Product;
  priceCurrency?: string;
  priceValidUntil?: string;
};

export default function ProductJsonLd({ product, priceCurrency = 'COP', priceValidUntil }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  // no loading gate: render JSON-LD immediately using product data
  // (reviews will be appended when fetched)

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
      }
    };
    fetchReviews();
  }, [product.id]);

  // don't block rendering — build LD immediately

  const availability = product.stock && product.stock > 0 ? 'InStock' : 'OutOfStock';

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';
  const imagesRaw = (product as any).imageUrls ?? (product as any).image ?? (product as any).image_link ?? [];
  const images = (Array.isArray(imagesRaw) ? imagesRaw : [imagesRaw]).map((u: string) =>
    u?.startsWith?.('http') ? u : `${site}${u}`
  );
  const thumbnail = images[0];

  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description || product.name,
    sku: product.slug || product.id,
    brand: product.category?.name ? { '@type': 'Brand', name: product.category.name } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${site}/products/${product.slug ?? product.id}`,
      priceCurrency,
      price: String(product.price),
      availability: `https://schema.org/${availability}`,
    },
    ...(thumbnail ? { subjectOf: { thumbnailUrl: thumbnail } } : {}),
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