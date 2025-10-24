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

    console.log('📦 [CREATE-PAYMENT] Datos recibidos:', { 
      hasShippingData: !!shippingData, 
      cartItemsLength: cartItems?.length,
      totalAmount 
    });

    // Validar datos requeridos
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('❌ [CREATE-PAYMENT] cartItems inválido:', cartItems);
      return Response.json({ 
        success: false, 
        error: 'El carrito está vacío o es inválido' 
      }, { status: 400 });
    }

    if (!shippingData) {
      console.error('❌ [CREATE-PAYMENT] shippingData faltante');
      return Response.json({ 
        success: false, 
        error: 'Datos de envío faltantes' 
      }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      console.error('❌ [CREATE-PAYMENT] totalAmount inválido:', totalAmount);
      return Response.json({ 
        success: false, 
        error: 'Monto total inválido' 
      }, { status: 400 });
    }

    // Generar ID único para la orden
    const orderId = `order-${Date.now()}`;

    // Calcular subtotales de forma segura
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    const iva = Math.round(subtotal * 0.19);
    const shippingCost = totalAmount >= 150000 ? 0 : 15000;

    console.log('💰 [CREATE-PAYMENT] Cálculos:', { subtotal, iva, shippingCost });

    // **PASO 1: Guardar en Supabase con estado pending**
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Insertar orden con estado pending
        const { error: orderError } = await supabase.from('orders').insert({
          order_id: orderId,
          user_email: userEmail || shippingData.email || 'guest@avashop.com',
          amount: totalAmount,
          currency: 'COP',
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'bold',
          shipping_details: shippingData,
          metadata: {
            description: `Pedido AVA Shop - ${cartItems.length} productos`,
          },
          subtotal: subtotal,
          iva: iva,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
        });

        if (orderError) {
          console.error('❌ [SUPABASE] Error guardando orden:', orderError);
        } else {
          console.log('✅ [SUPABASE] Orden guardada como pending:', orderId);
        }

        // Insertar items de la orden
        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_id: item.id || 'unknown',
          product_name: item.name || 'Producto sin nombre',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
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
      }
    }

    // **PASO 2: Crear el enlace de pago de Bold (Applink)**
    const boldApplink = `https://bold.co/deeplink?action=start_payment&value_to_collect=${totalAmount}&description=${encodeURIComponent(`Pedido AVA Shop - ${orderId}`)}&merchant_id=${process.env.NEXT_PUBLIC_BOLD_MERCHANT_ID || 'CKKA859CGE'}&reference=${orderId}`;

    console.log('✅ [BOLD] Applink generado:', boldApplink);

    // **PASO 3: Retornar URL de pago**
    return Response.json({
      success: true,
      orderId: orderId,
      paymentUrl: boldApplink,
      message: 'Pago iniciado exitosamente',
    });

  } catch (error) {
    console.error('💥 [CREATE-PAYMENT] Error general:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}