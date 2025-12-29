import Script from 'next/script';
import React from 'react';
import { Product, Review } from '../types';

export default async function JsonLdProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';

  // política URLs de la empresa
  const POLICIES = {
    returns: 'https://www.ccs724.com/politica-de-devoluciones',
    shipping: 'https://www.ccs724.com/politica-de-envios',
    terms: 'https://www.ccs724.com/terminos-y-condiciones',
    privacy: 'https://www.ccs724.com/politica-de-privacidad',
  };

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

  // Try to fetch reviews/stats from internal API if product has no reviews/stats
  let apiReviews: Review[] = [];
  let apiStats: any = null;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || site; // <- usar site como fallback en vez de localhost
    const res = await fetch(`${base}/api/reviews?productId=${encodeURIComponent(product.id)}&limit=20`, {
      next: { revalidate: 120 },
    });
    if (res.ok) {
      const json = await res.json();
      apiReviews = Array.isArray(json.reviews) ? json.reviews : [];
      apiStats = json.stats ?? null;
    }
  } catch (e) {
    // fail silently — se usan los datos del product si existen
  }

  const reviewsSource: Review[] = apiReviews.length ? apiReviews : (product.reviews ?? []);
  const reviewsCount = apiStats?.reviewsCount ?? product.reviewsCount ?? (reviewsSource?.length || 0);
  const ratingValue = apiStats?.rating ?? product.rating ?? undefined;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.mpn || product.id,
    image: images,
    description: product.description || '',
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    mpn: product.mpn || undefined,
    gtin: product.gtin || undefined,
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
        // link a la política de envíos
        url: POLICIES.shipping,
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
        // link a la política de devoluciones
        url: POLICIES.returns,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    // añadir enlaces legales a nivel de producto
    termsOfService: POLICIES.terms,
    privacyPolicy: POLICIES.privacy,
    identifier_exists: product.identifier_exists,
  };

  if (reviewsCount && reviewsCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue ?? undefined,
      reviewCount: reviewsCount,
      bestRating: 5,
      worstRating: 1,
    };

    jsonLd.review = (reviewsSource ?? []).map((r: Review) => ({
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

  // Filtrar undefined antes de serializar
  const cleanJsonLd = Object.fromEntries(
    Object.entries(jsonLd).filter(([_, v]) => v !== undefined)
  );

  return (
    <Script
      id={`ld-product-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd) }}
    />
  );
}