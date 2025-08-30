import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Address {
  street?: string;
  address?: string;
  line1?: string;
  line?: string;
  city?: string;
  town?: string;
  state?: string;
  region?: string;
  zipCode?: string;
  postal?: string;
  postalCode?: string;
  country?: string;
}

interface Profile {
  id: string;
  name: string;
  phone: string;
  addresses: any;
}

interface ParsedProfile {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<ParsedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const parseAddresses = (addr: any): Address => {
    if (!addr) return {};
    
    try {
      if (typeof addr === 'string') {
        const parsed = JSON.parse(addr);
        return Array.isArray(parsed) ? parsed[0] || {} : parsed || {};
      }
      if (Array.isArray(addr)) {
        return addr[0] || {};
      }
      if (typeof addr === 'object') {
        if (Array.isArray(addr) && typeof addr[0] === 'string') {
          try { 
            return JSON.parse(addr[0]); 
          } catch { 
            return {}; 
          }
        }
        return addr;
      }
    } catch (e) {
      console.error('Error parsing addresses:', e);
      return {};
    }
    return {};
  };

  const loadProfile = async (userId: string): Promise<void> => {
    if (!userId) return;
    const normalizedId = userId.toLowerCase().trim();
    console.log('ID buscado:', normalizedId, 'Largo:', normalizedId.length);

    // Extrae todos los perfiles y muestra cada campo individualmente
    const { data: allProfiles, error: allError } = await supabase.from('profiles').select('*');
    if (allError) {
      console.error('Error al obtener todos los perfiles:', allError);
    } else if (allProfiles) {
      allProfiles.forEach((profile: any, idx: number) => {
        console.log(`--- Perfil #${idx + 1} ---`);
        Object.entries(profile).forEach(([key, value]) => {
          if (typeof value === 'string') {
            console.log(`${key}: "${value}" (largo: ${value.length})`);
          } else {
            console.log(`${key}:`, value);
          }
        });
      });
    }

    // Ahora busca el perfil por id normalizado
    let { data, error } = await supabase
      .from('profiles')
      .select('id, name, phone, addresses')
      .eq('id', normalizedId)
      .maybeSingle();

    console.log('Respuesta Supabase:', { data, error });

    if (error) {
      console.error('Error al consultar perfil:', error);
      setProfile(null);
      return;
    }

    if (!data) {
      console.log('No se encontró perfil para id:', normalizedId);
      setProfile(null);
      return;
    }

    // Parsear y mapear los datos
    const addressObj = parseAddresses(data.addresses);
    const parsedProfile: ParsedProfile = {
      fullName: data.name || '',
      address: addressObj.street || addressObj.address || addressObj.line1 || addressObj.line || '',
      city: addressObj.city || addressObj.town || '',
      state: addressObj.state || addressObj.region || '',
      zipCode: addressObj.zipCode || addressObj.postal || addressObj.postalCode || '',
      country: addressObj.country || 'Colombia',
      email: user?.email || userId || '',
      phone: data.phone || '',
    };

    console.log('Perfil parseado:', parsedProfile);
    setProfile(parsedProfile);
  };

  useEffect(() => {
    if (user?.email) {
      const emailNormalized = user.email.toLowerCase().trim();
      loadProfile(emailNormalized);
    } else {
      setProfile(null);
      setError(null);
      setIsLoading(false);
    }
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    refetch: () => user?.email && loadProfile(user.email.toLowerCase().trim())
  };
}