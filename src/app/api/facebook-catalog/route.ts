import { NextResponse } from 'next/server';
import { products } from '@/lib/placeholder-data';

// Función para escapar caracteres especiales en XML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ccs724.com'; 
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Catálogo CCS724</title>
<link>${baseUrl}</link>
<description>Productos de tecnología CCS724</description>
`;

  products.forEach((product) => {
    // Construir la URL de la imagen absoluta
    let imageUrl = '';
    if (product.imageUrls && product.imageUrls.length > 0) {
      const img = product.imageUrls[0];
      imageUrl = img.startsWith('http') ? img : `${baseUrl}${img}`;
    }

    // Escapar todos los textos que van dentro del XML
    const safeTitle = escapeXml(product.name);
    const safeDescription = escapeXml(product.description || product.name);
    const safeLink = escapeXml(`${baseUrl}/product/${product.slug || product.id}`);
    const safeImageUrl = escapeXml(imageUrl);

    xml += `
<item>
  <g:id>${product.id}</g:id>
  <g:title>${safeTitle}</g:title>
  <g:description>${safeDescription}</g:description>
  <g:link>${safeLink}</g:link>
  <g:image_link>${safeImageUrl}</g:image_link>
  <g:brand>CCS724</g:brand>
  <g:condition>new</g:condition>
  <g:availability>${(product.stock || 0) > 0 ? 'in stock' : 'out of stock'}</g:availability>
  <g:price>${product.price} COP</g:price>
</item>`;
  });

  xml += `
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}