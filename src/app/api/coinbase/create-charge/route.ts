import { NextResponse } from 'next/server';

// Aquí deberías importar tu helper real de integración con Coinbase
// import { createCoinbaseChargeAPI } from '@/lib/coinbase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[API] /api/coinbase/create-charge - body received:', JSON.stringify(body));

    // normalize: accept either `amount` or `totalAmount`
    const normalized = {
      ...body,
      totalAmount: (body.totalAmount ?? body.amount ?? 0),
    };

    // required checks
    const missing: string[] = [];
    if (!normalized.shippingDetails) missing.push('shippingDetails');
    if (!Array.isArray(normalized.cartItems) || normalized.cartItems.length === 0) missing.push('cartItems');
    if (!normalized.totalAmount || Number(normalized.totalAmount) <= 0) missing.push('totalAmount (or amount)');
    if (!normalized.currency) missing.push('currency');
    if (!normalized.orderId) missing.push('orderId');

    if (missing.length > 0) {
      console.warn('[API] /api/coinbase/create-charge - missing fields:', missing);
      return NextResponse.json({
        success: false,
        message: `Faltan campos requeridos: ${missing.join(', ')}`,
      }, { status: 400 });
    }

    // Aquí invocar tu integración real con Coinbase
    // const result = await createCoinbaseChargeAPI(normalized);

    // Simulación de respuesta (reemplaza por integración real)
    const result: any = {
      success: true,
      redirectUrl: 'https://commerce.coinbase.com/charges/tu_charge_id'
    };

    if (result?.success && result?.redirectUrl) {
      return NextResponse.json({ success: true, redirectUrl: result.redirectUrl });
    }

    return NextResponse.json({
      success: false,
      message: result?.message ?? 'No se pudo crear el cobro en Coinbase.',
    }, { status: 500 });

  } catch (error: any) {
    console.error('[API] /api/coinbase/create-charge - error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno en el endpoint de Coinbase',
      detail: error?.message ?? String(error),
    }, { status: 500 });
  }
}