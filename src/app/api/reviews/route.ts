import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

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
    const stats = {
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
    const body = await request.json();
    const { product_id, user_email, order_id, rating, comment, photo_url } = body;

    // Validar campos requeridos
    if (!product_id || !rating || !user_email) {
      return NextResponse.json(
        { error: 'product_id, rating y user_email son requeridos' },
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

    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    // Verificar si ya existe una reseña para este producto y usuario
    if (order_id) {
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
    }

    // Crear la reseña
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_email,
        user_id: user_email,
        order_id: order_id || null,
        rating,
        comment: comment || '',
        photo_url: photo_url || null,
        is_verified: !!order_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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