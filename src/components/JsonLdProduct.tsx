import Script from 'next/script';
import React from 'react';
import { Product, Review } from '../types';

export default function JsonLdProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';

  const imagesRaw = (product.imageUrls ?? []) as string[];
  const images = imagesRaw.map((u) => {
    const url = u ?? '';
    return url.startsWith('http') ? url : `${site}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  const priceValidUntil = product.priceValidUntil || (product.sale_price ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined);

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description || '',
    sku: product.mpn || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'CCS724',
    },
    offers: {
      '@type': 'Offer',
      price: product.price != null ? Number(product.price) : undefined,
      priceCurrency: 'COP',
      availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: product.priceValidUntil || priceValidUntil,
      url: product.slug ? `${site}/products/${product.slug}` : `${site}/products/${product.id}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'COP',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CO',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CO',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    mpn: product.mpn,
    gtin: product.gtin,
    identifier_exists: product.identifier_exists ? product.identifier_exists : undefined,
  };

  // Incluir ratings/reviews solo si existen y cuentan
  if (product.reviewsCount && product.reviewsCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating ?? undefined,
      reviewCount: product.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    };

    jsonLd.review = (product.reviews ?? []).map((r: Review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.datePublished,
      reviewRating: { '@type': 'Rating', ratingValue: r.ratingValue, bestRating: r.bestRating ?? 5 },
      reviewBody: r.reviewBody,
    }));
  }

  return (
    <Script
      id={`ld-product-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}