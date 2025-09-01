import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingDetails, cartItems, totalAmount, currency: bodyCurrency, orderId: bodyOrderId, tax, customerData, billingAddress } = body ?? {};

    // Validar y preparar campos obligatorios
    const amount = Math.round(Number(totalAmount) || 0); // entero
    const currency = (bodyCurrency || 'COP').toString().toUpperCase();
    const orderId = (bodyOrderId || `order-${Date.now()}`).toString();

    const secret = process.env.BOLD_SECRET_KEY;
    if (!secret) {
      console.error('BOLD_SECRET_KEY missing');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // Generar hash de integridad
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    // Redirection URL: usar env (definitiva) primero
    const envRedirect = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_BOLD_REDIRECT_UR;
    const clientRedirect = body?.redirectUrl;
    const redirectionUrl = typeof envRedirect === 'string' && envRedirect.startsWith('http')
      ? envRedirect
      : (typeof clientRedirect === 'string' && clientRedirect.startsWith('http') ? clientRedirect : null);

    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    // Llave de identidad (api-key)
    const identityKey = process.env.NEXT_PUBLIC_BOLD_API_KEY || process.env.BOLD_API_KEY || null;
    if (!identityKey) {
      console.error('Bold identity key missing (NEXT_PUBLIC_BOLD_API_KEY or BOLD_API_KEY)');
      return NextResponse.json({ success: false, message: 'Payment provider not configured' }, { status: 500 });
    }

    // Construir payload según documentación Bold
    const payload: Record<string, any> = {
      apiKey: identityKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      description: `Pedido ${orderId}`,
    };

    // Opcionales: impuestos, datos de cliente, dirección
    if (tax) payload.tax = tax;
    if (customerData) payload['customerData'] = JSON.stringify(customerData);
    if (billingAddress) payload['billingAddress'] = JSON.stringify(billingAddress);

    // LOG para depuración (no exponer secret)
    console.log('Payload enviado a Bold:', payload);

    // Llamar API de Bold
    const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${identityKey}`,
      },
      body: JSON.stringify(payload),
    });

    // ...después de recibir la respuesta de Bold:
    const result = await boldRes.json().catch(() => null);
    console.log('Respuesta de Bold:', boldRes.status, result); // <--- AGREGA ESTO

    // LOG de respuesta
    console.log('Respuesta de Bold:', boldRes.status, result);

    if (!boldRes.ok) {
      const message = result?.message || result?.error || 'Bold API returned an error';
      // Devuelve el mensaje y el body completo para debug
      return NextResponse.json({ 
        success: false, 
        message, 
        detail: result, 
        debug: {
          payload,
          status: boldRes.status
        }
      }, { status: boldRes.status });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}