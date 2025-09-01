import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Body recibido en backend:', JSON.stringify(body, null, 2));

    // Normalizar amount (acepta `amount` o `totalAmount`)
    const rawAmount = body.amount ?? body.totalAmount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);

    // Normalizar cartItems para validación (pero NO se envían a Bold)
    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems.map((it: any) => ({
          id: it.id,
          name: it.name,
          quantity: Number(it.quantity) || 1,
          price: Math.round(Number(it.price) || 0),
        }))
      : [];

    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();
    const redirectionUrl = body.redirectUrl || process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '';

    const received = { rawAmount, amount, cartItemsLength: cartItems.length, orderId, redirectionUrl };

    // Validaciones
    if (amount <= 0) {
      console.warn('Falta amount o es cero', received);
      return NextResponse.json({
        success: false,
        message: 'Campo amount faltante o inválido (debe ser > 0).',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    if (cartItems.length === 0) {
      console.warn('cartItems vacío', received);
      return NextResponse.json({
        success: false,
        message: 'Campo cartItems faltante o vacío.',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    // Credenciales
    const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY;
    const secret = process.env.BOLD_SECRET_KEY;
    // LOG mascarado (no exponer entero en consola pública)
    const mask = (s?: string) => s ? `${s.slice(0,4)}...${s.slice(-4)}` : 'null';
    console.log('Using apiKey:', mask(apiKey), ' secret:', mask(secret));

    if (!apiKey || !secret) {
      console.error('Missing Bold credentials');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // LOG antes de enviar
    console.log('Payload enviado a Bold (sin items):', JSON.stringify(payload, null, 2));

    // Intento 1: header x-api-key
    const headers1 = { 'Content-Type': 'application/json', 'x-api-key': apiKey };
    let boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', { method: 'POST', headers: headers1, body: JSON.stringify(payload) });

    // Si 401, reintentar con Authorization (algunas integraciones requieren este formato)
    if (boldRes.status === 401) {
      console.warn('Bold returned 401 with x-api-key header, retrying with Authorization header');
      const headers2 = { 'Content-Type': 'application/json', 'Authorization': `x-api-key ${apiKey}` };
      boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', { method: 'POST', headers: headers2, body: JSON.stringify(payload) });
    }

    // Obtener texto crudo y parse seguro
    const boldResText = await boldRes.text().catch(() => '');
    let result: any = null;
    try { result = boldResText ? JSON.parse(boldResText) : null; } catch { result = boldResText; }

    console.log('Bold response status:', boldRes.status);
    console.log('Bold response body:', boldResText);

    if (!boldRes.ok) {
      return NextResponse.json({
        success: false,
        message: result?.message || `Bold API error (${boldRes.status})`,
        detail: result ?? boldResText,
        debug: { received, payload, status: boldRes.status }
      }, { status: boldRes.status });
    }

    // Extraer URL de redirección que Bold devuelva (variantes comunes)
    const redirectFromBold = result?.redirect_url || result?.data?.redirect_url || result?.redirectUrl || null;

    return NextResponse.json({
      success: true,
      data: result,
      redirectUrl: redirectFromBold
    }, { status: 200 });

  } catch (err) {
    console.error('Error en create-payment:', err);
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(err) }, { status: 500 });
  }
}