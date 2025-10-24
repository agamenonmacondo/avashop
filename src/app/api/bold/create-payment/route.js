import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabaseClient';

function generateBoldHash(orderId, amount, currency, secret) {
  const s = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { shippingData, cartItems, totalAmount, userEmail } = body;

    // Generar ID único para la orden
    const orderId = `order-${Date.now()}`;

    // Calcular subtotales
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const iva = Math.round(subtotal * 0.19);
    const shippingCost = totalAmount >= 150000 ? 0 : 15000;

    console.log('📦 [CREATE-PAYMENT] Creando pago para orden:', orderId);

    // **PASO 1: Crear el pago en Bold primero**
    const boldResponse = await fetch('https://api.bold.co/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BOLD_API_KEY}`,
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: totalAmount,
        currency: 'COP',
        description: `Pedido AVA Shop - ${cartItems.length} productos`,
        customerEmail: userEmail || shippingData.email,
        // ...otros campos necesarios para Bold
      }),
    });

    if (!boldResponse.ok) {
      const errorData = await boldResponse.json();
      console.error('❌ [BOLD] Error creando pago:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al crear el pago con Bold' 
      }, { status: 500 });
    }

    const boldData = await boldResponse.json();
    console.log('✅ [BOLD] Pago creado exitosamente');

    // **PASO 2: Solo si Bold responde OK, guardar en Supabase con estado "pending"**
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Insertar orden con estado pending
        const { error: orderError } = await supabase.from('orders').insert({
          order_id: orderId,
          user_email: userEmail || shippingData.email,
          amount: totalAmount,
          currency: 'COP',
          status: 'pending', // Estado inicial
          payment_status: 'pending', // Pendiente hasta que el webhook confirme
          payment_method: 'bold',
          shipping_details: shippingData,
          metadata: {
            description: `Pedido AVA Shop - ${cartItems.length} productos`,
            bold_payment_id: boldData.paymentId, // Guardar referencia de Bold
          },
          subtotal: subtotal,
          iva: iva,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
        });

        if (orderError) {
          console.error('❌ [SUPABASE] Error guardando orden:', orderError);
          // No bloqueamos el flujo, solo logeamos el error
        } else {
          console.log('✅ [SUPABASE] Orden guardada como pending:', orderId);
        }

        // Insertar items de la orden
        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: item.imageUrls?.[0] || null,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

        if (itemsError) {
          console.error('❌ [SUPABASE] Error guardando items:', itemsError);
        } else {
          console.log('✅ [SUPABASE] Items guardados:', orderItems.length);
        }
      } catch (dbError) {
        console.error('❌ [SUPABASE] Error en base de datos:', dbError);
        // No bloqueamos el flujo de pago
      }
    }

    // **PASO 3: Retornar URL de pago de Bold**
    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentUrl: boldData.paymentUrl,
      message: 'Pago iniciado exitosamente',
    });

  } catch (error) {
    console.error('💥 [CREATE-PAYMENT] Error general:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}