import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateBoldHash(orderId, amount, currency, secret) {
  const s = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Body recib:', JSON.stringify(body));

    const amount = Math.round(Number(body.amount ?? body.totalAmount ?? 0) || 0);
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();
    const redirectUrl = body.redirectUrl || process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '';

    // Env check (mascarado)
    const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY || '';
    const secret = process.env.BOLD_SECRET_KEY || '';
    const mask = s => s ? `${s.slice(0,4)}...${s.slice(-4)}` : 'null';
    console.log('env (masked) apiKey:', mask(apiKey), ' secret:', mask(secret));

    if (!apiKey || !secret) {
      return NextResponse.json({ success: false, message: 'Missing Bold credentials' }, { status: 500 });
    }

    if (amount <= 0) return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    if (!redirectUrl) return NextResponse.json({ success: false, message: 'Missing redirectUrl' }, { status: 400 });

    const integritySignature = generateBoldHash(orderId, amount, currency, secret);
    console.log('signature:', integritySignature);

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

    console.log('payload:', JSON.stringify(payload));

    const res = await fetch('https://payments.api.bold.co/v2/payment-btn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');
    console.log('Bold status:', res.status, ' body:', text);

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Bold API error', status: res.status, detail: text }, { status: 502 });
    }

    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Handler error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(err) }, { status: 500 });
  }
}