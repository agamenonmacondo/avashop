import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Body recibido en backend:', body);

    // Extraer valores del body
    const amount = Math.round(Number(body.amount) || 0);
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();

    // Validaciones básicas
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'El monto debe ser mayor a cero.' }, { status: 400 });
    }

    // Variables de entorno
    const secret = process.env.BOLD_SECRET_KEY;
    const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY;
    
    if (!secret || !apiKey) {
      console.error('Missing Bold credentials');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // Generar hash de integridad exactamente como Bold lo requiere
    const concatenated = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    // URL de redirección
    const redirectionUrl = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || body.redirectUrl;
    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    // Payload SIMPLIFICADO según documentación Bold
    const payload = {
      apiKey: apiKey,
      amount: amount,
      currency: currency,
      orderId: orderId,
      integritySignature: integritySignature,
      redirectionUrl: redirectionUrl,
      description: `Pedido ${orderId}`
    };

    // Agregar datos opcionales solo si existen
    if (body.customerData && Object.keys(body.customerData).length > 0) {
      payload.customerData = JSON.stringify(body.customerData);
    }
    
    if (body.billingAddress && Object.keys(body.billingAddress).length > 0) {
      payload.billingAddress = JSON.stringify(body.billingAddress);
    }

    console.log('Payload enviado a Bold:', payload);

    // Llamar a Bold con headers correctos
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
      const message = result?.message || result?.error || `Bold API error (${boldRes.status})`;
      return NextResponse.json({ 
        success: false, 
        message, 
        detail: result,
        debug: { payload, status: boldRes.status }
      }, { status: boldRes.status });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (err) {
    console.error('Error en create-payment:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}