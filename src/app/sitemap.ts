import type { MetadataRoute } from 'next';
import { products } from '@/lib/placeholder-data';

const baseUrl = 'https://www.ccs724.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries = products.map(product => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productEntries,
  ];
}