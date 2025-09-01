import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingDetails, cartItems, totalAmount } = body ?? {};

    // validar campos mínimos
    const amount = Math.round(Number(totalAmount) || 0); // entero
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();

    const secret = process.env.BOLD_SECRET_KEY;
    if (!secret) {
      console.error('BOLD_SECRET_KEY missing');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // concatenar exactamente: {orderId}{amount}{currency}{secret}
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    // redirection URL: usar env (definitiva) primero
    const envRedirect = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_BOLD_REDIRECT_UR;
    const clientRedirect = body?.redirectUrl;
    const redirectionUrl = typeof envRedirect === 'string' && envRedirect.startsWith('http')
      ? envRedirect
      : (typeof clientRedirect === 'string' && clientRedirect.startsWith('http') ? clientRedirect : null);

    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    // IDENTIDAD (x-api-key) usada por Bold en header
    const identityKey = process.env.NEXT_PUBLIC_BOLD_API_KEY || process.env.BOLD_API_KEY || null;
    if (!identityKey) {
      console.error('Bold identity key missing (NEXT_PUBLIC_BOLD_API_KEY or BOLD_API_KEY)');
      return NextResponse.json({ success: false, message: 'Payment provider not configured' }, { status: 500 });
    }

    // payload para Bold (ajusta campos según la API que uses)
    const payload = {
      apiKey: identityKey, // algunas apis también aceptan en body, pero la identidad debe ir en header
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      description: `Pedido ${orderId}`,
      // customerData, tax, etc.
    };

    // llamar API de Bold — incluir x-api-key en header (Authorization: x-api-key <key>)
    const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${identityKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await boldRes.json().catch(() => null);

    if (!boldRes.ok) {
      // Propagar información útil para debug sin exponer secrets
      console.error('Bold error', boldRes.status, result);
      const message = result?.message || result?.error || 'Bold API returned an error';
      return NextResponse.json({ success: false, message, detail: result }, { status: boldRes.status });
    }

    // devolver lo que necesite el frontend (asegúrate de no exponer la secret)
    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}