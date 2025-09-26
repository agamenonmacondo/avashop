import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateBoldHash(orderId, amount, currency, secret) {
  const s = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Body recib:', JSON.stringify(body, null, 2));

    const rawAmount = body.amount ?? body.totalAmount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();
    const redirectUrl = body.redirectUrl || process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '';

    // Validaciones básicas
    if (amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount (must be > 0).' }, { status: 400 });
    }
    if (!redirectUrl) {
      return NextResponse.json({ success: false, message: 'Missing redirectUrl' }, { status: 400 });
    }

    // Credenciales (trim para evitar espacios invisibles)
    const envApiKey = (process.env.NEXT_PUBLIC_BOLD_API_KEY || '').trim();
    const secret = (process.env.BOLD_SECRET_KEY || '').trim();
    const testingApiKey = typeof body.testingApiKey === 'string' ? body.testingApiKey.trim() : '';
    const apiKey = testingApiKey || envApiKey;

    const mask = s => s ? `${s.slice(0,4)}...${s.slice(-4)}` : 'null';
    console.log('ENV (masked) apiKey:', mask(apiKey), ' secret: (hidden)');

    if (!apiKey || !secret) {
      console.error('Missing Bold credentials (NEXT_PUBLIC_BOLD_API_KEY or BOLD_SECRET_KEY)');
      return NextResponse.json({ success: false, message: 'Server not configured: missing Bold keys' }, { status: 500 });
    }

    const integritySignature = generateBoldHash(orderId, amount, currency, secret);
    console.log('Hash generado:', integritySignature.slice(0,8) + '...');

    const payload = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl: redirectUrl,
      redirection_url: redirectUrl,
      description: body.description || `Pedido ${orderId}`,
    };

    if (body.customerData && typeof body.customerData === 'object') payload.customerData = JSON.stringify(body.customerData);
    if (body.billingAddress && typeof body.billingAddress === 'object') payload.billingAddress = JSON.stringify(body.billingAddress);

    console.log('Payload enviado a Bold (mask apiKey):', JSON.stringify({ ...payload, apiKey: mask(apiKey), integritySignature: integritySignature.slice(0,8) + '...' }));

    const headerVariants = [
      { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      { 'Content-Type': 'application/json', 'api-key': apiKey },
    ];

    let lastText = '';
    let lastStatus = 0;
    let boldResponse = null;
    const tried = [];

    for (const hdr of headerVariants) {
      try {
        tried.push(Object.keys(hdr));
        console.log('Probando headers:', Object.keys(hdr));
        const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
          method: 'POST',
          headers: hdr,
          body: JSON.stringify(payload),
        });
        const text = await boldRes.text().catch(() => '');
        console.log(`Respuesta Bold (status ${boldRes.status}):`, text);
        lastText = text || lastText;
        lastStatus = boldRes.status || lastStatus;

        if (boldRes.ok) {
          try { boldResponse = JSON.parse(text); } catch { boldResponse = text; }
          break;
        } else if (boldRes.status === 401) {
          // pista clara para BTN-000
          console.error('Bold returned 401 - identity key likely invalid. Tried headers:', Object.keys(hdr));
          lastText = text || 'Unauthorized (401) from Bold - check identity key';
          // seguir probando otras variantes
        }
      } catch (fetchErr) {
        console.error('Fetch error hacia Bold:', fetchErr);
        lastText = String(fetchErr) || lastText;
      }
    }

    if (!boldResponse) {
      return NextResponse.json({
        success: false,
        message: 'Bold API error - todas las variantes fallaron',
        detail: lastText,
        boldStatus: lastStatus,
        hint: lastStatus === 401 ? 'BTN-000 probable: revisa identity key (NEXT_PUBLIC_BOLD_API_KEY) o usa testingApiKey en el body para aislar.' : undefined,
        debug: { orderId, amount, currency, apiKeyMasked: mask(apiKey), envApiKeyMasked: mask(envApiKey), triedHeaders: tried, testingApiKeyUsed: !!testingApiKey }
      }, { status: 502 });
    }

    const redirectFromBold = boldResponse?.redirect_url || boldResponse?.data?.redirect_url || boldResponse?.redirectUrl || null;
    if (boldResponse.ok && boldResponse.success && boldResponse.data) {
      // forzar la URL absoluta de redirección para el botón (clave usada por el script)
      boldResponse.data.redirect_url = redirectFromBold;
      boldResponse.data['data-redirection-url'] = redirectFromBold;
      // Agrega el modo embedded
      boldResponse.data['renderMode'] = 'embedded'; // <--- ESTA LÍNEA
    }
    return NextResponse.json({ success: true, data: boldResponse, redirectUrl: redirectFromBold }, { status: 200 });

  } catch (err) {
    console.error('Handler error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(err) }, { status: 500 });
  }
}