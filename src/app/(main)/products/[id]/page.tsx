import { Metadata } from 'next';
import { products } from '@/lib/placeholder-data';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '@/components/ui/Breadcrumbs'; // 1. Importamos Breadcrumbs

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

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Producto no encontrado</div>;
  }

  // 2. SOLUCIÓN AL ERROR: Definimos valores seguros.
  // Si rating es undefined, usamos 0.
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount ?? 0;

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
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    // 3. Usamos la variable segura 'rating'
    ...(rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount: reviewsCount || 1,
        bestRating: "5",
        worstRating: "1"
      }
    }),
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
    // 4. Usamos la variable segura 'rating' para evitar reseñas falsas si es 0
    ...(rating > 0 ? {
      review: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating.toString()
        },
        author: {
          '@type': 'Person',
          name: 'Cliente Verificado'
        },
        datePublished: new Date().toISOString().split('T')[0]
      }
    } : {}),
  };

  if (videoUrl) {
    jsonLd.subjectOf = {
      '@type': 'VideoObject',
      name: `Video de ${product.name}`,
      description: description,
      thumbnailUrl: product.imageUrls[0],
      uploadDate: new Date().toISOString(),
      contentUrl: videoUrl,
      embedUrl: videoUrl
    };
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 5. Implementación de Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/#products' },
          { label: product.name, href: `/products/${product.id}` },
        ]} 
      />

      <ProductDetailClient product={product} />
    </div>
  );
}
