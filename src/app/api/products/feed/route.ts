import { products } from '@/lib/placeholder-data';

// Función auxiliar para escapar caracteres especiales de XML
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  const baseUrl = 'https://www.ccs724.com';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>CCS724 Productos</title>
    <link>${baseUrl}</link>
    <description>Catálogo de productos de tecnología y electrónica CCS724</description>
    ${products.map((product) => {
      let imageUrl = '';
      let additionalImagesXml = '';
      
      if (product.imageUrls && product.imageUrls.length > 0) {
        const processedUrls = product.imageUrls.map(url => {
            const rawUrl = url.trim();
            const absoluteUrl = rawUrl.startsWith('http')
              ? rawUrl
              : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            return escapeXml(encodeURI(absoluteUrl));
        });

        imageUrl = processedUrls[0];

        if (processedUrls.length > 1) {
            additionalImagesXml = processedUrls.slice(1, 11).map(url => 
                `<g:additional_image_link>${url}</g:additional_image_link>`
            ).join('\n      ');
        }
      }

      let brand = 'Generico';
      const lowerId = product.id.toLowerCase();
      
      if (lowerId.startsWith('remax')) {
        brand = 'Remax';
      } else if (lowerId.startsWith('mon-sub')) {
        brand = 'Mondsub';
      }

      const productLink = escapeXml(`${baseUrl}/products/${product.id}`);
      
      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productLink}</g:link>
      ${imageUrl ? `<g:image_link>${imageUrl}</g:image_link>` : ''}
      ${additionalImagesXml}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${product.price} COP</g:price>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>Electronics</g:google_product_category>
      <g:gtin></g:gtin>
      <g:mpn>${product.id}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
    </item>
    `;
    }).join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}