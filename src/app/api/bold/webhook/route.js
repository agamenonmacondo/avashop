import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('🔔 [BOLD WEBHOOK] Notificación recibida:', JSON.stringify(body, null, 2));

    const {
      orderId,
      transactionId,
      status,
      amount,
      paymentMethod,
      transactionDate,
    } = body;

    if (!orderId || !status) {
      console.error('❌ [BOLD WEBHOOK] Faltan datos obligatorios');
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    console.log('✅ [BOLD WEBHOOK] Datos recibidos:', {
      orderId,
      transactionId,
      status,
      amount,
      paymentMethod,
    });

    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ [BOLD WEBHOOK] Supabase no inicializado');
      return NextResponse.json({
        success: false,
        message: 'Database connection failed'
      }, { status: 500 });
    }

    // Actualizar el estado de la orden según la notificación de Bold
    const updateData = {
      payment_status: status.toLowerCase(),
      status: status.toLowerCase(),
      updated_at: new Date().toISOString(),
    };

    // Si el pago fue aprobado, agregar fecha de pago
    if (status.toLowerCase() === 'approved') {
      updateData.paid_at = transactionDate || new Date().toISOString();
      updateData.transaction_id = transactionId;
    }

    console.log('💾 [BOLD WEBHOOK] Actualizando orden:', orderId);
    console.log('📝 [BOLD WEBHOOK] Datos a actualizar:', updateData);

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId)
      .select();

    if (error) {
      console.error('❌ [BOLD WEBHOOK] Error actualizando orden:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to update order',
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ [BOLD WEBHOOK] Orden actualizada correctamente:', data);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      orderId: orderId,
      newStatus: status,
    });

  } catch (error) {
    console.error('💥 [BOLD WEBHOOK] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}