import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        subcategories:subcategory_id (
          *,
          categories:category_id (*)
        )
      `);

    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId);
    } else if (categoryId) {
      query = query.eq('subcategories.category_id', categoryId);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    if (format === 'meta') {
      return NextResponse.json(transformToMetaFormat(products || []));
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

function transformToMetaFormat(products: any[]) {
  const baseUrl = siteUrl || 'https://avashop.com';
  
  return products.map(product => ({
    id: product.id,
    title: product.name,
    description: product.name,
    availability: 'in stock',
    condition: 'new',
    price: `${product.price} COP`,
    link: `${baseUrl}/products/${product.id}`,
    image_link: `${baseUrl}${product.image}`,
    brand: 'AvaShop',
    google_product_category: product.subcategories?.categories?.name || 'Útiles Escolares'
  }));
}