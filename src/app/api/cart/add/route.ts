import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import { products } from '@/lib/placeholder-data'; // 👈 Importar productos

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1 } = await request.json();

    console.log('[/api/cart/add] Request:', { userId, productId, quantity });

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

    // Obtener carrito actual desde profiles
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', userId.toLowerCase().trim())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Error obteniendo perfil', error: fetchError.message },
        { status: 500 }
      );
    }

    const currentCart = profile?.cart || [];

    // Buscar si el producto ya existe en el carrito
    const existingIndex = currentCart.findIndex((item: any) => item.id === productId);

    if (existingIndex !== -1) {
      // Incrementar cantidad si ya existe
      currentCart[existingIndex].quantity += quantity;
    } else {
      // 👇 CORREGIDO: Buscar producto en placeholder-data en lugar de Supabase
      const product = products.find((p) => p.id === productId);

      if (!product) {
        console.error('Producto no encontrado en placeholder-data:', productId);
        return NextResponse.json(
          { success: false, message: `Producto no encontrado: ${productId}` },
          { status: 404 }
        );
      }

      // Agregar nuevo producto al carrito
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrls: product.imageUrls || [],
        stock: product.stock || 0,
       
      });
    }

    // Actualizar carrito en Supabase
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
      return NextResponse.json(
        { success: false, message: 'Error actualizando carrito', error: updateError.message },
        { status: 500 }
      );
    }

    const total = currentCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    console.log('[/api/cart/add] Success:', { itemCount: currentCart.length, total });

    return NextResponse.json({
      success: true,
      message: 'Producto agregado al carrito',
      cart: currentCart,
      total: total,
    });

  } catch (error) {
    console.error('[/api/cart/add] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}