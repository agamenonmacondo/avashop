import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail, getReviewRequestEmail } from '@/lib/email';

// POST /api/reviews/request
export async function POST(request: Request) {
  try {
    const { orderId, userEmail, customerName, products } = await request.json();

    if (!orderId || !userEmail) {
      return NextResponse.json(
        { error: 'orderId y userEmail son requeridos' },
        { status: 400 }
      );
    }

    // Generar token único y seguro
    const token = crypto.randomBytes(32).toString('hex');
    
    // Crear link de reseña
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const reviewLink = `${baseUrl}/review/${orderId}?token=${token}`;

    // TODO: Guardar en tabla review_requests en Supabase
    // const { data, error } = await supabase
    //   .from('review_requests')
    //   .insert({
    //     order_id: orderId,
    //     user_email: userEmail,
    //     token,
    //     expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    //   });

    // ✅ Enviar email con solicitud de reseña
    try {
      const emailHtml = getReviewRequestEmail({
        customerName: customerName || 'Cliente',
        orderId: orderId.toString(),
        reviewLink,
        products: products || []
      });

      await sendEmail({
        to: userEmail,
        subject: '⭐ ¿Qué te pareció tu compra en CCS724?',
        html: emailHtml
      });

      console.log('✅ Email de reseña enviado a:', userEmail);
    } catch (emailError) {
      console.error('❌ Error enviando email de reseña:', emailError);
      // No fallas la request si el email falla
    }

    return NextResponse.json({ 
      success: true, 
      reviewLink,
      message: 'Solicitud de reseña generada y email enviado'
    });

  } catch (error) {
    console.error('Error in POST /api/reviews/request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}