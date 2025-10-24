import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [BOLD WEBHOOK] Recibiendo notificación...');

    // Leer el body del webhook
    const payload: BoldWebhookPayload = await request.json();
    
    console.log('📦 [BOLD WEBHOOK] Payload recibido:', JSON.stringify(payload, null, 2));

    // Validar que el webhook venga de Bold (opcional: agregar verificación de firma)
    const headersList = headers();
    const boldSignature = headersList.get('x-bold-signature');
    
    if (boldSignature) {
      console.log('🔐 [BOLD WEBHOOK] Signature:', boldSignature);
      // Aquí puedes validar la firma si Bold la proporciona
    }

    // Validar campos requeridos
    if (!payload.orderId || !payload.status) {
      console.error('❌ [BOLD WEBHOOK] Payload inválido - faltan campos requeridos');
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      );
    }

    // Procesar según el estado de la transacción
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

    // Responder 200 OK a Bold para confirmar recepción
    return NextResponse.json({ received: true, orderId: payload.orderId }, { status: 200 });

  } catch (error) {
    console.error('💥 [BOLD WEBHOOK] Error procesando webhook:', error);
    
    // Aún así, responder 200 para evitar reintentos innecesarios
    return NextResponse.json(
      { error: 'Internal server error', received: false },
      { status: 500 }
    );
  }
}

// Función para manejar pagos aprobados
async function handleApprovedPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`💳 [BOLD] Procesando pago aprobado para orden: ${payload.orderId}`);

    // Aquí puedes:
    // 1. Actualizar el estado de la orden en tu base de datos
    // 2. Limpiar el carrito del usuario
    // 3. Enviar email de confirmación
    // 4. Generar factura
    // 5. Notificar al usuario

    // Ejemplo: Guardar en Supabase (si usas Supabase)
    // const { getSupabase } = await import('@/lib/supabaseClient');
    // const supabase = getSupabase();
    // 
    // await supabase.from('orders').update({
    //   status: 'paid',
    //   payment_status: 'approved',
    //   transaction_id: payload.transactionId,
    //   paid_at: new Date().toISOString()
    // }).eq('order_id', payload.orderId);

    console.log(`✅ [BOLD] Pago aprobado procesado exitosamente`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago aprobado:`, error);
    throw error;
  }
}

// Función para manejar pagos rechazados
async function handleDeclinedPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`❌ [BOLD] Procesando pago rechazado para orden: ${payload.orderId}`);

    // Aquí puedes:
    // 1. Actualizar el estado de la orden como "failed"
    // 2. Notificar al usuario del rechazo
    // 3. Ofrecer métodos de pago alternativos

    console.log(`⚠️ [BOLD] Pago rechazado procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago rechazado:`, error);
    throw error;
  }
}

// Función para manejar pagos pendientes
async function handlePendingPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`⏳ [BOLD] Procesando pago pendiente para orden: ${payload.orderId}`);

    // Aquí puedes:
    // 1. Actualizar el estado como "pending"
    // 2. Enviar notificación de espera al usuario

    console.log(`⏳ [BOLD] Pago pendiente procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando pago pendiente:`, error);
    throw error;
  }
}

// Función para manejar errores de pago
async function handleErrorPayment(payload: BoldWebhookPayload) {
  try {
    console.log(`⚠️ [BOLD] Procesando error de pago para orden: ${payload.orderId}`);

    // Aquí puedes:
    // 1. Registrar el error
    // 2. Notificar al equipo de soporte
    // 3. Intentar un reintento automático si aplica

    console.log(`⚠️ [BOLD] Error de pago procesado`);

  } catch (error) {
    console.error(`❌ [BOLD] Error procesando error de pago:`, error);
    throw error;
  }
}

// Permitir solo POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}