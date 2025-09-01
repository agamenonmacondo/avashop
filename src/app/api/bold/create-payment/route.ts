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

    // payload para Bold (ajusta campos según la API que uses)
    const payload = {
      apiKey: process.env.NEXT_PUBLIC_BOLD_API_KEY, // pública
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      description: `Pedido ${orderId}`,
      // customerData, tax, etc.
    };

    // llamar API de Bold
    const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await boldRes.json();
    if (!boldRes.ok) {
      console.error('Bold error', result);
      return NextResponse.json({ success: false, message: result?.message || 'Bold error', detail: result }, { status: 502 });
    }

    // devolver lo que necesite el frontend (asegúrate de no exponer la secret)
    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}