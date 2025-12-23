'use client';

import { Suspense, useEffect, useState } from 'react';
import { trackInitiateCheckout } from '@/lib/meta-pixel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Home, ShoppingCart, Mail, CreditCard, Bitcoin, MessageCircle, Shield, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatColombianCurrency } from '@/lib/utils';
import { createCoinbaseCharge } from '@/lib/actions/order.actions';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import BoldButton from '@/components/checkout/BoldButton';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { getSupabase } from '@/lib/supabaseClient';
import type { CartItem } from '@/types';

const shippingFormSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido (mín. 2 caracteres)."),
  address: z.string().min(5, "La dirección es requerida (mín. 5 caracteres)."),
  city: z.string().min(2, "La ciudad es requerida (mín. 2 caracteres)."),
  state: z.string().min(2, "El departamento es requerido (mín. 2 caracteres)."),
  zipCode: z.string().optional(),
  country: z.string().min(2, "El país es requerido (mín. 2 caracteres).").default('Colombia'),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

const getCartFromLocalStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
};

const calculateOrderSummary = (cartItems: any[]) => {
  if (cartItems.length === 0) {
    return { items: [], subtotal: 0, shipping: 0, total: 0 };
  }
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasFreeShipping = cartItems.some(item => item.id === 'combo-navideno' || item.id === 'creatina-for-women');
  const shipping = hasFreeShipping ? 0 : (subtotal > 200000 ? 0 : 15000);
  const total = subtotal + shipping;
  
  return { items: cartItems, subtotal, shipping, total };
};

const APP_URL = (process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '').toString();
const boldRedirect = APP_URL ? `${APP_URL.replace(/\/$/, '')}/order/success` : '/order/success';

function CheckoutContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState(calculateOrderSummary([]));
  const [isBoldLoading, setIsBoldLoading] = useState(false);
  const [isCoinbaseLoading, setIsCoinbaseLoading] = useState(false);
  const [boldButtonData, setBoldButtonData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: { 
      fullName: '', 
      address: '', 
      city: '', 
      state: '', 
      zipCode: '', 
      country: 'Colombia', 
      email: '', 
      phone: '' 
    },
    mode: 'onChange',
  });

  const { profile, isLoading: isProfileLoading, error: profileError } = useProfile(user);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const cart = getCartFromLocalStorage();
    setCartItems(cart);
    setOrderSummary(calculateOrderSummary(cart));
    setIsCartLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        const updatedCart = e.newValue ? JSON.parse(e.newValue) : [];
        setCartItems(updatedCart);
        setOrderSummary(calculateOrderSummary(updatedCart));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cargar usuario autenticado
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setUser(null);
      setAuthChecked(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Actualizar formulario cuando se carga el perfil
  useEffect(() => {
    if (profile && Object.values(profile).some(v => v)) {
      shippingForm.reset(profile);
      setTimeout(() => {
        shippingForm.trigger();
      }, 100);
    }
  }, [profile, shippingForm]);

  useEffect(() => {
    // ✅ Agregar validación explícita
    if (!user?.email) {
      console.log('No hay usuario autenticado o email no disponible');
      return;
    }

    const fetchProfile = async () => {
      try {
        const normalizedEmail = user.email!.toLowerCase().trim();
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.error('Supabase fetchProfile error:', error);
          return;
        }

        if (data) {
          const addressObj = Array.isArray(data.addresses) && data.addresses.length > 0
            ? data.addresses[0]
            : {};

          const shippingData = {
            fullName: data.name ?? '',
            address: addressObj.street ?? addressObj.address ?? '',
            city: addressObj.city ?? '',
            state: addressObj.state ?? '',
            zipCode: addressObj.zipCode ?? '',
            country: addressObj.country ?? 'Colombia',
            email: data.id ?? '',
            phone: data.phone ?? '',
          };

          shippingForm.reset(shippingData as any);
        }
      } catch (err) {
        console.error('fetchProfile exception', err);
      }
    };

    fetchProfile();
  }, [user, shippingForm]);

  useEffect(() => {
    if (!isCartLoaded) return;

    if (cartItems.length === 0) {
      toast({ 
        title: "Carrito Vacío", 
        description: "No puedes proceder al pago con un carrito vacío.", 
        variant: "destructive" 
      });
      setTimeout(() => {
        router.push('/cart');
      }, 1500);
    }
  }, [cartItems, isCartLoaded, router, toast]);

  useEffect(() => {
    if (isCartLoaded && authChecked && user === null) {
      toast({
        title: "Debes iniciar sesión",
        description: "Por favor inicia sesión para finalizar tu compra.",
        variant: "destructive"
      });
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }
  }, [user, isCartLoaded, authChecked, router, toast]);

  const handleSaveProfile = async () => {
    try {
      const isValid = await shippingForm.trigger();
      if (!isValid) {
        toast({
          title: "Datos incompletos",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive"
        });
        return false;
      }

      if (!user?.email) {
        toast({
          title: "Error",
          description: "No se pudo identificar el usuario.",
          variant: "destructive"
        });
        return false;
      }

      const formData = shippingForm.getValues();
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');

      const normalizedEmail = user.email.toLowerCase().trim();

      const addressData = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode || '',
        country: formData.country,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: normalizedEmail,
          name: formData.fullName,
          phone: formData.phone || '',
          addresses: [addressData],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error guardando perfil:', error);
        toast({
          title: "Error al guardar",
          description: "No se pudieron guardar los cambios.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "✅ Perfil actualizado",
        description: "Tus datos de envío se guardaron correctamente.",
      });
      return true;

    } catch (err) {
      console.error('Exception guardando perfil:', err);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getValidatedOrderInput = async () => {
    const isShippingValid = await shippingForm.trigger();
    if (!isShippingValid) {
      toast({ 
        title: "Información Incompleta", 
        description: "Por favor, completa los detalles de envío correctamente.", 
        variant: "destructive" 
      });
      return null;
    }

    if (cartItems.length === 0) {
      toast({ 
        title: "Carrito Vacío", 
        description: "Tu carrito está vacío.", 
        variant: "destructive" 
      });
      return null;
    }

    const profileSaved = await handleSaveProfile();
    if (!profileSaved) {
      return null;
    }

    return {
      shippingDetails: shippingForm.getValues(),
      cartItems: cartItems,
      amount: orderSummary.total,
      currency: 'COP',
      orderId: `order-${Date.now()}`,
      customerData: {
        email: shippingForm.getValues().email,
        fullName: shippingForm.getValues().fullName,
        phone: shippingForm.getValues().phone || '',
      },
      billingAddress: {
        address: shippingForm.getValues().address,
        city: shippingForm.getValues().city,
        state: shippingForm.getValues().state,
        zipCode: shippingForm.getValues().zipCode || '',
        country: shippingForm.getValues().country,
      },
    };
  };

  async function handleBoldCheckout() {
    setIsBoldLoading(true);
    const orderInput = await getValidatedOrderInput();
    if (!orderInput) {
      setIsBoldLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bold/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderInput.orderId,
          amount: orderInput.amount,
          currency: orderInput.currency,
          cartItems: orderInput.cartItems,
          shippingData: orderInput.shippingDetails,
          userEmail: user?.email || orderInput.customerData.email,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        setBoldButtonData({
          orderId: result.data.orderId,
          amount: result.data.amount,
          currency: result.data.currency,
          integritySignature: result.data.integritySignature,
          redirectionUrl: boldRedirect,
          description: `Pedido AVA Shop - ${orderInput.cartItems.length} items`,
          customerData: orderInput.customerData,
          billingAddress: orderInput.billingAddress,
        });
      } else {
        toast({ 
          title: 'Error al preparar el pago', 
          description: result.message || 'No se pudo preparar el pago.', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast({ 
        title: 'Error al preparar el pago', 
        description: 'Ocurrió un error al comunicar con el servidor.', 
        variant: 'destructive' 
      });
    }
    setIsBoldLoading(false);
  }

  async function handleCoinbaseCheckout() {
    setIsCoinbaseLoading(true);
    const orderInput = await getValidatedOrderInput();
    if (!orderInput) {
      setIsCoinbaseLoading(false);
      return;
    }
    
    try {
      const result = await createCoinbaseCharge(orderInput);

      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        toast({
          title: "Problema con el Pedido",
          description: result.message || "No se pudo procesar el pedido con Coinbase.",
          variant: "destructive"
        });
        setIsCoinbaseLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error al procesar el pago",
        description: "Ocurrió un error al comunicar con Coinbase.",
        variant: "destructive"
      });
      setIsCoinbaseLoading(false);
    }
  }

  async function handleWhatsAppCheckout() {
    const orderInput = await getValidatedOrderInput();
    if (!orderInput) return;

    const whatsappNumber = '573504017710';
    const itemsText = orderInput.cartItems.map(item => 
      `${item.name} x${item.quantity} - ${formatColombianCurrency(item.price * item.quantity)}`
    ).join('\n');
    
    const message = encodeURIComponent(
      `Hola, quiero hacer un pedido contra entrega.\n\n` +
      `Nombre: ${orderInput.shippingDetails.fullName}\n` +
      `Email: ${orderInput.shippingDetails.email}\n` +
      `Dirección: ${orderInput.shippingDetails.address}, ${orderInput.shippingDetails.city}, ${orderInput.shippingDetails.state}, ${orderInput.shippingDetails.country}\n` +
      `Teléfono: ${orderInput.shippingDetails.phone || 'No especificado'}\n\n` +
      `Items:\n${itemsText}\n\n` +
      `Subtotal: ${formatColombianCurrency(orderSummary.subtotal)}\n` +
      `Envío: ${orderSummary.shipping === 0 ? 'Gratis' : formatColombianCurrency(orderSummary.shipping)}\n` +
      `Total: ${formatColombianCurrency(orderSummary.total)}\n\n` +
      `Por favor confirma el pedido.`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  }

  const handleBoldClose = () => {
    setBoldButtonData(null);
  };

  const isPaymentProcessing = isBoldLoading || isCoinbaseLoading;

  if (!isCartLoaded || !authChecked) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const heroProduct = cartItems[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Hero Section Optimizado */}
      {heroProduct && (
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-6 md:py-10">
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center max-w-6xl mx-auto">
              {/* Imagen del producto */}
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 shadow-2xl border border-border/20">
                <Image
                  src={heroProduct.imageUrl || heroProduct.imageUrls?.[0] || '/images/placeholder-product.png'}
                  alt={heroProduct.name}
                  fill
                  className="object-contain p-4 md:p-8"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={heroProduct.imageUrl?.startsWith('/images')}
                />
                {/* Badge de oferta */}
                {orderSummary.shipping === 0 && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                    Envío Gratis
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="space-y-4 md:space-y-6 text-center md:text-left">
                <div className="space-y-2 md:space-y-3">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline text-foreground leading-tight">
                    ¡Ya casi es tuyo!
                  </h1>
                  <p className="text-lg md:text-2xl font-semibold text-primary">
                    {heroProduct.name}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                    {heroProduct.description || 'Completa tu compra de forma rápida y segura'}
                  </p>
                </div>

                {/* CTA Principal */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 md:p-6 border border-primary/20 shadow-lg">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    <span className="text-base md:text-xl font-bold text-foreground">
                      Compra 100% Segura con CCS724
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Pagos Encriptados</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Envíos Verificados</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Soporte 24/7</span>
                    </div>
                  </div>
                </div>

                {/* Total destacado en mobile */}
                <div className="md:hidden bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-muted-foreground">Total a pagar:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatColombianCurrency(orderSummary.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Formulario de Envío */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-border/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                <CardTitle className="text-xl md:text-2xl font-headline flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Home className="h-5 w-5 md:h-6 md:w-6 text-primary"/>
                  </div>
                  <span>Información de Envío</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {isProfileLoading && (
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                    Cargando tus datos guardados...
                  </div>
                )}
                {profileError && (
                  <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    Error: {profileError}
                  </div>
                )}
                <Form {...shippingForm}>
                  <form id="shipping-form" className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField 
                        control={shippingForm.control} 
                        name="fullName" 
                        render={({ field }) => ( 
                          <FormItem> 
                            <FormLabel className="text-sm font-semibold">Nombre Completo</FormLabel> 
                            <FormControl>
                              <Input placeholder="Ana Pérez" className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={shippingForm.control} 
                        name="email" 
                        render={({ field }) => ( 
                          <FormItem> 
                            <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                              <Mail className="h-4 w-4 text-primary"/>
                              Correo Electrónico
                            </FormLabel> 
                            <FormControl>
                              <Input type="email" placeholder="tu@correo.com" className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                    </div>
                    <FormField 
                      control={shippingForm.control} 
                      name="address" 
                      render={({ field }) => ( 
                        <FormItem> 
                          <FormLabel className="text-sm font-semibold">Dirección Completa</FormLabel> 
                          <FormControl>
                            <Input placeholder="Cra 10 # 20-30 Apto 101" className="h-11" {...field} />
                          </FormControl> 
                          <FormMessage /> 
                        </FormItem> 
                      )} 
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <FormField 
                        control={shippingForm.control} 
                        name="city" 
                        render={({ field }) => ( 
                          <FormItem className="col-span-2 sm:col-span-1"> 
                            <FormLabel className="text-sm font-semibold">Ciudad</FormLabel> 
                            <FormControl>
                              <Input placeholder="Bogotá" className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={shippingForm.control} 
                        name="state" 
                        render={({ field }) => ( 
                          <FormItem className="col-span-2 sm:col-span-1"> 
                            <FormLabel className="text-sm font-semibold">Departamento</FormLabel> 
                            <FormControl>
                              <Input placeholder="Cundinamarca" className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={shippingForm.control} 
                        name="zipCode" 
                        render={({ field }) => ( 
                          <FormItem className="col-span-2 sm:col-span-1"> 
                            <FormLabel className="text-sm font-semibold">Código Postal</FormLabel> 
                            <FormControl>
                              <Input placeholder="110111 (opcional)" className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField 
                        control={shippingForm.control} 
                        name="country" 
                        render={({ field }) => ( 
                          <FormItem> 
                            <FormLabel className="text-sm font-semibold">País</FormLabel> 
                            <FormControl>
                              <Input className="h-11" {...field} />
                            </FormControl> 
                            <FormMessage /> 
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={shippingForm.control} 
                        name="phone" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="3504017710" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                    </div>
                  </form>
                </Form>
                
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSaveProfile}
                    disabled={!shippingForm.formState.isValid}
                    className="w-full sm:w-auto"
                  >
                    💾 Guardar mis datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Pedido - Sticky en desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card className="shadow-2xl border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle className="text-xl md:text-2xl font-headline flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary"/>
                    </div>
                    <span>Tu Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  {/* Lista de productos compacta */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {orderSummary.items.map(item => (
                      <div key={item.id} className="flex gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-background border border-border/30">
                          <Image
                            src={item.imageUrl || item.imageUrls?.[0] || '/images/placeholder-product.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized={item.imageUrl?.startsWith('/images')}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                            <p className="text-sm font-bold text-primary">
                              {formatColombianCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator/>
                  
                  {/* Totales */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatColombianCurrency(orderSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className={orderSummary.shipping === 0 ? "text-green-600 font-bold" : "font-semibold"}>
                        {orderSummary.shipping === 0 ? '¡Gratis!' : formatColombianCurrency(orderSummary.shipping)}
                      </span>
                    </div>
                    {orderSummary.shipping === 0 && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-2">
                        <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-2 justify-center">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="font-semibold">Envío gratis aplicado</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />
                  
                  {/* Total destacado */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-2xl md:text-3xl font-bold text-primary">
                        {formatColombianCurrency(orderSummary.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-3 p-4 md:p-6 pt-0">
                  {!boldButtonData ? (
                    <>
                      <Button 
                        type="button" 
                        onClick={handleBoldCheckout} 
                        size="lg" 
                        className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all" 
                        disabled={!user || isPaymentProcessing || !shippingForm.formState.isValid || cartItems.length === 0}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        {isBoldLoading ? 'Preparando...' : 'Pagar con Tarjeta'}
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleCoinbaseCheckout} 
                        size="lg" 
                        variant="outline"
                        className="w-full h-12 text-base font-bold border-2" 
                        disabled={isPaymentProcessing || !shippingForm.formState.isValid || cartItems.length === 0}
                      >
                        <Bitcoin className="mr-2 h-5 w-5" />
                        {isCoinbaseLoading ? 'Procesando...' : 'Pagar con Cripto'}
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleWhatsAppCheckout} 
                        size="lg" 
                        variant="secondary"
                        className="w-full h-12 text-base font-bold" 
                        disabled={!shippingForm.formState.isValid || cartItems.length === 0}
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Contra Entrega (WhatsApp)
                      </Button>
                    </>
                  ) : (
                    <div className="w-full space-y-3">
                      <p className="text-sm text-center text-muted-foreground">
                        Completa el pago en la ventana de Bold
                      </p>
                      <BoldButton {...boldButtonData} onClose={handleBoldClose} />
                    </div>
                  )}
                  
                  <div className="w-full pt-3 border-t">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        Al continuar aceptas nuestros{' '}
                        <Link href="/terminos-y-condiciones" className="underline hover:text-primary font-medium">
                          Términos y Condiciones
                        </Link>
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      const parsedCart: CartItem[] = JSON.parse(cartData);
      setCart(parsedCart);

      const totalValue = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalItems = parsedCart.reduce((sum, item) => sum + item.quantity, 0);
      const contentIds = parsedCart.map(item => item.id);

      trackInitiateCheckout(totalValue, totalItems, contentIds);
    }
  }, []);

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
        <p>Cargando checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
