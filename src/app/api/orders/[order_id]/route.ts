import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient'; // ok si @ funciona
import { sendOrderEmail } from '../../../../lib/sendMail'; // o usa ruta relativa si no

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { order_id: string } }) {
  const { order_id } = params;

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
  console.log('📦 [GET ORDER] Items detallados:', items);

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

  console.log('📤 [GET ORDER] Respuesta formateada:', {
    orderId: response.orderId,
    itemsCount: response.items.length,
    items: response.items,
  });

  if (response.status === 'paid' || response.status === 'approved') {
    try {
      await sendOrderEmail(response.shipping.email, `Confirmación #${response.orderId}`, `<p>Total: ${response.total}</p>`);
      console.log('Correo enviado');
    } catch (e) {
      console.error('Error enviando correo:', e);
    }
  }

  return NextResponse.json(response);

}