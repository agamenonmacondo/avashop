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
    if (!apiKey || !secret) {
      console.error('Missing Bold credentials');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // Generar integritySignature: SHA256(orderId + amount + currency + secret)
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    // Construir payload EXACTO para Bold (no incluir items)
    const payload: Record<string, any> = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      // enviar ambas variantes por si la API exige snake_case
      redirectionUrl,
      redirection_url: redirectionUrl,
      description: body.description || `Pedido ${orderId}`,
    };
    
    // Opcionales: customerData y billingAddress deben ser strings JSON si existen
    if (body.customerData && Object.keys(body.customerData).length > 0) {
      payload.customerData = typeof body.customerData === 'string' ? body.customerData : JSON.stringify(body.customerData);
    }
    if (body.billingAddress && Object.keys(body.billingAddress).length > 0) {
      payload.billingAddress = typeof body.billingAddress === 'string' ? body.billingAddress : JSON.stringify(body.billingAddress);
    }
    if (body['extra-data-1']) payload['extra-data-1'] = body['extra-data-1'];
    if (body['extra-data-2']) payload['extra-data-2'] = body['extra-data-2'];

    // LOG antes de enviar
    console.log('Payload enviado a Bold (sin items):', JSON.stringify(payload, null, 2));
    
    // Usar header x-api-key (no "Authorization")
    const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey, // llave de identidad
      },
      body: JSON.stringify(payload),
    });
    
    const result = await boldRes.json().catch(() => null);
    console.log('Respuesta de Bold:', boldRes.status, result);

    if (!boldRes.ok) {
      return NextResponse.json({
        success: false,
        message: result?.message || `Bold API error (${boldRes.status})`,
        detail: result,
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