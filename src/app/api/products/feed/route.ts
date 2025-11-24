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
      // CORRECCIÓN: Asegurar que la URL de la imagen sea absoluta, codificada y escapada para XML
      let imageUrl = '';
      
      if (product.imageUrls && product.imageUrls.length > 0) {
        // .trim() elimina espacios accidentales al inicio o final que rompen la URL
        const rawUrl = product.imageUrls[0].trim();
        
        // Construir la URL absoluta
        const absoluteUrl = rawUrl.startsWith('http')
          ? rawUrl
          : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
        
        // 1. encodeURI: Arregla espacios y tildes para la web
        // 2. escapeXml: Arregla caracteres como '&' para que no rompan el XML
        imageUrl = escapeXml(encodeURI(absoluteUrl));

        // AGREGAR ESTO: Imprimir la URL en la consola para verificar
        console.log(`Producto ID: ${product.id} | URL Generada: ${imageUrl}`);
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
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${product.price} COP</g:price>
      <g:brand>Generico</g:brand> 
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