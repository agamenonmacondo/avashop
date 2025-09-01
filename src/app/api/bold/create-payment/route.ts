import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingDetails, cartItems, totalAmount } = body ?? {};

    if (!shippingDetails || !cartItems || typeof totalAmount !== 'number') {
      return NextResponse.json({ success: false, message: 'Payload inválido' }, { status: 400 });
    }

    // Inicializar cliente Supabase: buscar la variable de entorno con varios nombres posibles
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

    // posibles nombres de la clave que el servidor puede recibir
    const KEY_CANDIDATES = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_SERVICE_KEY',
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_ANON_KEY'
    ];

    let SUPABASE_SERVICE_KEY = '';
    let usedKeyName = '';
    for (const name of KEY_CANDIDATES) {
      if (process.env[name]) {
        SUPABASE_SERVICE_KEY = process.env[name] as string;
        usedKeyName = name;
        break;
      }
    }

    // Verificación de configuración sin exponer valores
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Missing required Supabase configuration');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const amount = Math.round(totalAmount); // entero
    const currency = 'COP';

    if (!process.env.BOLD_SECRET_KEY) {
      console.error('Missing Bold secret key configuration');
      return NextResponse.json({ success: false, message: 'Payment service configuration error' }, { status: 500 });
    }

    const cadena = `${orderId}${amount}${currency}${process.env.BOLD_SECRET_KEY}`;
    const integritySignature = crypto.createHash('sha256').update(cadena).digest('hex');

    // redirection URL: preferir la enviada por el cliente, luego la env correcta (o el typo antiguo),
    // y por último la URL definitiva del sitio en Vercel.
    const clientRedirect = body?.redirectUrl;
    const envRedirect = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_BOLD_REDIRECT_UR;
    const fallbackRedirect = 'https://avashop.vercel.app/order/success';
    const redirectionUrl =
      (typeof clientRedirect === 'string' && clientRedirect.startsWith('http')) 
        ? clientRedirect 
        : (envRedirect && envRedirect.startsWith('http') ? envRedirect : fallbackRedirect);
 
    // Preparar payload para Bold (sin exponer secrets)
    const data = {
      apiKey: process.env.NEXT_PUBLIC_BOLD_API_KEY,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl: redirectionUrl, // URL exacta sin parámetros extra
      description: `Pago de ${cartItems.length} producto(s)`,
      customerData: JSON.stringify({
        email: shippingDetails.email || '',
        fullName: shippingDetails.fullName || '',
        phone: shippingDetails.phone || '',
        dialCode: shippingDetails.dialCode || '+57',
        documentNumber: shippingDetails.documentNumber || '',
        documentType: shippingDetails.documentType || '',
      }),
      billingAddress: JSON.stringify({
        address: shippingDetails.address || '',
        city: shippingDetails.city || '',
        state: shippingDetails.state || '',
        zipCode: shippingDetails.zipCode || '',
        country: shippingDetails.country ? (shippingDetails.country === 'Colombia' ? 'CO' : shippingDetails.country) : 'CO',
      }),
      renderMode: 'embedded',
      buttonStyle: 'dark-L',
    };

    // Log únicamente información de la transacción (sin credenciales)
    console.log('Processing payment request:', {
      orderId: orderId,
      amount: amount,
      currency: currency,
      itemCount: cartItems.length
    });

    // Guardar orden en la BD (tabla 'orders' — ajusta nombre/columnas según tu esquema)
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('orders') // <- cambiar de 'orders' a 'carts'
        .insert([{
          order_id: orderId,
          amount,
          currency,
          shipping_details: shippingDetails,
          cart_items: cartItems,
          integrity_signature: integritySignature,
          status: 'pending',
          metadata: { description: data.description },
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

      if (insertError) {
        console.error('Database save error:', insertError.message || 'Unknown error');
        return NextResponse.json({ success: false, message: 'No se pudo guardar la orden' }, { status: 500 });
      }

      console.log('Order saved successfully:', { orderId, recordId: insertData?.id });
      
      // Devolver data para el cliente (sin exponer claves de servicio)
      return NextResponse.json({ success: true, data, orderRecordId: insertData?.id || null });
    } catch (dbErr) {
      console.error('Database error:', (dbErr as any)?.message || 'Unknown database error');
      return NextResponse.json({ success: false, message: 'Error al guardar la orden' }, { status: 500 });
    }
  } catch (err) {
    console.error('Payment processing error:', (err as any)?.message || 'Unknown error');
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}