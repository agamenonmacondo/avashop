import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

// mantener CACHE_TTL y statsCache o usar Upstash/Redis para producción
const CACHE_TTL = 5 * 60 * 1000;
const statsCache = new Map<string, { data: any; timestamp: number }>();

export const runtime = 'edge';
export const revalidate = 120; // 2 minutos de cacheo en edge

// GET /api/reviews?productId=xxx&page=1&limit=10
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId es requerido' }, { status: 400 });
    }

    // normalizar y asegurar tipos
    const productIdStr: string = productId; // ya validado
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);

    const supabase = getSupabase();
    
    if (!supabase) {
      console.error('Supabase no está configurado');
      return NextResponse.json({
        reviews: [], 
        stats: { 
          total: 0, 
          average: 0, 
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        },
        hasMore: false
      });
    }

    // ⚡ 1. PAGINACIÓN - Reducir datos transferidos
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select('id, product_id, user_email, rating, comment, photo_url, is_verified, created_at', { count: 'exact' })
      .eq('product_id', productIdStr) // usar la variable con tipo string
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Error al obtener reseñas' },
        { status: 500 }
      );
    }

    // stats: primero cache local/redis, si no -> llamar RPC
    const cacheKey = `stats:${productIdStr}`;
    const now = Date.now();
    const cached = statsCache.get(cacheKey);
    let stats;
    if (cached && now - cached.timestamp < CACHE_TTL) {
      stats = cached.data;
    } else {
      const { data: rpcRes, error: rpcErr } = await supabase
        .rpc('get_review_stats', { p_product_id: productIdStr });

      if (rpcErr) {
        console.error('rpc error', rpcErr);
        stats = { total: 0, average: 0, distribution: {1:0,2:0,3:0,4:0,5:0} };
      } else {
        // mapear rpcRes (returned as array/row)
        const row = Array.isArray(rpcRes) ? rpcRes[0] : rpcRes;
        stats = {
          total: Number(row?.total ?? 0),
          average: Number(row?.average ?? 0),
          distribution: {
            1: Number(row?.rating_1 ?? 0),
            2: Number(row?.rating_2 ?? 0),
            3: Number(row?.rating_3 ?? 0),
            4: Number(row?.rating_4 ?? 0),
            5: Number(row?.rating_5 ?? 0),
          }
        };
      }
      statsCache.set(cacheKey, { data: stats, timestamp: now });
    }

    // ⚡ 4. RESPONSE HEADERS - Habilitar caché en browser/CDN
    const response = NextResponse.json({ 
      reviews: reviews || [], 
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1
      }
    });

    // Cache público 2 minutos, revalidar en background
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return response;

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

    // ⚡ 5. INSERCIÓN CON UNIQUE CONSTRAINT - Dejar que DB maneje duplicados
    // Crear índice único en Supabase: (order_id, product_id) donde order_id IS NOT NULL
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
      // Manejar error de duplicado
      if (reviewError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Ya dejaste una reseña para este producto' },
          { status: 400 }
        );
      }
      
      console.error('Error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Error al crear la reseña' },
        { status: 500 }
      );
    }

    // ⚡ 6. INVALIDAR CACHÉ al crear nueva review
    const cacheKey = `stats:${product_id}`;
    statsCache.delete(cacheKey);

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