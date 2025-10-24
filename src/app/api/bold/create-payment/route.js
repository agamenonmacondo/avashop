import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('📦 [CREATE-PAYMENT] Body recibido:', JSON.stringify(body, null, 2));
    
    const { orderId, amount, currency } = body;

    // Validar datos recibidos
    if (!orderId || !amount) {
      console.error('❌ [CREATE-PAYMENT] Faltan datos obligatorios');
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan orderId o amount' 
      }, { status: 400 });
    }

    // **GENERAR EL HASH DE INTEGRIDAD**
    const secretKey = process.env.BOLD_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ [CREATE-PAYMENT] BOLD_SECRET_KEY no está configurada');
      return NextResponse.json({ 
        success: false, 
        message: 'Configuración del servidor incompleta' 
      }, { status: 500 });
    }

    // Concatenar: {orderId}{amount}{currency}{secretKey}
    const dataToHash = `${orderId}${amount}${currency || 'COP'}${secretKey}`;
    
    // Generar hash SHA256
    const integritySignature = crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex');

    console.log('🔐 [CREATE-PAYMENT] Hash generado:', integritySignature);

    // **RETORNAR DATOS PARA EL BOTÓN DE BOLD**
    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        amount: amount,
        currency: currency || 'COP',
        integritySignature: integritySignature,
      },
      message: 'Datos de pago preparados exitosamente',
    }, { status: 200 });

  } catch (error) {
    console.error('💥 [CREATE-PAYMENT] Error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message 
    }, { status: 500 });
  }
}