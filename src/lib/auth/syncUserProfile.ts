import { User } from 'firebase/auth';
import { getSupabase } from '@/lib/supabaseClient';

export async function syncUserProfile(user: User) {
  const supabase = getSupabase();
  // Si no hay supabase o el usuario no tiene email, no podemos guardar en tu esquema actual
  if (!supabase || !user.email) return;

  try {
    // 1. Verificar si el usuario ya existe en Supabase
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.email) // Tu tabla usa email como ID
      .maybeSingle();

    if (existingUser) {
      return; // Ya existe, no hacemos nada
    }

    // 2. Si no existe, crearlo
    console.log('🆕 Creando perfil en Supabase para:', user.email);
    
    const newProfile = {
      id: user.email, // ID es el email
      name: user.displayName || user.email.split('@')[0],
      phone: user.phoneNumber || null,
      addresses: [], // Inicializamos arrays vacíos JSONB
      orders: []
    };

    const { error } = await supabase
      .from('profiles')
      .insert([newProfile]);

    if (error) {
      console.error('❌ Error creando perfil en Supabase:', error.message);
    } else {
      console.log('✅ Perfil creado exitosamente en base de datos');
    }

  } catch (error) {
    console.error('❌ Error en syncUserProfile:', error);
  }
}