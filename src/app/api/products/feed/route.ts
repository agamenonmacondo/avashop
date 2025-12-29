import { products, categories } from '@/lib/placeholder-data';
import type { Product } from '@/types'; // <-- añadir

// Función auxiliar para escapar caracteres especiales de XML
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';    // <-- corregido (&amp; no &apos;)
      case "'": return '&apos;';   // usar comilla simple
      case '"': return '&quot;';
      default: return c;
    }
  });
};

// Obtener la ruta completa de la categoría
const getCategoryPath = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return 'Productos';
  
  if (category.parentId) {
    const parent = categories.find(c => c.id === category.parentId);
    return parent ? `${parent.name} > ${category.name}` : category.name;
  }
  
  return category.name;
};

// Mapear categorías a Google Product Categories
const getGoogleCategory = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  const parentId = category?.parentId || categoryId;
  
  // Mapeo según categoría principal
  if (parentId === 'belleza') {
    return 'Health & Beauty > Personal Care';
  }
  if (parentId === 'accesorios') {
    return 'Electronics > Electronics Accessories';
  }
  
  return 'Electronics';
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
      const processedUrls = (product.imageUrls ?? []).map((u: string) => {
        const raw = (u || '').trim();
        const abs = raw.startsWith('http') ? raw : `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
        return escapeXml(encodeURI(abs));
      });

      const imageUrl = processedUrls[0] ?? '';
      const additionalImagesXml = processedUrls.slice(1, 11).map(url => `      <g:additional_image_link>${url}</g:additional_image_link>`).join('\n');

      const priceFormatted = (Number(product.price || 0)).toFixed(2) + ' COP';

      const identifierExists = ((product.gtin ?? '') !== '' || (product.mpn ?? '') !== '') ? 'yes' : 'no';
      
      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${escapeXml(`${baseUrl}/products/${product.id}`)}</g:link>
      ${imageUrl ? `<g:image_link>${imageUrl}</g:image_link>` : ''}
${additionalImagesXml}
      <g:availability>in_stock</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.brand || 'Generico')}</g:brand>
      <g:google_product_category>${escapeXml(getGoogleCategory(product.category.id))}</g:google_product_category>
      <g:product_type>${escapeXml(getCategoryPath(product.category.id))}</g:product_type>
      ${categories.find(c => c.id === product.category.parentId) ? `<g:item_group_id>${escapeXml(categories.find(c => c.id === product.category.parentId)!.id)}</g:item_group_id>` : ''}
      <g:shipping>
        <g:country>CO</g:country>
        <g:service>Envío estándar</g:service>
        <g:price>${product.price > 200000 ? 0 : 15000} COP</g:price>
      </g:shipping>
      <g:shipping_weight>0.5 kg</g:shipping_weight>
      <g:identifier_exists>${identifierExists}</g:identifier_exists>
      <g:mpn>${escapeXml(product.mpn ?? product.id)}</g:mpn>
      <g:gtin>${escapeXml(product.gtin ?? '')}</g:gtin>
    </item>`; 
    }).join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}