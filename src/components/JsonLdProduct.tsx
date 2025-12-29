import Script from 'next/script';
import React from 'react';
import { Product, Review } from '../types';

export default function JsonLdProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';

  const images = (product.imageUrls ?? []).map((u) => {
    const url = u ?? '';
    return url.startsWith('http') ? url : `${site}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  const priceValidUntil = product.priceValidUntil || undefined;
  const price = product.price != null ? String(product.price) : undefined;
  const priceCurrency = product.priceCurrency || 'COP';

  const availability = product.availability
    ? `https://schema.org/${product.availability}`
    : (product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock');

  const condition = product.condition ? `https://schema.org/${product.condition}Condition` : undefined;

  const url = product.url ? product.url : (product.slug ? `${site}/products/${product.slug}` : `${site}/products/${product.id}`);

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.mpn || product.id,
    image: images,
    description: product.description || '',
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability,
      condition,
      priceValidUntil,
      url,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: priceCurrency,
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
    identifier_exists: product.identifier_exists,
  };

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
      author: { '@type': 'Person', name: (r as any).author ?? (r as any).user ?? 'Usuario' },
      datePublished: (r as any).datePublished,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: (r as any).ratingValue ?? (r as any).rating ?? undefined,
        bestRating: (r as any).bestRating ?? 5,
      },
      reviewBody: (r as any).reviewBody ?? (r as any).body ?? '',
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