import { User } from 'firebase/auth';
import { getSupabase } from '@/lib/supabaseClient';

export async function syncUserProfile(user: User, forceCreate?: boolean) {
  const supabase = getSupabase();
  
  if (!supabase) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    const email = user.email?.toLowerCase().trim();
    
    if (!email) {
      console.error('❌ Usuario sin email');
      return;
    }

    // Verificar si el perfil ya existe
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existingProfile && !forceCreate) {
      console.log('✅ Perfil ya existe:', email);
      return existingProfile;
    }

    // Crear o actualizar perfil
    const profileData = {
      firebase_uid: user.uid,
      email: email,
      display_name: user.displayName || '',
      photo_url: user.photoURL || '',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error en syncUserProfile:', error);
      return null;
    }

    console.log('✅ Perfil sincronizado:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en syncUserProfile:', error);
    return null;
  }
}