import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('📦 [CREATE-PAYMENT] Body completo recibido:', JSON.stringify(body, null, 2));
    
    const { orderId, amount, currency, cartItems, shippingData, userEmail } = body;

    // Validar datos obligatorios para Bold
    if (!orderId || !amount) {
      console.error('❌ [CREATE-PAYMENT] Faltan orderId o amount');
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan orderId o amount' 
      }, { status: 400 });
    }

    console.log('📋 [CREATE-PAYMENT] Datos recibidos:');
    console.log('  - orderId:', orderId);
    console.log('  - amount:', amount);
    console.log('  - currency:', currency);
    console.log('  - cartItems:', cartItems ? `${cartItems.length} items` : 'NO RECIBIDO');
    console.log('  - shippingData:', shippingData ? 'RECIBIDO' : 'NO RECIBIDO');
    console.log('  - userEmail:', userEmail);

    // **PASO 1: GUARDAR LA ORDEN Y SUS ITEMS EN SUPABASE**
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0 && shippingData) {
      console.log('💾 [CREATE-PAYMENT] Guardando orden en Supabase...');
      
      const supabase = getSupabase();
      if (supabase) {
        try {
          // Calcular subtotales
          const subtotal = cartItems.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
          }, 0);

          const iva = Math.round(subtotal * 0.19);
          const shippingCost = amount >= 150000 ? 0 : 15000;

          console.log('💰 [CREATE-PAYMENT] Cálculos:', { subtotal, iva, shippingCost, amount });

          // Insertar orden con estado pending
          const { error: orderError } = await supabase.from('orders').insert({
            order_id: orderId,
            user_email: (userEmail || shippingData.email || 'guest@avashop.com').toLowerCase().trim(),
            amount: amount,
            currency: currency || 'COP',
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
            total_amount: amount,
            created_at: new Date().toISOString(),
          });

          if (orderError) {
            console.error('❌ [SUPABASE] Error guardando orden:', orderError);
            throw orderError;
          }

          console.log('✅ [SUPABASE] Orden guardada:', orderId);

          // Insertar items de la orden
          const orderItems = cartItems.map(item => ({
            order_id: orderId,
            product_id: String(item.id || 'unknown'),
            product_name: String(item.name || 'Producto sin nombre'),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            image_url: item.imageUrls?.[0] || item.image || null,
          }));

          console.log('📦 [CREATE-PAYMENT] Items a guardar:', orderItems);

          const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

          if (itemsError) {
            console.error('❌ [SUPABASE] Error guardando items:', itemsError);
            throw itemsError;
          }

          console.log('✅ [SUPABASE] Items guardados:', orderItems.length);

        } catch (dbError) {
          console.error('❌ [SUPABASE] Error en base de datos:', dbError);
          // Continuar con el flujo aunque falle el guardado
        }
      } else {
        console.error('❌ [SUPABASE] Supabase no inicializado');
      }
    } else {
      console.warn('⚠️ [CREATE-PAYMENT] No se recibieron cartItems o shippingData');
      console.warn('  cartItems:', cartItems);
      console.warn('  shippingData:', shippingData);
    }

    // **PASO 2: GENERAR EL HASH DE INTEGRIDAD**
    const secretKey = process.env.BOLD_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ [CREATE-PAYMENT] BOLD_SECRET_KEY no configurada');
      return NextResponse.json({ 
        success: false, 
        message: 'Configuración del servidor incompleta' 
      }, { status: 500 });
    }

    const dataToHash = `${orderId}${amount}${currency || 'COP'}${secretKey}`;
    const integritySignature = crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex');

    console.log('🔐 [CREATE-PAYMENT] Hash generado');

    // **PASO 3: RETORNAR DATOS PARA EL BOTÓN DE BOLD**
    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        amount: amount,
        currency: currency || 'COP',
        integritySignature: integritySignature,
      },
      message: 'Orden guardada y pago preparado exitosamente',
    }, { status: 200 });

  } catch (error) {
    console.error('💥 [CREATE-PAYMENT] Error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message 
    }, { status: 500 });
  }
}