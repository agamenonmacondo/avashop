import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log completo del body recibido
    console.log('📦 [CREATE-PAYMENT] Body completo recibido:');
    console.log('Keys del body:', Object.keys(body));
    console.log('Body stringify:', JSON.stringify(body, null, 2));
    
    const { shippingData, cartItems, totalAmount, userEmail } = body;
    
    console.log('📦 [CREATE-PAYMENT] Datos extraídos:');
    console.log('- shippingData:', shippingData ? 'EXISTE' : 'UNDEFINED');
    console.log('- cartItems:', cartItems);
    console.log('- totalAmount:', totalAmount);
    console.log('- userEmail:', userEmail);

    // Validar datos requeridos
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('❌ [CREATE-PAYMENT] cartItems inválido');
      console.error('Tipo de cartItems:', typeof cartItems);
      console.error('Es array?:', Array.isArray(cartItems));
      console.error('Valor de cartItems:', cartItems);
      
      return NextResponse.json({ 
        success: false, 
        message: 'El carrito está vacío o es inválido',
        debug: {
          receivedKeys: Object.keys(body),
          cartItemsType: typeof cartItems,
          cartItemsValue: cartItems
        }
      }, { status: 400 });
    }

    if (!shippingData) {
      console.error('❌ [CREATE-PAYMENT] shippingData faltante');
      return NextResponse.json({ 
        success: false, 
        message: 'Datos de envío faltantes' 
      }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      console.error('❌ [CREATE-PAYMENT] totalAmount inválido:', totalAmount);
      return NextResponse.json({ 
        success: false, 
        message: 'Monto total inválido' 
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

    console.log('💰 [CREATE-PAYMENT] Cálculos:', { subtotal, iva, shippingCost, totalAmount });

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
    const merchantId = process.env.NEXT_PUBLIC_BOLD_MERCHANT_ID || 'CKKA859CGE';
    const boldApplink = `https://bold.co/deeplink?action=start_payment&value_to_collect=${totalAmount}&description=${encodeURIComponent(`Pedido-${orderId}`)}&merchant_id=${merchantId}&reference=${orderId}`;

    console.log('✅ [BOLD] Applink generado para orden:', orderId);

    // **PASO 3: Retornar respuesta exitosa con URL de pago**
    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentUrl: boldApplink,
      message: 'Pago iniciado exitosamente',
    }, { status: 200 });

  } catch (error) {
    console.error('💥 [CREATE-PAYMENT] Error general:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message 
    }, { status: 500 });
  }
}