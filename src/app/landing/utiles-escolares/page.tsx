'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { getSupabase } from '@/lib/supabaseClient';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  X, Eye, ShoppingCart, Trash2, User, ClipboardList, Check,
  MessageCircle, CreditCard, Mail, ChevronDown 
} from 'lucide-react';
import BoldButton from '@/components/checkout/BoldButton';

import { getOrderConfirmationEmail } from '@/lib/email';
import { useToast } from '../../../components/ui/use-toast';

// Tipos
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  subcategory_id: string;
};
type Subcategory = {
  id: string;
  name: string;
  category_id: string;
  products: Product[];
};
type Category = {
  id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function UtilesEscolaresLanding() {
  // Estado para catálogo desde BD
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Estado UI
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [openSub, setOpenSub] = useState<{ [catId: string]: string | null }>({});
  const [cart, setCart] = useState<{ [prodId: string]: number }>({});
  const [accumulated, setAccumulated] = useState(0);
  const [quickviewProduct, setQuickviewProduct] = useState<Product | null>(null);
  const [showCartDetail, setShowCartDetail] = useState(false);

  // Auth y perfil
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authCollapsed, setAuthCollapsed] = useState(true);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    street: '',
    country: 'Colombia',
    zipCode: '',
  });

  const [profileStatus, setProfileStatus] = useState<{
    type: 'idle' | 'saving' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const { toast } = useToast();

  // Agrega este estado después de los otros estados
  const [cartSaving, setCartSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ===== Cargar catálogo desde Supabase =====
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      const supabase = getSupabase();
      if (!supabase) {
        setLoadingCatalog(false);
        return;
      }
      
      // 1. Trae categorías
      const { data: cats } = await supabase.from('categories').select('*');
      // 2. Trae subcategorías
      const { data: subs } = await supabase.from('subcategories').select('*');
      // 3. Trae productos
      const { data: prods } = await supabase.from('products').select('*');

      // 4. Arma la estructura anidada
      const subcategories: Subcategory[] = (subs || []).map(sub => ({
        ...sub,
        products: (prods || []).filter(p => p.subcategory_id === sub.id),
      }));

      const categoriesWithSubs: Category[] = (cats || []).map(cat => ({
        ...cat,
        subcategories: subcategories.filter(sub => sub.category_id === cat.id),
      }));

      setCategories(categoriesWithSubs);

      // Inicializar openSub con la primera subcategoría de cada categoría
      setOpenSub(
        (cats || []).reduce((acc, cat) => ({
          ...acc,
          [cat.id]: subcategories.find(sub => sub.category_id === cat.id)?.id || null
        }), {})
      );

      setLoadingCatalog(false);
    };

    fetchCatalog();
  }, []);

  // ===== Escuchar sesión Firebase =====
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthChecked(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthChecked(true);

      if (u) setAuthCollapsed(true);
      if (!u) {
        setAuthCollapsed(false);
        setProfileCollapsed(false);
      }
    });

    return () => unsub();
  }, []);

  // ===== Cargar perfil desde Supabase =====
  useEffect(() => {
    const loadProfile = async () => {
      if (!firebaseUser?.email) return;

      const supabase = getSupabase();
      if (!supabase) return;

      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone, addresses')
          .eq('id', firebaseUser.email)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setProfileCollapsed(false);
          return;
        }

        let addr0 = {
          city: '',
          state: '',
          street: '',
          country: 'Colombia',
          zipCode: '',
        };
        try {
          const parsed =
            typeof data.addresses === 'string'
              ? JSON.parse(data.addresses)
              : data.addresses;
          if (Array.isArray(parsed) && parsed.length) {
            addr0 = {
              ...addr0,
              ...parsed[0],
            };
          }
        } catch {}

        setProfileForm({
          name: data.name ?? '',
          phone: data.phone ?? '',
          city: addr0.city ?? '',
          state: addr0.state ?? '',
          street: addr0.street ?? '',
          country: addr0.country ?? 'Colombia',
          zipCode: addr0.zipCode ?? '',
        });

        const isFilled =
          Boolean(data.name) &&
          Boolean(data.phone) &&
          Boolean(addr0.street) &&
          Boolean(addr0.city);

        setProfileCollapsed(isFilled);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [firebaseUser?.email]);

  // ===== Cargar carrito desde la base de datos cuando el usuario inicia sesión =====
  useEffect(() => {
    if (!firebaseUser?.email) return;

    const loadCart = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('user_carts')
        .select('product_id, quantity')
        .eq('profile_id', firebaseUser.email);

      if (!error && data) {
        const cartFromDb: { [prodId: string]: number } = {};
        data.forEach((item: any) => {
          cartFromDb[item.product_id] = item.quantity;
        });
        setCart(cartFromDb);
      }
    };

    loadCart();
  }, [firebaseUser?.email]);

  // ===== Recalcular total cuando cambie el carrito O las categorías =====
  useEffect(() => {
    if (categories.length > 0) {
      recalculateAccumulated(cart);
    }
  }, [cart, categories]);

  // ===== Guardar carrito en la base de datos cada vez que cambie =====
  useEffect(() => {
    if (!firebaseUser?.email) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setCartSaving(true);
    
    const saveCart = async () => {
      const items = Object.entries(cart).map(([product_id, quantity]) => ({
        profile_id: firebaseUser.email,
        product_id,
        quantity,
        updated_at: new Date().toISOString(),
      }));

      // Borra el carrito anterior y guarda el nuevo
      await supabase.from('user_carts').delete().eq('profile_id', firebaseUser.email);
      if (items.length > 0) {
        await supabase.from('user_carts').upsert(items, { onConflict: 'profile_id,product_id' });
      }
      
      setLastSaved(new Date());
      setCartSaving(false);
    };

    // Debounce: espera 1 segundo después del último cambio antes de guardar
    const timer = setTimeout(() => {
      saveCart();
    }, 1000);

    return () => clearTimeout(timer);
  }, [cart, firebaseUser?.email]);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileStatus({ type: 'saving' });

    if (!firebaseUser?.email) {
      setProfileStatus({
        type: 'error',
        message: 'Debes iniciar sesión para guardar tus datos.',
      });
      setAuthCollapsed(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setProfileStatus({
        type: 'error',
        message: 'Supabase no está configurado (revisa NEXT_PUBLIC_SUPABASE_URL / ANON KEY).',
      });
      return;
    }

    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();

    if (!name) {
      setProfileStatus({ type: 'error', message: 'El nombre es obligatorio.' });
      return;
    }

    const addresses = [
      {
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        street: profileForm.street.trim(),
        country: (profileForm.country || 'Colombia').trim(),
        zipCode: profileForm.zipCode.trim(),
      },
    ];

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: firebaseUser.email,
          name,
          phone,
          addresses: JSON.stringify(addresses),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      setProfileStatus({
        type: 'error',
        message: error.message || 'No se pudo guardar la información.',
      });
      return;
    }

    setProfileStatus({ type: 'success', message: 'Información guardada correctamente.' });
    setProfileCollapsed(true);
  };

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  };

  // ===== Lógica de carrito adaptada =====
  const handleToggleSub = (catId: string, subId: string) => {
    setOpenSub((prev) => ({
      ...prev,
      [catId]: prev[catId] === subId ? null : subId,
    }));
  };

  const handleToggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const newQty = (prev[product.id] || 0) + 1;
      const newCart = { ...prev, [product.id]: newQty };
      recalculateAccumulated(newCart);
      return newCart;
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) => {
      const newQty = Math.max((prev[product.id] || 0) - 1, 0);
      const newCart = { ...prev, [product.id]: newQty };
      if (newQty === 0) delete newCart[product.id];
      recalculateAccumulated(newCart);
      return newCart;
    });
  };

  const recalculateAccumulated = (cartObj: { [prodId: string]: number }) => {
    let total = 0;
    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((prod) => {
          if (cartObj[prod.id]) total += prod.price * cartObj[prod.id];
        })
      )
    );
    setAccumulated(total);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const formattedTotal = new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(accumulated);

  const getCartItems = () => {
    const items: Array<{ product: Product; quantity: number }> = [];
    Object.entries(cart).forEach(([prodId, qty]) => {
      if (qty > 0) {
        const product = categories.flatMap(cat => 
          cat.subcategories.flatMap(sub => sub.products)
        ).find(p => p.id === prodId);
        if (product) {
          items.push({ product, quantity: qty });
        }
      }
    });
    return items;
  };

  const [showBoldPayment, setShowBoldPayment] = useState(false);
  const [boldPaymentData, setBoldPaymentData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleWhatsAppCheckout = async () => {
    if (!firebaseUser?.email) {
      toast({
        title: "Debes iniciar sesión",
        description: "Por favor inicia sesión para finalizar tu pedido.",
        variant: "destructive"
      });
      setAuthCollapsed(false);
      return;
    }

    if (!profileForm.name) {
      toast({
        title: "Completa tus datos",
        description: "Por favor completa tu información de contacto.",
        variant: "destructive"
      });
      setProfileCollapsed(false);
      return;
    }

    if (totalItems === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    const items = getCartItems();
    const whatsappNumber = '573504017710';
    
    // Mensaje detallado con nombre registrado
    const itemsText = items
      .map(({ product, quantity }) => 
        `• ${product.name}\n  Cantidad: ${quantity}\n  Precio unitario: ${formatColombianCurrency(product.price)}\n  Subtotal: ${formatColombianCurrency(product.price * quantity)}`
      )
      .join('\n\n');
    
    const message = encodeURIComponent(
      `🛒 *PEDIDO DE ÚTILES ESCOLARES*\n\n` +
      `👤 *Cliente:* ${profileForm.name}\n` +
      `📧 *Email:* ${firebaseUser.email}\n` +
      `📱 *Teléfono:* ${profileForm.phone || 'No especificado'}\n` +
      `📍 *Dirección:* ${profileForm.street}, ${profileForm.city}, ${profileForm.state}\n\n` +
      `📦 *PRODUCTOS (${totalItems} items):*\n\n${itemsText}\n\n` +
      `💰 *RESUMEN:*\n` +
      `Subtotal: ${formattedTotal}\n` +
      `Envío: Gratis ✅\n` +
      `*Total a pagar: ${formattedTotal}*\n\n` +
      `Por favor confirma mi pedido contra entrega.`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmailQuote = async () => {
    if (!firebaseUser?.email) {
      toast({
        title: "Debes iniciar sesión",
        description: "Por favor inicia sesión para enviar la cotización.",
        variant: "destructive"
      });
      setAuthCollapsed(false);
      return;
    }

    if (!profileForm.name) {
      toast({
        title: "Completa tus datos",
        description: "Por favor completa tu información de contacto.",
        variant: "destructive"
      });
      setProfileCollapsed(false);
      return;
    }

    if (totalItems === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      const items = getCartItems();
      
      const emailHtml = getOrderConfirmationEmail({
        orderId: `COTIZ-${Date.now()}`,
        customerName: profileForm.name,
        items: items.map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          price: product.price,
          image: product.image // ✅ Incluye la imagen
        })),
        total: accumulated,
        shippingAddress: profileForm.street ? {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          country: profileForm.country,
          zipCode: profileForm.zipCode
        } : undefined
      });

      await sendEmail({
        to: firebaseUser.email,
        subject: `Cotización de Útiles Escolares - ${profileForm.name}`,
        html: emailHtml,
        from: 'ventas@ccs724.com'
      });

      toast({
        title: "✅ Cotización enviada",
        description: `Hemos enviado la cotización a ${firebaseUser.email}`,
      });
    } catch (error) {
      console.error('Error enviando cotización:', error);
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar la cotización. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBoldPayment = async () => {
    if (!firebaseUser?.email) {
      toast({
        title: "Debes iniciar sesión",
        description: "Por favor inicia sesión para pagar.",
        variant: "destructive"
      });
      setAuthCollapsed(false);
      return;
    }

    if (!profileForm.name || !profileForm.city || !profileForm.street) {
      toast({
        title: "Completa tus datos",
        description: "Por favor completa tu información de contacto y dirección.",
        variant: "destructive"
      });
      setProfileCollapsed(false);
      return;
    }

    if (totalItems === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      const items = getCartItems();
      const orderId = `UTI-${Date.now()}`;

      const shippingData = {
        fullName: profileForm.name,
        email: firebaseUser.email,
        phone: profileForm.phone || '',
        address: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zipCode: profileForm.zipCode || '',
        country: profileForm.country,
      };

      const cartItems = items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        imageUrls: [product.image]
      }));

      const res = await fetch('/api/bold/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: accumulated,
          currency: 'COP',
          cartItems,
          shippingData,
          userEmail: firebaseUser.email,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        const APP_URL = process.env.NEXT_PUBLIC_BOLD_REDIRECT_URL || window.location.origin;
        const boldRedirect = `${APP_URL.replace(/\/$/, '')}/order/success`;

        setBoldPaymentData({
          orderId: result.data.orderId,
          amount: result.data.amount,
          currency: result.data.currency,
          integritySignature: result.data.integritySignature,
          redirectionUrl: boldRedirect,
          description: `Pedido Útiles Escolares - ${items.length} productos`,
          customerData: {
            email: firebaseUser.email,
            fullName: profileForm.name,
            phone: profileForm.phone || '',
          },
          billingAddress: {
            address: profileForm.street,
            city: profileForm.city,
            state: profileForm.state,
            zipCode: profileForm.zipCode || '',
            country: profileForm.country,
          },
        });
        setShowBoldPayment(true);

        // Enviar email de confirmación
        const emailHtml = getOrderConfirmationEmail({
          orderId,
          customerName: profileForm.name,
          items: items.map(({ product, quantity }) => ({
            name: product.name,
            quantity,
            price: product.price,
            image: product.image // ✅ Incluye la imagen
          })),
          total: accumulated,
          shippingAddress: profileForm.street ? {
            street: profileForm.street,
            city: profileForm.city,
            state: profileForm.state,
            country: profileForm.country,
            zipCode: profileForm.zipCode
          } : undefined
        });

        await sendEmail({
          to: firebaseUser.email,
          subject: `Confirmación de Pedido #${orderId}`,
          html: emailHtml,
          from: 'ventas@ccs724.com'
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
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatColombianCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Si el catálogo está cargando, muestra loader
  if (loadingCatalog) {
    return (
      <>
        <Header />
        <main className="pt-16 pb-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-2xl font-bold text-primary dark:text-primary-foreground">Cargando catálogo...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* ===== BANNER PRINCIPAL ===== */}
      <section className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] overflow-hidden mt-16">
        <img 
          src="/images/UTILES/BANNER UTILES.png" 
          alt="Útiles Escolares - Banner Principal" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </section>

      <main className="pb-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <section className="container mx-auto px-4 py-8">
          {/* Encabezado */}
          <div className="text-center mb-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-gray-900 dark:text-white">
              ¡Completa tu Lista Escolar!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              <span className="font-bold text-primary dark:text-yellow-500">Paso a paso:</span> Selecciona productos, toca
              <Eye className="inline w-5 h-5 mx-1 text-primary dark:text-yellow-500" />
              para ver detalles y presiona
              <span className="inline-block mx-1 px-3 py-1 bg-yellow-500 text-gray-900 rounded-full text-sm font-bold">
                Siguiente
              </span>
              para avanzar.
            </p>

            {/* NUEVO: Instrucciones rápidas */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-600 max-w-3xl mx-auto">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                ¿Cómo funciona?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-black text-sm">1</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Inicia sesión</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Haz clic en el ícono <User className="inline w-3 h-3 text-primary dark:text-yellow-500" /> para entrar con Google o email
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-black text-sm">2</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Completa tus datos</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Clic en <ClipboardList className="inline w-3 h-3 text-primary dark:text-yellow-500" /> para agregar nombre y dirección
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-black text-sm">3</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Selecciona productos</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Toca cada categoría <ChevronDown className="inline w-3 h-3 text-primary dark:text-yellow-500" />, elige y agrega al carrito
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-600 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-primary dark:text-yellow-500">💡 Tip:</span> 
                  Tu carrito se guarda automáticamente. Al final, puedes pagar con 
                  <span className="font-bold"> WhatsApp</span>, <span className="font-bold">Bold</span> o 
                  <span className="font-bold"> solicitar cotización</span>.
                </p>
              </div>
            </div>
          </div>

          {/* ===== Autenticación replegable ===== */}
          <div className="mb-6 max-w-4xl mx-auto flex justify-center">
            <div 
              onClick={() => authCollapsed && setAuthCollapsed(false)}
              className={`bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500 overflow-hidden ${
                authCollapsed 
                  ? 'w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary/5 dark:hover:bg-yellow-500/10 ring-2 ring-primary/20 dark:ring-yellow-500/30' 
                  : 'w-full rounded-3xl'
              }`}
            >
              {authCollapsed ? (
                <div className="relative">
                  <User className="w-7 h-7 text-primary dark:text-yellow-500" />
                  {firebaseUser && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
              ) : (
                <>
                  <div className="p-6 lg:p-8 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                        {firebaseUser ? 'Sesión iniciada' : 'Inicia sesión'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        {firebaseUser?.email || 'Para guardar tus datos'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAuthCollapsed(true); }}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                    {!firebaseUser ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <GoogleLoginButton className="w-full" text="Continuar con Google" redirectTo="/landing/utiles-escolares" />
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.setItem('authRedirect', '/landing/utiles-escolares');
                            router.push('/login');
                          }}
                          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 font-black text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          📧 Continuar con Email
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline"
                      >
                        Cerrar sesión
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ===== Formulario replegable ===== */}
          <div className="mb-12 max-w-4xl mx-auto flex justify-center">
            <div 
              onClick={() => profileCollapsed && setProfileCollapsed(false)}
              className={`bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500 overflow-hidden ${
                profileCollapsed 
                  ? 'w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary/5 dark:hover:bg-yellow-500/10 ring-2 ring-primary/20 dark:ring-yellow-500/30' 
                  : 'w-full rounded-3xl'
              }`}
            >
              {profileCollapsed ? (
                <div className="relative">
                  <ClipboardList className="w-7 h-7 text-primary dark:text-yellow-500" />
                  {profileForm.name && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary dark:bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <Check className="w-2 h-2 text-white dark:text-gray-900" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-6 lg:p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Tus datos</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Información para el pedido</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProfileCollapsed(true); }}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Email (solo lectura)
                        </label>
                        <input
                          value={firebaseUser?.email ?? ''}
                          readOnly
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none"
                          placeholder="Inicia sesión para ver tu email"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Nombre
                        </label>
                        <input
                          value={profileForm.name}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, name: ev.target.value }))}
                          type="text"
                          required
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Teléfono
                        </label>
                        <input
                          value={profileForm.phone}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, phone: ev.target.value }))}
                          type="tel"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="3001234567"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Ciudad
                        </label>
                        <input
                          value={profileForm.city}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, city: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Bogotá"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Departamento/Estado
                        </label>
                        <input
                          value={profileForm.state}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, state: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Cundinamarca"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Código postal
                        </label>
                        <input
                          value={profileForm.zipCode}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, zipCode: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="110121"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Dirección
                        </label>
                        <input
                          value={profileForm.street}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, street: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Calle / Carrera / Apt..."
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={profileStatus.type === 'saving' || !firebaseUser?.email}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 py-3 rounded-xl font-black shadow-lg disabled:opacity-50 transition-all"
                      >
                        {profileStatus.type === 'saving' ? 'GUARDANDO...' : 'GUARDAR DATOS'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {categories.map((cat: Category, catIdx: number) => {
              const isExpanded = expandedCategories.includes(cat.id);
              const allProducts = cat.subcategories.find(s => s.id === openSub[cat.id])?.products || [];

              return (
                <div
                  key={cat.id}
                  className={`rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 transition-all duration-500 ring-2 ${
                    isExpanded 
                      ? 'ring-primary hover:ring-primary/80' 
                      : 'ring-gray-200 dark:ring-gray-700 hover:ring-primary/40'
                  } ${isExpanded ? 'flex flex-col lg:flex-row' : 'flex flex-row'}`}
                >
                  {/* Banner - Compacto cuando está replegado */}
                  <div 
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                      isExpanded 
                        ? 'w-full lg:w-[28%] xl:w-[23%] min-h-[220px] lg:min-h-[850px]' 
                        : 'w-full h-[120px] lg:h-[150px]'
                    }`}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex ${
                      isExpanded 
                        ? 'flex-col justify-end p-6 lg:p-10' 
                        : 'flex-row items-center justify-between px-6 lg:px-10'
                    }`}>
                      <div className={isExpanded ? 'space-y-4' : 'flex items-center gap-4 flex-1'}>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-1.5 bg-primary rounded-full text-white font-black text-xs uppercase tracking-wider shadow-lg">
                            Paso {catIdx + 1}
                          </span>
                          {isExpanded && (
                            <span className="px-4 py-1.5 bg-green-500 rounded-full text-white font-black text-xs animate-pulse shadow-lg">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <h2 className={`text-white font-black uppercase tracking-tight leading-none drop-shadow-2xl ${
                          isExpanded 
                            ? 'text-4xl lg:text-6xl xl:text-7xl' 
                            : 'text-2xl lg:text-4xl'
                        }`}>
                          {cat.name}
                        </h2>
                        {isExpanded && allProducts.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-white/95 text-base lg:text-xl font-bold flex items-center gap-2">
                              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                                📦 {allProducts.length}
                              </span>
                              productos disponibles
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Indicador de expandir/contraer */}
                      {!isExpanded && (
                        <div className="flex items-center gap-3">
                          <span className="text-white/80 text-sm font-bold hidden sm:block">
                            Toca para ver productos
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Área de Productos - Solo visible cuando está expandida */}
                  {isExpanded && (
                    <div className="w-full lg:w-[72%] xl:w-[77%] p-4 lg:p-6 xl:p-8 flex flex-col bg-gray-50 dark:bg-gray-900 animate-in slide-in-from-bottom duration-300">
                      {/* Botón para contraer (móvil) */}
                      <div className="flex justify-between items-center mb-4 lg:hidden">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Productos</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCategory(cat.id);
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                          Contraer ▲
                        </button>
                      </div>

                      {/* Selector de Subcategorías - VERSIÓN MEJORADA */}
                      {cat.subcategories.length > 0 && (
                        <div className="relative mb-6">
                          <div
                            className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-x-visible"
                          >
                            {cat.subcategories.map((sub: Subcategory) => (
                              <button
                                key={sub.id}
                                className={`
                                  flex-shrink-0
                                  px-4 py-2 rounded-full
                                  text-sm font-semibold
                                  transition-all duration-200
                                  whitespace-nowrap
                                  border
                                  ${openSub[cat.id] === sub.id
                                    ? 'bg-primary text-white border-primary shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary'}
                                `}
                                onClick={() => handleToggleSub(cat.id, sub.id)}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grid de productos */}
                      <div 
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 lg:gap-3 pr-2 ${
                          allProducts.length > 10 
                            ? 'max-h-[600px] lg:max-h-[750px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-200 dark:scrollbar-track-gray-700' 
                            : ''
                        }`}
                      >
                        {allProducts.map((prod: Product) => {
                          const qty = cart[prod.id] || 0;
                          return (
                            <div 
                              key={prod.id} 
                              className="relative group bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl p-2 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/40 dark:hover:border-yellow-500/40 hover:scale-[1.03]"
                            >
                              {/* Imagen con zoom en hover */}
                              <div className="aspect-[4/5] rounded-md lg:rounded-lg overflow-hidden mb-2 relative">
                                <img 
                                  src={prod.image} 
                                  alt={prod.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" 
                                />
                                {qty > 0 && (
                                  <div className="absolute top-1 right-1 bg-primary dark:bg-yellow-500 text-white dark:text-gray-900 rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center text-[10px] lg:text-xs font-black shadow-lg ring-2 ring-white dark:ring-gray-800">
                                    {qty}
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => setQuickviewProduct(prod)}
                                  className="absolute bottom-1 right-1 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 p-1 lg:p-1.5 rounded-md shadow-md transition-all lg:opacity-0 lg:group-hover:opacity-100 border border-gray-200 dark:border-gray-600"
                                  aria-label="Vista rápida"
                                >
                                  <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary dark:text-yellow-500" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight h-6 lg:h-7">
                                  {prod.name}
                                </h3>
                                <div className="flex items-baseline gap-1 flex-wrap">
                                  <span className="text-primary dark:text-yellow-500 font-black text-xs lg:text-sm">
                                    {formatColombianCurrency(prod.price)}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-500 text-[8px] lg:text-[9px] line-through">
                                    {formatColombianCurrency(Math.round(prod.price * 1.2))}
                                  </span>
                                  {prod.price < prod.price * 1.2 && (
                                    <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-[8px] font-bold ml-1">
                                      -20%
                                    </span>
                                  )}
                                </div>
                                
                                {/* Controles */}
                                <div className="flex items-center gap-1">
                                  <button 
                                    className="flex-1 py-1 lg:py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-200 font-bold text-[10px] lg:text-xs transition disabled:opacity-30"
                                    onClick={() => handleRemoveFromCart(prod)}
                                    disabled={qty === 0}
                                  >
                                    −
                                  </button>
                                  <span className="font-black text-xs lg:text-sm min-w-[18px] lg:min-w-[20px] text-center text-gray-900 dark:text-white">{qty}</span>
                                  <button 
                                    className="flex-1 py-1 lg:py-1.5 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-[10px] lg:text-xs transition shadow-sm hover:shadow-md"
                                    onClick={() => handleAddToCart(prod)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ===== Banner Finalizar Pedido ===== */}
          <section className="mt-20 relative overflow-hidden rounded-[2.5rem] max-w-6xl mx-auto min-h-[450px] flex items-center justify-center shadow-2xl">
            <img 
              src="/images/UTILES/banner final.png" 
              alt="Finalizar pedido" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
            
            <div className="relative z-10 text-center p-6 md:p-12 w-full text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-2xl uppercase tracking-tight text-white">
                ¡Finaliza tu Lista!
              </h2>
              
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 mb-10 inline-block border border-gray-700/50 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="text-center md:text-left">
                    <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-1">
                      Productos
                    </p>
                    <p className="text-3xl font-black text-white">{totalItems} items</p>
                  </div>
                  
                  <div className="w-px h-12 bg-gray-700 hidden md:block" />
                  
                  <div className="text-center md:text-left">
                    <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-1">
                      Total a pagar
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-lg">
                      {formattedTotal}
                    </p>
                  </div>
                </div>
              </div>
              
              {!showBoldPayment ? (
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    className="group bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleWhatsAppCheckout}
                    disabled={!firebaseUser || totalItems === 0}
                  >
                    <MessageCircle className="w-6 h-6 fill-current" />
                    <span className="hidden sm:inline">FINALIZAR POR</span>
                    <span className="font-black">WHATSAPP</span>
                  </button>
                  
                  <button 
                    className="group bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleBoldPayment}
                    disabled={!firebaseUser || totalItems === 0 || isProcessingPayment}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="hidden sm:inline">PAGAR CON</span>
                    <span className="font-black">{isProcessingPayment ? 'PROCESANDO...' : 'BOLD'}</span>
                  </button>
                  
                  <button 
                    className="group bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleEmailQuote}
                    disabled={!firebaseUser || totalItems === 0 || isProcessingPayment}
                  >
                    <Mail className="w-6 h-6" />
                    <span className="hidden sm:inline">ENVIAR</span>
                    <span className="font-black">COTIZACIÓN</span>
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6">
                  <BoldButton 
                    {...boldPaymentData} 
                    onClose={() => {
                      setShowBoldPayment(false);
                      setBoldPaymentData(null);
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
      <Footer />

      {/* Modal de Vista Rápida */}
      {quickviewProduct && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQuickviewProduct(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-black uppercase">
                Vista Rápida
              </span>
              <button
                onClick={() => setQuickviewProduct(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
            </div>

            <div className="p-6 lg:flex lg:gap-6">
              <div className="lg:w-1/2 mb-6 lg:mb-0 group/zoom">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden ring-2 ring-yellow-500/30 dark:ring-yellow-500/50 relative cursor-zoom-in">
                  <img 
                    src={quickviewProduct.image} 
                    alt={quickviewProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/zoom:scale-150" 
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover/zoom:opacity-100 transition-opacity">
                    🔍 Haz hover para zoom
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                      {quickviewProduct.name}
                    </h2>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
                        {formatColombianCurrency(Math.round(quickviewProduct.price * 1.2))}
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-black text-4xl">
                        {formatColombianCurrency(quickviewProduct.price)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-[8px] font-bold ml-1">
                        -20%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Características</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">✓</span>
                        Producto de alta calidad para uso escolar
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">✓</span>
                        Material resistente y duradero
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">✓</span>
                        Disponible para entrega inmediata
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 dark:text-green-400 font-bold">En stock - Entrega rápida</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Cantidad:</span>
                    <div className="flex items-center gap-3">
                      <button 
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-900 dark:text-white font-bold text-lg transition border border-gray-200 dark:border-gray-600"
                        onClick={() => handleRemoveFromCart(quickviewProduct)}
                        disabled={(cart[quickviewProduct.id] || 0) === 0}
                      >
                        −
                      </button>
                      <span className="font-black text-2xl min-w-[40px] text-center text-gray-900 dark:text-white">
                        {cart[quickviewProduct.id] || 0}
                      </span>
                      <button 
                        className="w-10 h-10 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-lg transition shadow-md"
                        onClick={() => handleAddToCart(quickviewProduct)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(quickviewProduct);
                      setQuickviewProduct(null);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contador Flotante con Hover para Ver Detalle */}
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-[95%] max-w-md"
        onMouseEnter={() => setShowCartDetail(true)}
        onMouseLeave={() => setShowCartDetail(false)}
      >
        {/* Panel de Detalle (visible en hover) */}
        {showCartDetail && totalItems > 0 && (
          <div className="mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-primary/20 dark:border-yellow-500/30 max-h-[400px] overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="bg-gradient-to-r from-primary to-blue-600 dark:from-yellow-600 dark:to-yellow-500 text-white dark:text-gray-900 p-3 flex items-center justify-between">
              <span className="font-black text-sm uppercase tracking-wider">Detalle de tu pedido</span>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary dark:scrollbar-thumb-yellow-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 p-4 space-y-3">
              {getCartItems().map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition group">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-14 h-14 object-cover rounded-lg ring-1 ring-gray-200 dark:ring-gray-600" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary dark:text-yellow-400 font-black text-sm">
                        {formatColombianCurrency(product.price)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-[8px] lg:text-[9px] line-through">
                        {formatColombianCurrency(Math.round(product.price * 1.2))}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-gray-900 dark:text-white font-black text-sm">
                      {formatColombianCurrency(product.price * quantity)}
                    </span>
                    <button
                      onClick={() => {
                        setCart(prev => {
                          const newCart = { ...prev };
                          delete newCart[product.id];
                          recalculateAccumulated(newCart);
                          return newCart;
                        });
                      }}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition opacity-0 group-hover:opacity-100"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totalizador Principal */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white p-4 lg:p-5 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-primary/30 dark:border-yellow-500/40 backdrop-blur-md cursor-pointer hover:scale-[1.02] transition-transform">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-primary dark:text-yellow-400 font-black uppercase tracking-widest">
                Tu Pedido {showCartDetail && '👇'}
              </span>
              {firebaseUser && (
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  cartSaving 
                    ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' 
                    : 'bg-green-500/20 text-green-400 dark:bg-green-400/20 dark:text-green-300'
                }`}>
                  {cartSaving ? '💾 Guardando...' : '✓ Guardado'}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-xl lg:text-2xl">{totalItems}</span>
              <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-300">productos</span>
            </div>
            {lastSaved && (
              <span className="text-[8px] text-gray-500 dark:text-gray-400 mt-1">
                Última actualización: {lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 dark:text-gray-300 font-black uppercase tracking-widest mb-1 block">
              Total Acumulado
            </span>
            <p className="font-black text-xl lg:text-2xl text-primary dark:text-yellow-400">{formattedTotal}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Ocultar scrollbar para filtros */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thumb-primary::-webkit-scrollbar-thumb {
          background-color: hsl(var(--primary));
          border-radius: 10px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 10px;
        }
        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.9); }
          to { transform: scale(1); }
        }
        @keyframes slide-in-from-bottom {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 200ms ease-out, zoom-in 200ms ease-out;
        }
        .slide-in-from-bottom {
          animation: slide-in-from-bottom 200ms ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}

async function sendEmail({ to, subject, html, from }: { to: string, subject: string, html: string, from?: string }) {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject,
      html,
      from: from || 'ventas@ccs724.com',
      cc: ['ccs724productos@gmail.com'],
    }),
  });
}