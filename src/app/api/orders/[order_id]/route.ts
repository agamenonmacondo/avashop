import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getOrderConfirmationEmail } from '@/lib/email';

export const runtime = 'nodejs';

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

  // ✅ Enviar correo de confirmación si el pago está aprobado
  if ((response.status === 'paid' || response.status === 'approved') && response.items.length > 0) {
    const customerEmail = response.shipping?.email;
    
    if (customerEmail) {
      try {
        console.log('📧 [GET ORDER] Enviando correo a:', customerEmail);
        
        const html = getOrderConfirmationEmail({
          orderId: response.orderId,
          customerName: response.shipping?.fullName || response.shipping?.name || 'Cliente',
          items: response.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: response.total,
        });

        const { data, error } = await resend.emails.send({
          from: process.env.SMTP_FROM || 'ventas@ccs724.com',
          to: customerEmail,
          subject: `✅ Confirmación de Pedido #${response.orderId} - CCS724`,
          html,
          replyTo: 'ventas@ccs724.com',
        });

        if (error) {
          console.error('❌ [GET ORDER] Error al enviar correo:', error);
        } else {
          console.log('✅ [GET ORDER] Correo enviado exitosamente:', data?.id);
        }
      } catch (error) {
        console.error('❌ [GET ORDER] Error enviando correo:', error);
      }
    } else {
      console.warn('⚠️ [GET ORDER] No se encontró email del cliente');
    }
  } else {
    console.log('ℹ️ [GET ORDER] No se envía correo - Estado:', response.status, '- Items:', response.items.length);
  }

  return NextResponse.json(response);
}