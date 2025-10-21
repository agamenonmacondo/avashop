'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Home, ShoppingCart, Mail, CreditCard, Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { formatColombianCurrency } from '@/lib/utils';
import { createCoinbaseCharge } from '@/lib/actions/order.actions';
import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import BoldButton from '@/components/checkout/BoldButton';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { getSupabase } from '@/lib/supabaseClient';

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

const IVA_RATE = 0.19; // 18%

const calculateOrderSummary = (cartItems: any[]) => {
  if (cartItems.length === 0) {
    return { items: [], subtotal: 0, iva: 0, shipping: 0, total: 0 };
  }
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const iva = subtotal * IVA_RATE;
  const shipping = subtotal > 200000 ? 0 : 15000;
  const total = subtotal + iva + shipping;
  return { items: cartItems, subtotal, iva, shipping, total };
};

const APP_URL = (process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || '').toString();
const boldRedirect = APP_URL ? `${APP_URL.replace(/\/$/, '')}/order/success` : '/order/success';

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState(calculateOrderSummary([]));
  const [isBoldLoading, setIsBoldLoading] = useState(false);
  const [isCoinbaseLoading, setIsCoinbaseLoading] = useState(false);
  const [boldButtonData, setBoldButtonData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // NUEVO: Flag para saber si ya se determinó el estado de autenticación
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
    setIsCartLoaded(true); // 🔑 NUEVO: Marcar que el carrito ya se cargó

    // Escuchar cambios en el carrito
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
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        const normalizedEmail = user.email.toLowerCase().trim();
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

  // 🔑 MODIFICADO: Verificar carrito vacío SOLO después de que se haya cargado
  useEffect(() => {
    if (!isCartLoaded) return; // No hacer nada hasta que el carrito se haya cargado

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
  }, [cartItems, isCartLoaded, router, toast]); // 🔑 Agregar isCartLoaded a las dependencias

  // Redirigir si NO está autenticado
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

  const getValidatedOrderInput = async () => {
    const isShippingValid = await shippingForm.trigger();
    if (!isShippingValid) {
      toast({ title: "Información Incompleta", description: "Por favor, completa los detalles de envío correctamente.", variant: "destructive" });
      return null;
    }
    if (cartItems.length === 0) {
      toast({ title: "Carrito Vacío", description: "Tu carrito está vacío.", variant: "destructive" });
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
      console.error('Error en handleBoldCheckout:', err);
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

  const handleBoldClose = () => {
    setBoldButtonData(null);
  };

  const isPaymentProcessing = isBoldLoading || isCoinbaseLoading;

  // 🔑 NUEVO: Mostrar loading mientras se carga el carrito
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Finalizar Compra</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <Home className="mr-3 h-6 w-6 text-primary"/>
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProfileLoading && (
                <div className="text-sm text-muted-foreground mb-4">
                  Cargando datos del perfil...
                </div>
              )}
              {profileError && (
                <div className="text-sm text-red-600 mb-4">
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
                          <FormLabel>Nombre Completo</FormLabel> 
                          <FormControl>
                            <Input placeholder="Ej: Ana Pérez" {...field} />
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
                          <FormLabel className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground"/>
                            Correo Electrónico
                          </FormLabel> 
                          <FormControl>
                            <Input type="email" placeholder="tu@correo.com" {...field} />
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
                        <FormLabel>Dirección (Calle, Carrera, Apto)</FormLabel> 
                        <FormControl>
                          <Input placeholder="Ej: Carrera 10 # 20-30 Apto 101" {...field} />
                        </FormControl> 
                        <FormMessage /> 
                      </FormItem> 
                    )} 
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField 
                      control={shippingForm.control} 
                      name="city" 
                      render={({ field }) => ( 
                        <FormItem> 
                          <FormLabel>Ciudad</FormLabel> 
                          <FormControl>
                            <Input placeholder="Ej: Bogotá D.C." {...field} />
                          </FormControl> 
                          <FormMessage /> 
                        </FormItem> 
                      )} 
                    />
                    <FormField 
                      control={shippingForm.control} 
                      name="state" 
                      render={({ field }) => ( 
                        <FormItem> 
                          <FormLabel>Departamento</FormLabel> 
                          <FormControl>
                            <Input placeholder="Ej: Cundinamarca" {...field} />
                          </FormControl> 
                          <FormMessage /> 
                        </FormItem> 
                      )} 
                    />
                    <FormField 
                      control={shippingForm.control} 
                      name="zipCode" 
                      render={({ field }) => ( 
                        <FormItem> 
                          <FormLabel>Código Postal (Opcional)</FormLabel> 
                          <FormControl>
                            <Input placeholder="Ej: 110111" {...field} />
                          </FormControl> 
                          <FormMessage /> 
                        </FormItem> 
                      )} 
                    />
                  </div>
                  <FormField 
                    control={shippingForm.control} 
                    name="country" 
                    render={({ field }) => ( 
                      <FormItem> 
                        <FormLabel>País</FormLabel> 
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 3504017710" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <ShoppingCart className="mr-3 h-6 w-6 text-primary"/>
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderSummary.items.length > 0 ? orderSummary.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                  </div>
                  <p>{formatColombianCurrency(item.price * item.quantity)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>}
              <Separator/>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatColombianCurrency(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (19%)</span>
                <span>{formatColombianCurrency(orderSummary.iva)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{orderSummary.shipping === 0 ? 'Gratis' : formatColombianCurrency(orderSummary.shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formatColombianCurrency(orderSummary.total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              {!boldButtonData ? (
                <div className="w-full space-y-2">
                    <Button 
                      type="button" 
                      onClick={handleBoldCheckout} 
                      size="lg" 
                      className="w-full text-base" 
                      disabled={!user || isPaymentProcessing || !shippingForm.formState.isValid || cartItems.length === 0}
                    >
                        <CreditCard className="mr-2 h-5 w-5" />
                        {isBoldLoading ? 'Preparando...' : 'Pago con Bold'}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleCoinbaseCheckout} 
                      size="lg" 
                      className="w-full text-base" 
                      disabled={isPaymentProcessing || !shippingForm.formState.isValid || cartItems.length === 0}
                    >
                        <Bitcoin className="mr-2 h-5 w-5" />
                        {isCoinbaseLoading ? 'Procesando...' : 'Pago con Cripto (Coinbase)'}
                    </Button>
                </div>
              ) : (
                <div className="w-full">
                  <p className="text-sm text-center mb-2 text-muted-foreground">
                    Haz clic en el botón de Bold para continuar.
                  </p>
                  <BoldButton {...boldButtonData} onClose={handleBoldClose} />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center w-full pt-2">
                Al continuar, aceptas nuestros <Link href="/terms" className="underline hover:text-primary">Términos y Condiciones</Link>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
