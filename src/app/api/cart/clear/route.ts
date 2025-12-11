import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

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

    // Vaciar carrito
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toLowerCase().trim(),
        cart: [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Carrito vaciado exitosamente',
      cart: [],
      total: 0,
    });

  } catch (error) {
    console.error('Error vaciando carrito:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}