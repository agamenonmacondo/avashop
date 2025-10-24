import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    // ⭐ Await params en Next.js 15
    const { order_id } = await params;

    console.log('🔍 [GET ORDER] Buscando orden:', order_id);

    if (!order_id) {
      console.error('❌ [GET ORDER] order_id no proporcionado');
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ [GET ORDER] Supabase no inicializado');
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Obtener la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ [GET ORDER] Orden no encontrada:', orderError);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ [GET ORDER] Orden encontrada:', order.order_id);

    // Obtener los items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError) {
      console.error('⚠️ [GET ORDER] Error obteniendo items:', itemsError);
    }

    console.log('✅ [GET ORDER] Items encontrados:', items?.length || 0);

    // Formatear la respuesta
    const response = {
      success: true,
      orderId: order.order_id,
      status: order.payment_status || order.status,
      total: order.total_amount || order.amount || 0,
      subtotal: order.subtotal || 0,
      iva: order.iva || 0,
      envio: order.shipping_cost || 0,
      items: items?.map(item => ({
        id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image_url,
      })) || [],
      shipping: order.shipping_details || {},
      createdAt: order.created_at,
      paidAt: order.paid_at,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 [GET ORDER] Error interno:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}