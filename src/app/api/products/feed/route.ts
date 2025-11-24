import { products } from '@/lib/placeholder-data';

export async function GET() {
  const baseUrl = 'https://www.ccs724.com'; // Tu dominio real

  // Construcción del XML según especificaciones de Google Merchant
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>CCS724 Productos</title>
    <link>${baseUrl}</link>
    <description>Catálogo de productos de tecnología y electrónica CCS724</description>
    ${products.map((product) => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${baseUrl}/products/${product.id}</g:link>
      <g:image_link>${product.imageUrls[0]}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${product.price} COP</g:price>
      <g:brand>Generico</g:brand> 
      <g:google_product_category>Electronics</g:google_product_category>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      // Opcional: Cachear por 1 hora para no sobrecargar si Google pide mucho
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}