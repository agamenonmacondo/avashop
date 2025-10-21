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

    const amount = Math.round(Number(body.amount) || 0);
    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();

    // Validaciones
    if (amount <= 0) {
      return NextResponse.json({ success: false, message: 'Monto inválido' }, { status: 400 });
    }

    const secret = (process.env.BOLD_SECRET_KEY || '').trim();

    if (!secret) {
      console.error('Llave secreta Bold faltante');
      return NextResponse.json({ success: false, message: 'Servidor no configurado' }, { status: 500 });
    }

    // Solo generamos el hash de integridad
    const integritySignature = generateBoldHash(orderId, amount, currency, secret);

    console.log('Hash generado:', { 
      orderId,
      amount,
      currency,
      integritySignature: integritySignature.slice(0,8) + '...'
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        orderId,
        amount,
        currency,
        integritySignature,
      }
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