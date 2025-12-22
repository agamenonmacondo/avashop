import { NextResponse } from 'next/server';
import { products } from '@/lib/placeholder-data';

// Función para escapar caracteres especiales en XML (sin tocar URLs)
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// sanitize XML by removing chars not allowed in XML 1.0, then escape
function sanitizeForXml(input: string): string {
  if (!input) return '';
  // remove invalid XML 1.0 chars: allow #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
  const filtered = Array.from(input).filter((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return (
      cp === 0x9 ||
      cp === 0xA ||
      cp === 0xD ||
      (cp >= 0x20 && cp <= 0xD7FF) ||
      (cp >= 0xE000 && cp <= 0xFFFD) ||
      (cp >= 0x10000 && cp <= 0x10FFFF)
    );
  }).join('');
  return filtered
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// build absolute and encoded image URL
function buildImageUrl(baseUrl: string, img: string): string {
  if (!img) return '';
  if (/^https?:\/\//i.test(img)) return img;
  const prefix = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = img.startsWith('/') ? img : `/${img}`;
  const url = `${prefix}${encodeURI(path)}`;
  // Escapar '&' para XML (URLs con query params)
  return url.replace(/&/g, '&amp;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ccs724.com';
  
  console.log(`📦 Total de productos en placeholder-data: ${products.length}`);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Catálogo CCS724</title>
<link>${baseUrl}</link>
<description>Productos de tecnología CCS724</description>
`;

  let validProductCount = 0;
  let skippedProducts = 0;

  products.forEach((product, index) => {
    // Validar que el producto tenga los campos mínimos requeridos
    if (!product.id || !product.name || !product.price) {
      console.warn(`⚠️ Producto ${index} omitido: falta id, name o price`);
      skippedProducts++;
      return;
    }

    // Escapar y sanitizar textos
    const safeTitle = sanitizeForXml(product.name || '');
    const safeDescription = sanitizeForXml(product.description || product.name || '');

    // Imagen absoluta segura
    let imageUrl = '';
    if (product.imageUrls && product.imageUrls.length > 0) {
      imageUrl = buildImageUrl(baseUrl, product.imageUrls[0]);
    } else {
      console.warn(`⚠️ Producto ${product.id} no tiene imágenes`);
      skippedProducts++;
      return; // Omitir productos sin imágenes
    }

    // URL producto segura (escapar '&' para XML)
    const slugPart = encodeURIComponent(product.slug || product.id);
    const productUrl = `${baseUrl.replace(/\/$/, '')}/products/${slugPart}`;
    const safeProductUrl = productUrl.replace(/&/g, '&amp;');

    xml += `
<item>
  <g:id>${sanitizeForXml(String(product.id))}</g:id>
  <g:title>${safeTitle}</g:title>
  <g:description>${safeDescription}</g:description>
  <g:link>${safeProductUrl}</g:link>
  <g:image_link>${imageUrl}</g:image_link>
  <g:brand>CCS724</g:brand>
  <g:condition>new</g:condition>
  <g:availability>${(product.stock || 0) > 0 ? 'in stock' : 'out of stock'}</g:availability>
  <g:price>${Number(product.price)} COP</g:price>
</item>`;

    validProductCount++;
  });

  xml += `
</channel>
</rss>`;

  console.log(`✅ Productos válidos incluidos en el feed: ${validProductCount}`);
  console.log(`❌ Productos omitidos: ${skippedProducts}`);

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    },
  });
}