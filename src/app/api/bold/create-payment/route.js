import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

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

    console.log('✅ [CREATE-PAYMENT] Datos válidos recibidos:', { orderId, amount, currency });

    // **GENERAR EL APPLINK DE BOLD**
    const merchantId = process.env.NEXT_PUBLIC_BOLD_MERCHANT_ID || 'CKKA859CGE';
    const boldApplink = `https://bold.co/deeplink?action=start_payment&value_to_collect=${amount}&description=${encodeURIComponent(`Pedido-${orderId}`)}&merchant_id=${merchantId}&reference=${orderId}`;

    console.log('✅ [BOLD] Applink generado:', boldApplink);

    // **RETORNAR RESPUESTA CON URL DE PAGO**
    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentUrl: boldApplink,
      message: 'Enlace de pago generado exitosamente',
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