import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();

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
    const updatedCart = currentCart.filter((item: any) => item.id !== productId);

    // Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toLowerCase().trim(),
        cart: updatedCart,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (updateError) throw updateError;

    const total = updatedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado del carrito',
      cart: updatedCart,
      total: total,
    });

  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}