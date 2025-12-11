import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1 } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: 'userId y productId son requeridos' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Supabase no configurado' },
        { status: 500 }
      );
    }
    
    // 1. Obtener carrito actual del usuario
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', userId.toLowerCase().trim())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', fetchError);
      throw fetchError;
    }

    const currentCart = profile?.cart || [];

    // 2. Buscar si el producto ya existe
    const existingIndex = currentCart.findIndex((item: any) => item.id === productId);

    if (existingIndex !== -1) {
      // Incrementar cantidad
      currentCart[existingIndex].quantity += quantity;
    } else {
      // Obtener info del producto desde Supabase directamente
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, stock, imageUrls:image_urls, category_id, product_url, buy_now_url')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { success: false, message: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      // Agregar nuevo item con URLs para AVA
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrls: product.imageUrls || [],
        stock: product.stock || 0,
        product_url: product.product_url || '',
        buy_now_url: product.buy_now_url || '',
      });
    }

    // 3. Actualizar carrito en Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toLowerCase().trim(),
        cart: currentCart,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (updateError) {
      console.error('Error actualizando carrito:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Producto agregado al carrito',
      cart: currentCart,
      total: currentCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
    });

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}