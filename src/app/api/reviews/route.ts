import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import type { Review, ReviewStats, CreateReviewInput } from '@/types/review';

// GET /api/reviews?productId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    if (!supabase) {
      console.error('Supabase no está configurado');
      return NextResponse.json({
        reviews: [], 
        stats: { 
          total: 0, 
          average: 0, 
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        }
      });
    }

    // Obtener reseñas del producto
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Error al obtener reseñas' },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const stats: ReviewStats = {
      total: reviews?.length || 0,
      average: reviews && reviews.length > 0 
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
        : 0,
      distribution: {
        1: reviews?.filter((r: any) => r.rating === 1).length || 0,
        2: reviews?.filter((r: any) => r.rating === 2).length || 0,
        3: reviews?.filter((r: any) => r.rating === 3).length || 0,
        4: reviews?.filter((r: any) => r.rating === 4).length || 0,
        5: reviews?.filter((r: any) => r.rating === 5).length || 0,
      }
    };

    return NextResponse.json({ 
      reviews: reviews || [], 
      stats 
    });

  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    const body: CreateReviewInput = await request.json();
    
    const { order_id, product_id, rating, comment, token } = body;

    // Validar campos requeridos
    if (!order_id || !product_id || !rating || !comment || !token) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Validar token
    const { data: reviewRequest, error: tokenError } = await supabase
      .from('review_requests')
      .select('*')
      .eq('token', token)
      .eq('order_id', order_id)
      .single();

    if (tokenError || !reviewRequest) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Verificar si el token ya fue usado
    if (reviewRequest.is_used) {
      return NextResponse.json(
        { error: 'Este token ya fue utilizado' },
        { status: 400 }
      );
    }

    // Verificar si el token expiró
    if (new Date(reviewRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'El token ha expirado' },
        { status: 400 }
      );
    }

    // Obtener información de la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el producto esté en la orden
    const productInOrder = order.order_items?.some(
      (item: any) => item.product_id === product_id
    );

    if (!productInOrder) {
      return NextResponse.json(
        { error: 'Este producto no está en tu orden' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una reseña
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', order_id)
      .eq('product_id', product_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya dejaste una reseña para este producto' },
        { status: 400 }
      );
    }

    // Crear la reseña
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        order_id,
        product_id,
        user_id: order.user_id,
        user_email: reviewRequest.user_email,
        rating,
        comment,
        is_verified: true
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Error al crear la reseña' },
        { status: 500 }
      );
    }

    // Marcar el token como usado
    await supabase
      .from('review_requests')
      .update({ is_used: true })
      .eq('id', reviewRequest.id);

    return NextResponse.json({ 
      success: true, 
      review 
    });

  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}