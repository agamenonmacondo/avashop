import { products, categories } from '@/lib/placeholder-data';

// Función auxiliar para escapar caracteres especiales de XML
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&apos;';
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
                `      <g:additional_image_link>${url}</g:additional_image_link>`
            ).join('\n');
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
      const categoryPath = getCategoryPath(product.category.id);
      const googleCategory = getGoogleCategory(product.category.id);
      const parentCategory = categories.find(c => c.id === product.category.parentId);
      
      // Calcular envío: gratis si el precio > 200000 COP
      const shippingCost = product.price > 200000 ? 0 : 15000;
      
      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productLink}</g:link>
      ${imageUrl ? `<g:image_link>${imageUrl}</g:image_link>` : ''}
${additionalImagesXml}
      <g:availability>in_stock</g:availability>
      <g:price>${product.price} COP</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(categoryPath)}</g:product_type>
      ${parentCategory ? `<g:item_group_id>${escapeXml(parentCategory.id)}</g:item_group_id>` : ''}
      <g:shipping>
        <g:country>CO</g:country>
        <g:service>Envío estándar</g:service>
        <g:price>${shippingCost} COP</g:price>
      </g:shipping>
      <g:shipping_weight>0.5 kg</g:shipping_weight>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${escapeXml(product.id)}</g:mpn>
      <g:gtin></g:gtin>
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