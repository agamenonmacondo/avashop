import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthorizedAdmin } from '@/lib/admin-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');

  if (!isAuthorizedAdmin(userEmail)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, stock, category_id, subcategory_id, image_urls')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}