import { Metadata } from 'next';
import { products } from '@/lib/placeholder-data';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '@/components/ui/Breadcrumbs'; // 1. Importamos Breadcrumbs
import JsonLdProduct from '@/components/JsonLdProduct'; // Importar componente JsonLdProduct

type Props = {
  params: Promise<{ id: string }>;
};

const videoMapping: Record<string, string> = {
  'remax-km-03': 'KM03.mp4',
  'remax-km-01': 'KM01.mp4',
  'k18': 'K18.mp4',
  'kit-esencial': 'KIT_ESENCIAL.mp4',
  'combo-pro': 'COMBO_PRO.mp4',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  const description = product.description ?? `Detalles de ${product.name}`;

  return {
    title: `${product.name} | CCS724`,
    description: description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: description.substring(0, 160),
      images: [
        {
          url: product.imageUrls[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

function generateShortSku(id: string): string {
  // Genera un SKU corto basado en el ID (ej. primeras letras de palabras + sufijo)
  const words = id.split('-');
  const acronym = words.map(word => word.charAt(0).toUpperCase()).join('');
  const suffix = id.slice(-3).toUpperCase(); // últimos 3 caracteres
  return acronym + suffix; // ej. MSAFVCAZDF para mon-sub-aceite-facial-de-vitamina-c-azul-doble-fase
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Producto no encontrado</div>;
  }

  // SERVER-SIDE: intentar obtener estadísticas y reseñas reales (si existe API)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ccs724.com';
  let serverReviewsData: { stats?: { average?: number; total?: number }; reviews?: any[] } | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/reviews?productId=${product.id}`, { cache: 'no-store' });
    if (res.ok) {
      serverReviewsData = await res.json();
    }
  } catch (e) {
    // silencioso: fallback a datos del producto (si existen)
  }

  // valores seguros y fiables
  const rating = serverReviewsData?.stats?.average ?? product.rating ?? 0;
  const reviewsCount = serverReviewsData?.stats?.total ?? product.reviewsCount ?? 0;

  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  const description = product.description ?? `Compra ${product.name} al mejor precio en CCS724.`;

  let brandName = 'Generico';
  const lowerId = product.id.toLowerCase();
  const lowerName = product.name.toLowerCase();
  
  if (lowerId.startsWith('remax') || lowerName.includes('remax')) brandName = 'Remax';
  else if (lowerId.startsWith('mon-sub') || lowerName.includes('mondsub')) brandName = 'Mondsub';
  else if (lowerName.includes('xiaomi')) brandName = 'Xiaomi';

  const videoFile = videoMapping[product.id];
  const videoUrl = videoFile 
    ? `https://www.ccs724.com/images/combos/combo_1/${videoFile}` 
    : null;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrls,
    description: description,
    sku: generateShortSku(product.id), // ✅ Cambiar a SKU corto para evitar warning de longitud
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      priceValidUntil: priceValidUntil.toISOString().split('T')[0],
      url: `https://www.ccs724.com/products/${product.id}`,
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
  };

  // ✅ TEMPORAL: Añadir aggregateRating y review con datos de ejemplo para corregir errores de Rich Results (quitar en producción)
  // if (true) { // siempre añadir para probar
  //   jsonLd.aggregateRating = {
  //     '@type': 'AggregateRating',
  //     ratingValue: 5,
  //     reviewCount: 1,
  //     bestRating: "5",
  //     worstRating: "1"
  //   };
  //
  //   jsonLd.review = [{
  //     '@type': 'Review',
  //     author: { '@type': 'Person', name: 'Cliente Ejemplo' },
  //     datePublished: '2024-12-01',
  //     reviewRating: {
  //       '@type': 'Rating',
  //       ratingValue: '5'
  //     },
  //     reviewBody: 'Excelente producto, recomendado.'
  //   }];
  // }

  // Añadir aggregateRating solo si hay reseñas reales (server-side) o conteo conocido
  if (reviewsCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewsCount,
      bestRating: "5",
      worstRating: "1"
    };
  }
  
  // Añadir review solo si hay reseñas reales
  const serverReviews = serverReviewsData?.reviews ?? [];
  const serverStats = serverReviewsData?.stats ?? null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ Reemplaza JSON-LD inline con el componente oficial */}
      <JsonLdProduct product={product} />

      {/* 5. Implementación de Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/#products' },
          { label: product.name, href: `/products/${product.id}` },
        ]} 
      />

      <ProductDetailClient 
        product={product} 
        initialReviews={serverReviews} 
        initialStats={serverReviewsData?.stats ?? null} 
      />
    </div>
  );
}
