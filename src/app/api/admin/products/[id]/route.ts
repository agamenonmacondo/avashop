import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthorizedAdmin } from '@/lib/admin-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userEmail = request.headers.get('x-user-email');

  if (!isAuthorizedAdmin(userEmail)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { price, stock } = await request.json();
    const productId = params.id;

    // Obtener precio anterior para auditoría
    const { data: oldProduct } = await supabase
      .from('products')
      .select('price, stock, name')
      .eq('id', productId)
      .single();

    // Actualizar producto
    const { data, error } = await supabase
      .from('products')
      .update({ 
        price: price !== undefined ? price : oldProduct?.price,
        stock: stock !== undefined ? stock : oldProduct?.stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    // Registrar cambio en auditoría
    await supabase.from('price_audit_log').insert({
      product_id: productId,
      product_name: oldProduct?.name,
      old_price: oldProduct?.price,
      new_price: price ?? oldProduct?.price,
      old_stock: oldProduct?.stock,
      new_stock: stock ?? oldProduct?.stock,
      changed_by: userEmail,
      changed_at: new Date().toISOString()
    });

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}