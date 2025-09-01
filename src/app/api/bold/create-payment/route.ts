import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Función para generar hash SHA-256 según documentación oficial de Bold (Node-friendly)
function generateBoldHash(orderId: string, amount: number, currency: string, secret: string): string {
  // Concatenar exactamente como Bold especifica: {Identificador}{Monto}{Divisa}{LlaveSecreta}
  const cadenaConcatenada = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(cadenaConcatenada, 'utf8').digest('hex');
}

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
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

    // Validaciones según documentación Bold
    if (amount <= 0) {
      console.warn('Falta amount o es cero', received);
      return NextResponse.json({
        success: false,
        message: 'Campo amount faltante o inválido (debe ser > 0).',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    // Bold requiere mínimo COP 1000
    if (currency === 'COP' && amount < 1000) {
      return NextResponse.json({
        success: false,
        message: 'El monto mínimo para COP es $1.000',
        received
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

    // Credenciales (trim para evitar espacios invisibles)
    const apiKey = (process.env.NEXT_PUBLIC_BOLD_API_KEY || '').trim();
    const secret = (process.env.BOLD_SECRET_KEY || '').trim();

    if (!apiKey || !secret) {
      console.error('Missing Bold credentials (NEXT_PUBLIC_BOLD_API_KEY or BOLD_SECRET_KEY)');
      return NextResponse.json({ success: false, message: 'Server not configured: missing Bold keys' }, { status: 500 });
    }
    // mask para logs (no imprimir secret)
    const mask = (s = '') => s ? `${s.slice(0,4)}...${s.slice(-4)}` : 'null';
    console.log('ENV (masked) apiKey:', mask(apiKey), ' secret: (hidden)');

    // Generar integritySignature usando la función (Node)
    const integritySignature = generateBoldHash(orderId, amount, currency, secret);

    console.log('Hash generado con formato Bold oficial:', integritySignature);
    console.log('Cadena concatenada:', `${orderId}${amount}${currency}***`); // secret enmascarado

    // Construir payload EXACTO según documentación Bold
    const payload: Record<string, any> = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      redirection_url: redirectionUrl,
      description: body.description || `Pedido ${orderId}`,
    };

    // Campos opcionales según documentación (customerData y billingAddress como JSON string)
    if (body.customerData && typeof body.customerData === 'object' && Object.keys(body.customerData).length > 0) {
      payload.customerData = JSON.stringify(body.customerData);
    } else if (typeof body.customerData === 'string') {
      payload.customerData = body.customerData;
    }

    if (body.billingAddress && typeof body.billingAddress === 'object' && Object.keys(body.billingAddress).length > 0) {
      payload.billingAddress = JSON.stringify(body.billingAddress);
    } else if (typeof body.billingAddress === 'string') {
      payload.billingAddress = body.billingAddress;
    }

    // Campos extra opcionales (mín 2, máx 60 caracteres)
    if (typeof body['extra-data-1'] === 'string' && body['extra-data-1'].length >= 2 && body['extra-data-1'].length <= 60) {
      payload['extra-data-1'] = body['extra-data-1'];
    }
    if (typeof body['extra-data-2'] === 'string' && body['extra-data-2'].length >= 2 && body['extra-data-2'].length <= 60) {
      payload['extra-data-2'] = body['extra-data-2'];
    }

    // Validar description (mín 2, máx 100 caracteres)
    if (payload.description && (payload.description.length < 2 || payload.description.length > 100)) {
      payload.description = `Pedido ${orderId}`;
    }

    // LOG antes de enviar
    console.log('Payload enviado a Bold (sin items):', JSON.stringify(payload, null, 2));

    // Headers según documentación Bold - tipado seguro
    // Usar únicamente 'x-api-key' (evita variantes que pueden provocar 500)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    };

    let boldResponse: any = null;
    let lastError = '';
    try {
      console.log('Probando header x-api-key');
      const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const responseText = await boldRes.text();
      console.log(`Respuesta Bold (status ${boldRes.status}):`, responseText);

      if (boldRes.ok) {
        try { boldResponse = JSON.parse(responseText); } catch { boldResponse = responseText; }
      } else {
        // detectar 401 para dar pista (BTN-000)
        if (boldRes.status === 401) {
          lastError = responseText || 'Unauthorized (401) from Bold - check identity key';
          console.error('Bold returned 401 - identity key likely invalid');
        } else {
          lastError = responseText || `Bold error status ${boldRes.status}`;
        }
      }
    } catch (fetchErr) {
      console.error('Error en fetch hacia Bold:', fetchErr);
      lastError = String(fetchErr);
    }

    if (!boldResponse) {
      return NextResponse.json({
        success: false,
        message: 'Bold API error',
        detail: lastError,
        hint: boldResHint(lastError),
        debug: { received, payload: { ...payload, apiKey: mask(apiKey), integritySignature: integritySignature.slice(0,8) + '...' } }
      }, { status: 502 });
    }
    // helper para sugerir causa simple
    function boldResHint(detail: string) {
      if (!detail) return null;
      if (detail.toLowerCase().includes('unauthorized') || detail.includes('401')) return 'BTN-000: identity key invalid or wrong environment (test vs production).';
      if (detail.toLowerCase().includes('integrity') || detail.toLowerCase().includes('integrity key')) return 'BTN-002: integrity signature mismatch.';
      return null;
    }

    // Extraer URL de redirección que Bold devuelva
    const redirectFromBold = boldResponse?.redirect_url || boldResponse?.data?.redirect_url || boldResponse?.redirectUrl || null;

    return NextResponse.json({
      success: true,
      data: boldResponse,
      redirectUrl: redirectFromBold
    }, { status: 200 });

  } catch (err) {
    console.error('Error en create-payment:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error', 
      error: String(err) 
    }, { status: 500 });
  }
}






