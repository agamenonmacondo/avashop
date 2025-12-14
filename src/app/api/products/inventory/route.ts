import { products } from '@/lib/placeholder-data';

export async function GET() {
  // CONFIGURACIÓN:
  // Este código debe coincidir EXACTAMENTE con el código de tienda 
  // que tengas en tu Perfil de Negocio de Google (Google My Business).
  // Si no sabes cuál es, suele ser un número o texto que definiste al crear la ubicación.
  const STORE_CODE = 'TIENDA_PRINCIPAL'; 
  
  // CANTIDAD POR DEFECTO:
  // Como no tienes inventario real, asumimos un número seguro.
  const DEFAULT_QUANTITY = 10;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Inventario Local CCS724</title>
  <updated>${new Date().toISOString()}</updated>
  ${products.map((product) => {
    return `
  <entry>
    <g:id>${product.id}</g:id>
    <g:store_code>${STORE_CODE}</g:store_code>
    <g:availability>in_stock</g:availability>
    <g:quantity>${DEFAULT_QUANTITY}</g:quantity>
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