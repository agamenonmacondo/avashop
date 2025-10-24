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

    // **ACTUALIZAR solo el estado, no insertar de nuevo**
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        payment_status: 'approved',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', payload.orderId)
      .select()
      .single();

    if (orderError) {
      console.error('❌ [BOLD] Error actualizando orden:', orderError);
      throw orderError;
    }

    console.log('✅ [BOLD] Orden actualizada a APPROVED:', order);

    // Aquí puedes enviar email de confirmación, limpiar carrito, etc.

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