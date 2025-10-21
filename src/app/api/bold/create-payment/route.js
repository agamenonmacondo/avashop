import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateBoldHash(orderId, amount, currency, secret) {
  const s = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2));

    const rawAmount = body.amount ?? body.totalAmount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();
    const redirectUrl = body.redirectUrl || process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || '';

    // Validaciones
    if (amount <= 0) {
      return NextResponse.json({ success: false, message: 'Monto inválido' }, { status: 400 });
    }
    if (!redirectUrl) {
      return NextResponse.json({ success: false, message: 'URL de redirección faltante' }, { status: 400 });
    }

    const apiKey = (process.env.NEXT_PUBLIC_BOLD_API_KEY || '').trim();
    const secret = (process.env.BOLD_SECRET_KEY || '').trim();
    const isSandbox = process.env.BOLD_SANDBOX === 'true';

    if (!apiKey || !secret) {
      console.error('Credenciales Bold faltantes');
      return NextResponse.json({ success: false, message: 'Servidor no configurado' }, { status: 500 });
    }

    const integritySignature = generateBoldHash(orderId, amount, currency, secret);

    // URL según ambiente
    const boldUrl = isSandbox 
      ? 'https://sandbox.api.bold.co/v1/payment-btn'
      : 'https://api.bold.co/v1/payment-btn';

    // Payload correcto según documentación Bold
    const payload = {
      orderId,
      amount,
      currency,
      integritySignature,
      redirectionUrl: redirectUrl,
      description: body.description || `Pedido ${orderId}`,
    };

    console.log('Enviando a Bold:', { 
      url: boldUrl,
      ...payload, 
      integritySignature: integritySignature.slice(0,8) + '...',
      apiKeyLength: apiKey.length 
    });

    const boldRes = await fetch(boldUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await boldRes.text();
    console.log(`Respuesta Bold (${boldRes.status}):`, responseText);

    if (!boldRes.ok) {
      let errorDetail = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetail = errorJson.message || errorJson.error || responseText;
      } catch {}

      return NextResponse.json({
        success: false,
        message: 'Error de Bold API',
        detail: errorDetail,
        status: boldRes.status,
      }, { status: 502 });
    }

    const boldResponse = JSON.parse(responseText);

    // Preparar respuesta para el botón
    const buttonData = {
      apiKey,
      orderId,
      amount,
      currency,
      signature: integritySignature,
      redirectionUrl: redirectUrl,
      description: payload.description,
    };

    return NextResponse.json({ 
      success: true, 
      data: buttonData,
      redirectUrl: boldResponse.redirect_url || redirectUrl 
    }, { status: 200 });

  } catch (err) {
    console.error('Error interno:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor', 
      error: String(err) 
    }, { status: 500 });
  }
}