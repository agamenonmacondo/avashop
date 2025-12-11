import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, message: 'userId, productId y quantity son requeridos' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'quantity debe ser mayor a 0' },
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

    // Obtener carrito actual
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', userId.toLowerCase().trim())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const currentCart = profile?.cart || [];
    const productIndex = currentCart.findIndex((item: any) => item.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado en el carrito' },
        { status: 404 }
      );
    }

    currentCart[productIndex].quantity = quantity;

    // Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toLowerCase().trim(),
        cart: currentCart,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (updateError) throw updateError;

    const total = currentCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      message: 'Cantidad actualizada',
      cart: currentCart,
      total: total,
    });

  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}