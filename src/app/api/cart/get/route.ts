import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId es requerido' },
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', userId.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const cart = profile?.cart || [];
    const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      cart: cart,
      total: total,
      itemCount: cart.length,
      freeShipping: total >= 200000,
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}