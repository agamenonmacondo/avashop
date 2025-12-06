import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { products as placeholderProducts } from '@/lib/placeholder-data'; // ✅ Sin extensión .ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    console.log('🚀 [API] Starting products fetch...');

    // ✅ Usar productos desde placeholder-data
    let filteredProducts = [...placeholderProducts];

    console.log(`📦 [API] Total products: ${filteredProducts.length}`);

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category.id === category);
    }

    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured === true);
    }

    // ✅ Obtener ratings desde Supabase
    const productsWithRatings = await Promise.all(
      filteredProducts.map(async (product) => {
        try {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', product.id);

          const reviewsList = reviews || [];
          const reviewsCount = reviewsList.length;
          const averageRating = reviewsCount > 0
            ? reviewsList.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount
            : 0;

          return {
            ...product,
            rating: parseFloat(averageRating.toFixed(1)),
            reviewsCount: reviewsCount,
          };
        } catch (err) {
          console.error(`❌ Error processing product ${product.id}:`, err);
          return {
            ...product,
            rating: 0,
            reviewsCount: 0,
          };
        }
      })
    );

    console.log(`✅ [API] Returning ${productsWithRatings.length} products`);
    return NextResponse.json({ products: productsWithRatings });
  } catch (error) {
    console.error('❌ Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}