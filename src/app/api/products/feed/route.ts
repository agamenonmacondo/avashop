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
  const baseUrl = 'https://www.ccs724.com'; // Tu dominio real

  // Construcción del XML según especificaciones de Google Merchant
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
        // Procesamos todas las URLs disponibles
        const processedUrls = product.imageUrls.map(url => {
            const rawUrl = url.trim();
            // Construir la URL absoluta
            const absoluteUrl = rawUrl.startsWith('http')
              ? rawUrl
              : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            
            // Codificar y escapar para XML
            return escapeXml(encodeURI(absoluteUrl));
        });

        // La primera imagen es la principal
        imageUrl = processedUrls[0];

        // Las siguientes (hasta 10) son adicionales
        if (processedUrls.length > 1) {
            additionalImagesXml = processedUrls.slice(1, 11).map(url => 
                `<g:additional_image_link>${url}</g:additional_image_link>`
            ).join('\n      ');
        }
      }

      // Lógica para determinar la marca basada en el ID del producto
      let brand = 'Generico';
      const lowerId = product.id.toLowerCase();
      
      if (lowerId.startsWith('remax')) {
        brand = 'Remax';
      } else if (lowerId.startsWith('mon-sub')) {
        brand = 'Mondsub';
      }

      // Generar el link del producto y escapar para XML
      const productLink = escapeXml(`${baseUrl}/products/${product.id}`);
      
      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productLink}</g:link>
      ${imageUrl ? `<g:image_link>${imageUrl}</g:image_link>` : ''}
      ${additionalImagesXml}
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${product.price} COP</g:price>
      <g:brand>${brand}</g:brand> 
      <g:google_product_category>Electronics</g:google_product_category>
    </item>
    `;
    }).join('')}
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