import { NextResponse } from 'next/server';
import { products } from '@/lib/placeholder-data'; // 👈 Importamos los datos locales

export async function GET() {
  // Define tu dominio base. Si estás en local, usa localhost, pero Facebook necesita una URL pública real.
  // Cuando subas a producción, asegúrate de que esta variable apunte a tu dominio real (ej: https://www.ccs724.com)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ccs724.com'; 
  
  let xml = `<?xml version="1.0"?>
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
      // Si la imagen ya tiene http, la usamos, si no, le pegamos el dominio base
      imageUrl = img.startsWith('http') ? img : `${baseUrl}${img}`;
    }

    xml += `
<item>
  <g:id>${product.id}</g:id>
  <g:title><![CDATA[${product.name}]]></g:title>
  <g:description><![CDATA[${product.description || product.name}]]></g:description>
  <g:link>${baseUrl}/product/${product.slug || product.id}</g:link>
  <g:image_link>${imageUrl}</g:image_link>
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
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}