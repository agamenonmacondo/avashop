'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Save, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSupabase } from '@/lib/supabaseClient';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Esquema para Perfil
const profileFormSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
});

// Esquema para Dirección
const addressFormSchema = z.object({
  address: z.string().min(5, "La dirección es muy corta"),
  city: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type AddressFormValues = z.infer<typeof addressFormSchema>;

export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  // Estados
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Formulario Perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  // Formulario Dirección
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { address: '', city: '' },
  });

  // 🔄 Cargar datos
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);
      const userEmail = firebaseUser.email;

      if (!userEmail) {
        setLoading(false);
        return;
      }

      // 1. Pre-llenar formulario con datos de Firebase
      profileForm.reset({
        name: firebaseUser.displayName || '',
        email: userEmail,
        phone: '',
      });

      const supabase = getSupabase();
      if (supabase) {
        try {
          // 2. Buscar en la tabla 'profiles' usando el EMAIL como ID (según tu captura)
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userEmail) // IMPORTANTE: Usamos el email como ID
            .maybeSingle();

          if (profileData) {
            // Cargar datos del perfil
            profileForm.reset({
              name: profileData.name || firebaseUser.displayName || '',
              email: userEmail,
              phone: profileData.phone || '',
            });

            // Cargar dirección desde la columna JSONB 'addresses'
            // Tu captura muestra que es un array: [{"city": "Bogota", ...}]
            if (profileData.addresses && Array.isArray(profileData.addresses) && profileData.addresses.length > 0) {
              const mainAddress = profileData.addresses[0]; // Tomamos la primera dirección
              addressForm.reset({
                address: mainAddress.address || '', // Ajusta la clave según tu JSON
                city: mainAddress.city || '',
              });
            }
          }
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, profileForm, addressForm]);

  // 💾 Guardar Perfil
  async function onProfileSubmit(values: ProfileFormValues) {
    if (!user || !user.email) return;
    setSavingProfile(true);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("No hay conexión a base de datos");

      // Actualizamos la tabla profiles usando el email como ID
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.email, // Usamos email como ID
          name: values.name,
          phone: values.phone || null,
          // No tocamos 'addresses' aquí para no borrarlas
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({ title: 'Perfil actualizado ✅', description: 'Tus datos se guardaron correctamente.' });
    } catch (error: any) {
      console.error('Error guardando perfil:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo guardar el perfil.', 
        variant: 'destructive' 
      });
    } finally {
      setSavingProfile(false);
    }
  }

  // 💾 Guardar Dirección
  async function onAddressSubmit(values: AddressFormValues) {
    if (!user || !user.email) return;
    setSavingAddress(true);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("No hay conexión a base de datos");

      // Creamos el objeto de dirección para guardar en el JSON
      const newAddress = {
        address: values.address,
        city: values.city,
        updated_at: new Date().toISOString()
      };

      // Guardamos en la columna 'addresses' (tipo JSONB)
      // Nota: Esto sobrescribe el array con una sola dirección. 
      // Si quieres múltiples, habría que leer primero y hacer push.
      const { error } = await supabase
        .from('profiles')
        .update({
          addresses: [newAddress] // Guardamos como un array de objetos JSON
        })
        .eq('id', user.email); // Usamos email como ID

      if (error) throw error;

      toast({ title: 'Dirección guardada 🏠', description: 'Tu dirección de envío ha sido actualizada.' });
    } catch (error: any) {
      console.error('Error guardando dirección:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo guardar la dirección.', 
        variant: 'destructive' 
      });
    } finally {
      setSavingAddress(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center min-h-[400px]">
        <div className="text-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Cuenta</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="addresses">Direcciones</TabsTrigger>
        </TabsList>

        {/* PESTAÑA PERFIL */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Administra tus detalles personales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} disabled={savingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50" />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground">
                          El correo no se puede modificar por seguridad.
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu número de contacto" {...field} disabled={savingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={savingProfile} className="w-full">
                    {savingProfile ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Guardar Perfil</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PESTAÑA DIRECCIONES */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Dirección de Envío
              </CardTitle>
              <CardDescription>
                Esta dirección se usará para tus pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
                  <FormField
                    control={addressForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección Completa</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Calle 123 # 45 - 67, Apto 201" 
                            {...field} 
                            disabled={savingAddress} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addressForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Bogotá" 
                            {...field} 
                            disabled={savingAddress} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={savingAddress} className="w-full">
                    {savingAddress ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Guardar Dirección</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}