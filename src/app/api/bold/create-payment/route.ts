import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // LOG: ver exactamente qué llega al backend
    console.log('Body recibido en backend:', JSON.stringify(body, null, 2));

    // Comprobaciones explícitas para detectar lo que falta
    const received = {
      hasAmount: typeof body.amount !== 'undefined' && body.amount !== null,
      amountValue: Number(body.amount || 0),
      hasCartItems: Array.isArray(body.cartItems) && body.cartItems.length > 0,
      cartItemsLength: Array.isArray(body.cartItems) ? body.cartItems.length : 0,
      hasOrderId: !!body.orderId,
      hasRedirectUrl: !!body.redirectUrl,
    };

    if (!received.hasAmount || received.amountValue <= 0) {
      console.warn('Falta amount o es cero en el body recibido', received);
      return NextResponse.json({
        success: false,
        message: 'Campo amount faltante o inválido (debe ser > 0).',
        missing: 'amount',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    if (!received.hasCartItems) {
      console.warn('Faltan cartItems en el body recibido', received);
      return NextResponse.json({
        success: false,
        message: 'Campo cartItems faltante o vacío.',
        missing: 'cartItems',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    // Valores básicos
    const amount = Math.round(Number(body.amount));
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();

    // Credenciales
    const secret = process.env.BOLD_SECRET_KEY;
    const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY;
    if (!secret || !apiKey) {
      console.error('Missing Bold credentials');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // Generar signature
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    const redirectionUrl = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || body.redirectUrl;
    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      description: body.description || `Pedido ${orderId}`
    };

    if (body.customerData) payload.customerData = JSON.stringify(body.customerData);
    if (body.billingAddress) payload.billingAddress = JSON.stringify(body.billingAddress);

    console.log('Payload enviado a Bold:', JSON.stringify(payload));

    const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${apiKey}`,
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

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (err) {
    console.error('Error en create-payment:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}