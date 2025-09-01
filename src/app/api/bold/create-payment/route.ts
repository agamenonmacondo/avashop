import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Función para generar hash SHA-256 según documentación oficial de Bold (Node-friendly)
function generateBoldHash(orderId: string, amount: number, currency: string, secret: string): string {
  // Concatenar exactamente como Bold especifica: {Identificador}{Monto}{Divisa}{LlaveSecreta}
  const cadenaConcatenada = `${orderId}${amount}${currency}${secret}`;
  return crypto.createHash('sha256').update(cadenaConcatenada, 'utf8').digest('hex');
}

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    console.log('Body recibido en backend:', JSON.stringify(body, null, 2));

    // Normalizar amount (acepta `amount` o `totalAmount`)
    const rawAmount = body.amount ?? body.totalAmount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);

    // Normalizar cartItems para validación (pero NO se envían a Bold)
    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems.map((it: any) => ({
          id: it.id,
          name: it.name,
          quantity: Number(it.quantity) || 1,
          price: Math.round(Number(it.price) || 0),
        }))
      : [];

    const currency = (body.currency || 'COP').toString().toUpperCase();
    const orderId = (body.orderId || `order-${Date.now()}`).toString();
    const redirectionUrl = body.redirectUrl || process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '';

    const received = { rawAmount, amount, cartItemsLength: cartItems.length, orderId, redirectionUrl };

    // Validaciones según documentación Bold
    if (amount <= 0) {
      console.warn('Falta amount o es cero', received);
      return NextResponse.json({
        success: false,
        message: 'Campo amount faltante o inválido (debe ser > 0).',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    // Bold requiere mínimo COP 1000
    if (currency === 'COP' && amount < 1000) {
      return NextResponse.json({
        success: false,
        message: 'El monto mínimo para COP es $1.000',
        received
      }, { status: 400 });
    }

    if (cartItems.length === 0) {
      console.warn('cartItems vacío', received);
      return NextResponse.json({
        success: false,
        message: 'Campo cartItems faltante o vacío.',
        received,
        bodyPreview: body
      }, { status: 400 });
    }

    if (!redirectionUrl) {
      return NextResponse.json({ success: false, message: 'Redirection URL not configured' }, { status: 400 });
    }

    // Credenciales
    const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY ?? '';
    const secret = process.env.BOLD_SECRET_KEY ?? '';
    
    if (!apiKey || !secret) {
      console.error('Missing Bold credentials');
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }

    // Generar integritySignature usando la función (Node)
    const integritySignature = generateBoldHash(orderId, amount, currency, secret);
    
    console.log('Hash generado con formato Bold oficial:', integritySignature);
    console.log('Cadena concatenada:', `${orderId}${amount}${currency}***`); // secret enmascarado

    // Construir payload EXACTO según documentación Bold
    const payload: Record<string, any> = {
      apiKey,
      amount,
      currency,
      orderId,
      integritySignature,
      redirectionUrl,
      redirection_url: redirectionUrl,
      description: body.description || `Pedido ${orderId}`,
    };

    // Campos opcionales según documentación (customerData y billingAddress como JSON string)
    if (body.customerData && typeof body.customerData === 'object' && Object.keys(body.customerData).length > 0) {
      payload.customerData = JSON.stringify(body.customerData);
    } else if (typeof body.customerData === 'string') {
      payload.customerData = body.customerData;
    }
    
    if (body.billingAddress && typeof body.billingAddress === 'object' && Object.keys(body.billingAddress).length > 0) {
      payload.billingAddress = JSON.stringify(body.billingAddress);
    } else if (typeof body.billingAddress === 'string') {
      payload.billingAddress = body.billingAddress;
    }

    // Campos extra opcionales (mín 2, máx 60 caracteres)
    if (typeof body['extra-data-1'] === 'string' && body['extra-data-1'].length >= 2 && body['extra-data-1'].length <= 60) {
      payload['extra-data-1'] = body['extra-data-1'];
    }
    if (typeof body['extra-data-2'] === 'string' && body['extra-data-2'].length >= 2 && body['extra-data-2'].length <= 60) {
      payload['extra-data-2'] = body['extra-data-2'];
    }

    // Validar description (mín 2, máx 100 caracteres)
    if (payload.description && (payload.description.length < 2 || payload.description.length > 100)) {
      payload.description = `Pedido ${orderId}`;
    }

    // LOG antes de enviar
    console.log('Payload enviado a Bold (sin items):', JSON.stringify(payload, null, 2));

    // Headers según documentación Bold - tipado seguro
    const headerVariants: Record<string, string>[] = [
      { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      { 'Content-Type': 'application/json', 'Authorization': `x-api-key ${apiKey}` },
    ];

    let boldResponse: any = null;
    let lastError = '';

    for (const headers of headerVariants) {
      try {
        console.log('Probando headers:', Object.keys(headers));
        
        const boldRes = await fetch('https://payments.api.bold.co/v2/payment-btn', {
          method: 'POST',
          headers: headers as HeadersInit,
          body: JSON.stringify(payload),
        });

        const responseText = await boldRes.text();
        console.log(`Respuesta Bold (status ${boldRes.status}):`, responseText);

        if (boldRes.ok) {
          try {
            boldResponse = JSON.parse(responseText);
          } catch {
            boldResponse = responseText;
          }
          break;
        } else {
          lastError = responseText || lastError;
        }
      } catch (fetchErr) {
        console.error('Error en fetch:', fetchErr);
        lastError = String(fetchErr);
      }
    }

    if (!boldResponse) {
      return NextResponse.json({
        success: false,
        message: 'Bold API error - todas las variantes fallaron',
        detail: lastError,
        debug: { received, payload }
      }, { status: 502 });
    }

    // Extraer URL de redirección que Bold devuelva
    const redirectFromBold = boldResponse?.redirect_url || boldResponse?.data?.redirect_url || boldResponse?.redirectUrl || null;

    return NextResponse.json({
      success: true,
      data: boldResponse,
      redirectUrl: redirectFromBold
    }, { status: 200 });

  } catch (err) {
    console.error('Error en create-payment:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error', 
      error: String(err) 
    }, { status: 500 });
  }
}






