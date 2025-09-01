import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // LOG: ver exactamente qué llega al backend
    console.log('Body recibido en backend:', JSON.stringify(body, null, 2));

    // Normalizar amount (acepta `amount` o `totalAmount`)
    const rawAmount = body.amount ?? body.totalAmount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);

    // Normalizar cartItems
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

    // Validaciones rápidas
    const received = {
      rawAmount,
      amount,
      cartItemsLength: cartItems.length,
      hasOrderId: !!body.orderId,
      redirectionUrl,
    };

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

    // Generar signature SHA256(orderId + amount + currency + secret)
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    // Construir payload mínimo requerido por Bold
    const payload: Record<string, any> = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      description: body.description || `Pedido ${orderId}`,
    };

    // Agregar opcionales en el formato que Bold espera
    // customerData y billingAddress deben ser strings (JSON) si existen
    if (body.customerData && Object.keys(body.customerData).length > 0) {
      payload.customerData = typeof body.customerData === 'string' ? body.customerData : JSON.stringify(body.customerData);
    }
    if (body.billingAddress && Object.keys(body.billingAddress).length > 0) {
      payload.billingAddress = typeof body.billingAddress === 'string' ? body.billingAddress : JSON.stringify(body.billingAddress);
    }
    // adjuntar items para debug (Bold no requiere items en payload; se incluye para trazabilidad)
    payload.items = cartItems;

    console.log('Payload enviado a Bold:', JSON.stringify(payload, null, 2));

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
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(err) }, { status: 500 });
  }
}