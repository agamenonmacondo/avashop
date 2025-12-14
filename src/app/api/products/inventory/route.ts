import { products } from '@/lib/placeholder-data';

export async function GET() {
  // ⚠️ IMPORTANTE: Reemplaza 'TIENDA_PRINCIPAL' con el código exacto
  // que aparece en tu Perfil de Negocio de Google.
  const STORE_CODE = 'TIENDA_PRINCIPAL'; 

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Inventario Local CCS724</title>
  <updated>${new Date().toISOString()}</updated>
  ${products.map((product) => {
    // Leemos el stock desde placeholder-data.
    // Si el producto no tiene propiedad 'stock', asumimos 10 unidades.
    const quantity = product.stock !== undefined ? product.stock : 10;
    
    // Determinamos disponibilidad basado en el stock real
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