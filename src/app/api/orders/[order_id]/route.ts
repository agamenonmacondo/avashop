import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { order_id: string } }
) {
  try {
    const { order_id } = params;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
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
      console.error('Error obteniendo orden:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Obtener los items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError) {
      console.error('Error obteniendo items:', itemsError);
    }

    // Formatear la respuesta
    const response = {
      orderId: order.order_id,
      status: order.payment_status || order.status,
      total: order.total_amount || order.amount,
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

  } catch (error) {
    console.error('Error en GET /api/orders/[order_id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}