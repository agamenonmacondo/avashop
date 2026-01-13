import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Profile {
  id?: string;
  name?: string;
  phone?: string;
  addresses?: Address[];
  [key: string]: unknown;
}

export function useProfile(user?: User | null) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // ✅ Guardar email en variable después de verificar que existe
    const userEmail = user.email;

    let mounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = getSupabase();
        if (!supabase) {
          const msg = 'Supabase not initialized';
          if (mounted) setError(msg);
          console.warn(msg);
          return;
        }

        // ✅ Usar la variable que ya verificamos
        const normalizedEmail = userEmail.toLowerCase().trim();
        const { data, error: sbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', normalizedEmail)
          .maybeSingle();

        if (sbError) {
          if (mounted) setError(sbError.message);
          console.error('Supabase fetchProfile error:', sbError);
          toast({ title: 'Error', description: sbError.message, variant: 'destructive' });
        } else if (mounted) {
          setProfile(data ?? null);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (mounted) setError(msg);
        console.error('fetchProfile exception', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => { mounted = false; };
  }, [user, toast]);

  return { profile, isLoading, error };
}