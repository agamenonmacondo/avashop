import { products } from '@/lib/placeholder-data';

export async function GET() {
  // ⚠️ Usa el código exacto de tu negocio en Google
  const STORE_CODE = '15284960994718424806';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Inventario Local CCS724</title>
  <updated>${new Date().toISOString()}</updated>
  ${products.map((product) => {
    const quantity = product.stock !== undefined ? product.stock : 10;
    const availability = quantity > 0 ? 'in_stock' : 'out_of_stock';

    return `
  <entry>
    <g:id>${product.id}</g:id>
    <g:store_code>${STORE_CODE}</g:store_code>
    <g:availability>${availability}</g:availability>
    <g:quantity>${quantity}</g:quantity>
    <g:price>${product.price} COP</g:price>
    <g:sale_price>${product.price} COP</g:sale_price>
  </entry>`;
  }).join('')}
</feed>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}