import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  console.log('🔍 [GET ORDER] Buscando orden:', order_id);

  if (!order_id) {
    console.error('❌ [GET ORDER] order_id no proporcionado');
    return NextResponse.json(
      { success: false, error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    // Obtener la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
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
  } catch (error) {
    console.error('Error en GET /api/orders/[order_id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  console.log('🔄 [UPDATE ORDER] Actualizando orden:', order_id);

  if (!order_id) {
    console.error('❌ [UPDATE ORDER] order_id no proporcionado');
    return NextResponse.json(
      { success: false, error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { items, shipping, ...orderUpdates } = body;

    // Actualizar la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(orderUpdates)
      .eq('order_id', order_id)
      .select()
      .single();

    if (orderError) {
      console.error('Error actualizando orden:', orderError);
      return NextResponse.json(
        { error: 'Error actualizando la orden' },
        { status: 500 }
      );
    }

    // Actualizar los items de la orden
    if (items) {
      for (const item of items) {
        const { product_id, quantity, ...itemUpdates } = item;

        // Actualizar item
        const { error: itemError } = await supabase
          .from('order_items')
          .update(itemUpdates)
          .eq('order_id', order_id)
          .eq('product_id', product_id);

        if (itemError) {
          console.error('Error actualizando item:', itemError);
        }
      }
    }

    // Actualizar detalles de envío
    if (shipping) {
      const { error: shippingError } = await supabase
        .from('order_shipping')
        .update(shipping)
        .eq('order_id', order_id);

      if (shippingError) {
        console.error('Error actualizando detalles de envío:', shippingError);
      }
    }

    return NextResponse.json({ success: true, orderId: order_id });
  } catch (error) {
    console.error('Error en PUT /api/orders/[order_id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  console.log('🗑️ [DELETE ORDER] Eliminando orden:', order_id);

  if (!order_id) {
    console.error('❌ [DELETE ORDER] order_id no proporcionado');
    return NextResponse.json(
      { success: false, error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    // Eliminar items de la orden
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order_id);

    if (itemsError) {
      console.error('Error eliminando items:', itemsError);
    }

    // Eliminar la orden
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', order_id);

    if (orderError) {
      console.error('Error eliminando orden:', orderError);
      return NextResponse.json(
        { error: 'Error eliminando la orden' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/orders/[order_id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}