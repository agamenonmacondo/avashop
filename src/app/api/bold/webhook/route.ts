import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabase } from '@/lib/supabaseClient';

// Tipos para el webhook de Bold
interface BoldWebhookPayload {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  orderId: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  shippingDetails?: any;
  cartItems?: any[];
  subtotal?: number;
  iva?: number;
  shipping?: number;
  userEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [BOLD WEBHOOK] Recibiendo notificación...');

    const payload: BoldWebhookPayload = await request.json();
    
    console.log('📦 [BOLD WEBHOOK] Payload recibido:', JSON.stringify(payload, null, 2));

    const headersList = await headers();
    const boldSignature = headersList.get('x-bold-signature');
    
    if (boldSignature) {
      console.log('🔐 [BOLD WEBHOOK] Signature:', boldSignature);
    }

    if (!payload.orderId || !payload.status) {
      console.error('❌ [BOLD WEBHOOK] Payload inválido - faltan campos requeridos');
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      );
    }

    switch (payload.status) {
      case 'APPROVED':
        console.log('✅ [BOLD WEBHOOK] Pago APROBADO');
        await handleApprovedPayment(payload);
        break;

      case 'DECLINED':
        console.log('❌ [BOLD WEBHOOK] Pago RECHAZADO');
        await handleDeclinedPayment(payload);
        break;

      case 'PENDING':
        console.log('⏳ [BOLD WEBHOOK] Pago PENDIENTE');
        await handlePendingPayment(payload);
        break;

      case 'ERROR':
        console.log('⚠️ [BOLD WEBHOOK] Pago con ERROR');
        await handleErrorPayment(payload);
        break;

      default:
        console.log('❓ [BOLD WEBHOOK] Estado desconocido:', payload.status);
    }

    return NextResponse.json({ received: true, orderId: payload.orderId }, { status: 200 });

  } catch (error) {
    console.error('💥 [BOLD WEBHOOK] Error procesando webhook:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', received: false },
      { status: 500 }
    );
  }
}

async function handleApprovedPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`💳 [BOLD] Procesando pago aprobado para orden: ${payload.orderId}`);

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase no está inicializado');
    }

    // 1. Crear/actualizar la orden principal
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .upsert({
        order_id: payload.orderId,
        user_email: payload.userEmail || 'unknown@example.com',
        amount: payload.amount,
        currency: payload.currency,
        status: 'approved',
        payment_status: 'approved',
        payment_method: payload.paymentMethod,
        transaction_id: payload.transactionId,
        shipping_details: payload.shippingDetails || {},
        metadata: {
          reference: payload.reference,
          description: payload.description,
        },
        subtotal: payload.subtotal || 0,
        iva: payload.iva || 0,
        shipping_cost: payload.shipping || 0,
        total_amount: payload.amount,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'order_id'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ [BOLD] Error guardando orden:', orderError);
      throw orderError;
    }

    console.log('✅ [BOLD] Orden guardada:', order);

    // 2. Guardar los items de la orden
    if (payload.cartItems && payload.cartItems.length > 0) {
      const orderItems = payload.cartItems.map((item: any) => ({
        order_id: payload.orderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.imageUrls?.[0] || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ [BOLD] Error guardando items:', itemsError);
        throw itemsError;
      }

      console.log('✅ [BOLD] Items guardados:', orderItems.length);
    }

    console.log(`✅ [BOLD] Pago aprobado procesado exitosamente`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago aprobado:`, error);
    throw error;
  }
}

async function handleDeclinedPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`❌ [BOLD] Procesando pago rechazado para orden: ${payload.orderId}`);

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('orders')
      .upsert({
        order_id: payload.orderId,
        status: 'declined',
        payment_status: 'declined',
        transaction_id: payload.transactionId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'order_id'
      });

    console.log(`⚠️ [BOLD] Pago rechazado procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago rechazado:`, error);
  }
}

async function handlePendingPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`⏳ [BOLD] Procesando pago pendiente para orden: ${payload.orderId}`);

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('orders')
      .upsert({
        order_id: payload.orderId,
        status: 'pending',
        payment_status: 'pending',
        transaction_id: payload.transactionId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'order_id'
      });

    console.log(`⏳ [BOLD] Pago pendiente procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago pendiente:`, error);
  }
}

async function handleErrorPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`⚠️ [BOLD] Procesando error de pago para orden: ${payload.orderId}`);

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('orders')
      .upsert({
        order_id: payload.orderId,
        status: 'error',
        payment_status: 'error',
        transaction_id: payload.transactionId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'order_id'
      });

    console.log(`⚠️ [BOLD] Error de pago procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando error de pago:`, error);
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}