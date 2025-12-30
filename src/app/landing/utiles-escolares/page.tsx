'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { getSupabase } from '@/lib/supabaseClient';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  X, Eye, ShoppingCart, Trash2, User, ClipboardList, Check,
  MessageCircle, CreditCard, Mail 
} from 'lucide-react';
import BoldButton from '@/components/checkout/BoldButton';
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email';
import { useToast } from '../../../components/ui/use-toast';

// Tipos para tipar los parámetros y evitar errores TS7006
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};
type Subcategory = {
  id: string;
  name: string;
  products: Product[];
};
type Category = {
  id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
};

// Catálogo con imágenes exactas para cada producto
const CATEGORIES: Category[] = [
  {
    id: 'cuadernos',
    name: 'Cuadernos',
    image: '/images/UTILES/BANNER 1.png',
    subcategories: [
      {
        id: 'cosido',
        name: 'Cosido',
        products: [
          {
            id: 'cuad-cosido-100',
            name: 'Cuaderno cosido rayado 100h',
            price: 12000,
            image: '/images/UTILES/CUAD COSIDO 100.png',
          },
          {
            id: 'cuad-cosido-50',
            name: 'Cuaderno cosido cuadriculado 50h',
            price: 8000,
            image: '/images/UTILES/CUAD COSIDO 50.png',
          },
        ],
      },
      {
        id: 'argollado',
        name: 'Argollado',
        products: [
          {
            id: 'cuad-argollado-100',
            name: 'Cuaderno argollado 100h',
            price: 13000,
            image: '/images/UTILES/CUAD ARGOLLADO 100.png',
          },
        ],
      },
      {
        id: 'blocks',
        name: 'Blocks',
        products: [
          {
            id: 'block-rayado',
            name: 'Block rayado',
            price: 9000,
            image: '/images/UTILES/BLOCK RAYADO.png',
          },
        ],
      },
    ],
  },
  {
    id: 'escritura',
    name: 'Escritura',
    image: '/images/UTILES/BANNER 2.png',
    subcategories: [
      {
        id: 'lapiz',
        name: 'Lápiz',
        products: [
          {
            id: 'lapiz-n2',
            name: 'Lápiz N°2',
            price: 1500,
            image: '/images/UTILES/LAPIZ N2.png',
          },
          {
            id: 'lapiz-rojo',
            name: 'Lápiz rojo',
            price: 1700,
            image: '/images/UTILES/LAZPI ROJO.png',
          },
        ],
      },
      {
        id: 'esferos',
        name: 'Esferos',
        products: [
          {
            id: 'esfero-azul',
            name: 'Esfero azul',
            price: 1200,
            image: '/images/UTILES/EZFERO AZUL.png',
          },
          {
            id: 'esfero-negro',
            name: 'Esfero negro',
            price: 1200,
            image: '/images/UTILES/EZFERO NEGRO.png',
          },
          {
            id: 'esfero-rojo',
            name: 'Esfero rojo',
            price: 1200,
            image: '/images/UTILES/EZFERO ROJO.png',
          },
        ],
      },
      {
        id: 'marcadores',
        name: 'Marcadores',
        products: [
          {
            id: 'marcador-permanente',
            name: 'Marcador permanente',
            price: 2500,
            image: '/images/UTILES/MARCADOR PERMANETE.png',
          },
          {
            id: 'marcador-borrable',
            name: 'Marcador borrable',
            price: 2700,
            image: '/images/UTILES/MARCADOR BORRABLE.png',
          },
        ],
      },
    ],
  },
  {
    id: 'colores-arte',
    name: 'Colores y arte',
    image: '/images/UTILES/BANNER 3.png',
    subcategories: [
      {
        id: 'colores',
        name: 'Colores',
        products: [
          {
            id: 'colores-largos',
            name: 'Colores largos',
            price: 6000,
            image: '/images/UTILES/COLORE LARGOS.png',
          },
          {
            id: 'colores-cortos',
            name: 'Colores cortos',
            price: 4000,
            image: '/images/UTILES/COLORES CORTO.png',
          },
        ],
      },
      {
        id: 'crayones',
        name: 'Crayones',
        products: [
          {
            id: 'crayones-jumbo',
            name: 'Crayones jumbo',
            price: 5000,
            image: '/images/UTILES/CRAYONE SJUMBO.png',
          },
        ],
      },
      {
        id: 'temperas',
        name: 'Témperas y acuarelas',
        products: [
          {
            id: 'temperas',
            name: 'Témperas',
            price: 7000,
            image: '/images/UTILES/TEMPERA.png',
          },
          {
            id: 'acuarelas',
            name: 'Acuarelas',
            price: 8000,
            image: '/images/UTILES/TEMPERA.png',
          },
        ],
      },
    ],
  },
  {
    id: 'papeleria',
    name: 'Papelería',
    image: '/images/UTILES/BANNER 4.png',
    subcategories: [
      {
        id: 'papel-bond',
        name: 'Papel bond',
        products: [
          {
            id: 'resma-bond',
            name: 'Resma papel bond',
            price: 25000,
            image: '/images/UTILES/REMA BOND.png',
          },
        ],
      },
      {
        id: 'cartulina',
        name: 'Cartulina',
        products: [
          {
            id: 'cartulina-blanca',
            name: 'Cartulina blanca',
            price: 1200,
            image: '/images/UTILES/CARTULINA BLANCA.png',
          },
          {
            id: 'cartulina-color',
            name: 'Cartulina de color',
            price: 1300,
            image: '/images/UTILES/CARTULINA COLOR.png',
          },
        ],
      },
      {
        id: 'foamy',
        name: 'Foamy',
        products: [
          {
            id: 'foamy',
            name: 'Foamy',
            price: 1000,
            image: '/images/UTILES/FOAMY.png',
          },
        ],
      },
    ],
  },
  {
    id: 'corte-pegado',
    name: 'Corte y pegado',
    image: '/images/UTILES/BANNER 5.png',
    subcategories: [
      {
        id: 'tijeras',
        name: 'Tijeras',
        products: [
          {
            id: 'tijeras-roma',
            name: 'Tijeras punta roma',
            price: 3500,
            image: '/images/UTILES/TIJERAS ROMA.png',
          },
        ],
      },
      {
        id: 'pegantes',
        name: 'Pegantes',
        products: [
          {
            id: 'pegante-barra',
            name: 'Pegante en barra',
            price: 2500,
            image: '/images/UTILES/PEGANTE BARRA.png',
          },
          {
            id: 'pegante-liquido',
            name: 'Pegante líquido',
            price: 2200,
            image: '/images/UTILES/PEGANTE LIQUIDO.png',
          },
        ],
      },
      {
        id: 'cinta',
        name: 'Cinta',
        products: [
          {
            id: 'cinta',
            name: 'Cinta adhesiva',
            price: 1800,
            image: '/images/UTILES/CINTA.png',
          },
        ],
      },
    ],
  },
  {
    id: 'geometria',
    name: 'Geometría y medición',
    image: '/images/UTILES/BANNER 6.png',
    subcategories: [
      {
        id: 'reglas',
        name: 'Reglas',
        products: [
          {
            id: 'regla-20',
            name: 'Regla 20cm',
            price: 1200,
            image: '/images/UTILES/REGLA 20.png',
          },
          {
            id: 'regla-30',
            name: 'Regla 30cm',
            price: 1500,
            image: '/images/UTILES/REGLA 30.png',
          },
        ],
      },
      {
        id: 'escuadras',
        name: 'Escuadras',
        products: [
          {
            id: 'escuadra',
            name: 'Escuadra',
            price: 2000,
            image: '/images/UTILES/ESCUADRA.png',
          },
        ],
      },
      {
        id: 'compas',
        name: 'Compás',
        products: [
          {
            id: 'compas',
            name: 'Compás',
            price: 3500,
            image: '/images/UTILES/COMPAS.png',
          },
        ],
      },
    ],
  },
  {
    id: 'correccion-apoyo',
    name: 'Corrección y apoyo',
    image: '/images/UTILES/BANNER 7.png',
    subcategories: [
      {
        id: 'borrador',
        name: 'Borrador',
        products: [
          {
            id: 'borrador',
            name: 'Borrador',
            price: 1000,
            image: '/images/UTILES/BORRADOR.png',
          },
        ],
      },
      {
        id: 'sacapuntas',
        name: 'Sacapuntas',
        products: [
          {
            id: 'sacapuntas',
            name: 'Sacapuntas',
            price: 1200,
            image: '/images/UTILES/SACAPUNTAS.png',
          },
        ],
      },
      {
        id: 'corrector',
        name: 'Corrector',
        products: [
          {
            id: 'corrector-liquido',
            name: 'Corrector líquido',
            price: 2500,
            image: '/images/UTILES/CORRECTOR LIQUIDO.png',
          },
          {
            id: 'corrector-cinta',
            name: 'Corrector en cinta',
            price: 3000,
            image: '/images/UTILES/CORRECTOR CINTA.png',
          },
        ],
      },
    ],
  },
  {
    id: 'organizacion',
    name: 'Organización',
    image: '/images/UTILES/BANNER 8.png',
    subcategories: [
      {
        id: 'cartuchera',
        name: 'Cartuchera',
        products: [
          {
            id: 'cartuchera-sencilla',
            name: 'Cartuchera sencilla',
            price: 8000,
            image: '/images/UTILES/CARTUCHERA SENCILLA.png',
          },
          {
            id: 'cartuchera-doble',
            name: 'Cartuchera doble',
            price: 12000,
            image: '/images/UTILES/CARTUCHERA DOBLE.png',
          },
        ],
      },
      {
        id: 'carpetas',
        name: 'Carpetas',
        products: [
          {
            id: 'carpeta-oficio',
            name: 'Carpeta oficio',
            price: 3500,
            image: '/images/UTILES/CARPETA CARTA.png',
          },
          {
            id: 'carpeta-carta',
            name: 'Carpeta carta',
            price: 3500,
            image: '/images/UTILES/CARPETA CARTA.png',
          },
        ],
      },
      {
        id: 'forros',
        name: 'Forros',
        products: [
          {
            id: 'forro',
            name: 'Forro plástico',
            price: 1000,
            image: '/images/UTILES/FORRO PLASTICO.png',
          },
        ],
      },
    ],
  },
  {
    id: 'otros',
    name: 'Otros',
    image: '/images/UTILES/BANNER 9.png',
    subcategories: [
      {
        id: 'accesorios',
        name: 'Accesorios',
        products: [
          {
            id: 'regla-flexible',
            name: 'Regla flexible',
            price: 2000,
            image: '/images/UTILES/REGLA FLEXIBLE.png',
          },
        ],
      },
    ],
  },
];

// Array de rutas de imágenes de productos
const PRODUCT_IMAGES = [
	'/images/UTILES/PRODCUTOS (1).png',
	'/images/UTILES/PRODCUTOS (2).png',
	'/images/UTILES/PRODCUTOS (3).png',
	'/images/UTILES/PRODCUTOS (4).png',
	'/images/UTILES/PRODCUTOS (5).png',
	'/images/UTILES/PRODCUTOS (6).png',
	'/images/UTILES/PRODCUTOS (7).png',
	'/images/UTILES/PRODCUTOS (8).png',
	'/images/UTILES/PRODCUTOS (9).png',
	'/images/UTILES/PRODCUTOS (10).png',
	'/images/UTILES/PRODCUTOS (11).png',
	'/images/UTILES/PRODCUTOS (12).png',
	'/images/UTILES/PRODCUTOS (13).png',
	'/images/UTILES/PRODCUTOS (14).png',
	'/images/UTILES/PRODCUTOS (15).png',
	'/images/UTILES/PRODCUTOS (16).png',
	'/images/UTILES/PRODCUTOS (17).png',
	'/images/UTILES/PRODCUTOS (18).png',
	'/images/UTILES/PRODCUTOS (19).png',
	'/images/UTILES/PRODCUTOS (20).png',
	'/images/UTILES/PRODCUTOS (21).png',
	'/images/UTILES/PRODCUTOS (22).png',
	'/images/UTILES/PRODCUTOS (23).png',
	'/images/UTILES/PRODCUTOS (24).png',
	'/images/UTILES/PRODCUTOS (25).png',
	'/images/UTILES/PRODCUTOS (26).png',
	'/images/UTILES/PRODCUTOS (27).png',
];

// Función para asignar imágenes automáticamente a cada producto
function assignImagesToProducts(categories: Category[], images: string[]): Category[] {
	let imgIdx = 0;
	return categories.map((cat: Category) => ({
		...cat,
		subcategories: cat.subcategories.map((sub: Subcategory) => ({
			...sub,
			products: sub.products.map((prod: Product) => ({
				...prod,
				image: prod.image || images[imgIdx++] || '/images/UTILES/placeholder.png',
			})),
		})),
	}));
}

// Usa la función para tu catálogo
const CATEGORIES_WITH_IMAGES = assignImagesToProducts(CATEGORIES, PRODUCT_IMAGES);

// Luego, usa CATEGORIES_WITH_IMAGES en tu render en vez de CATEGORIES:
type CartItem = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

// Simulación de más productos en Cuadernos
const EXTENDED_CUADERNOS_PRODUCTS: Product[] = [
  { id: 'cuad-cosido-100', name: 'Cuaderno cosido rayado 100h', price: 12000, image: '/images/UTILES/CUAD COSIDO 100.png' },
  { id: 'cuad-cosido-50', name: 'Cuaderno cosido cuadriculado 50h', price: 8000, image: '/images/UTILES/CUAD COSIDO 50.png' },
  { id: 'cuad-argollado-100', name: 'Cuaderno argollado 100h', price: 13000, image: '/images/UTILES/CUAD ARGOLLADO 100.png' },
  { id: 'block-rayado', name: 'Block rayado', price: 9000, image: '/images/UTILES/BLOCK RAYADO.png' },
  // Productos simulados adicionales
  { id: 'cuad-cosido-200', name: 'Cuaderno cosido 200h', price: 18000, image: '/images/UTILES/CUAD COSIDO 100.png' },
  { id: 'cuad-espiral-80', name: 'Cuaderno espiral 80h', price: 10000, image: '/images/UTILES/CUAD ARGOLLADO 100.png' },
  { id: 'cuad-tapa-dura', name: 'Cuaderno tapa dura', price: 22000, image: '/images/UTILES/CUAD COSIDO 50.png' },
  { id: 'cuad-premium', name: 'Cuaderno premium 150h', price: 25000, image: '/images/UTILES/CUAD ARGOLLADO 100.png' },
  { id: 'block-dibujo', name: 'Block dibujo A4', price: 12000, image: '/images/UTILES/BLOCK RAYADO.png' },
  { id: 'cuad-mini', name: 'Cuaderno mini 50h', price: 5000, image: '/images/UTILES/CUAD COSIDO 50.png' },
  { id: 'cuad-profesional', name: 'Cuaderno profesional', price: 28000, image: '/images/UTILES/CUAD COSIDO 100.png' },
  { id: 'block-acuarela', name: 'Block acuarela', price: 15000, image: '/images/UTILES/BLOCK RAYADO.png' },
];

export default function UtilesEscolaresLanding() {
  // Cambiar: TODAS las categorías inician REPLEGADAS
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Inicializar con la primera subcategoría de cada categoría abierta
  const [openSub, setOpenSub] = useState<{ [catId: string]: string | null }>(
    CATEGORIES.reduce((acc, cat) => ({
      ...acc,
      [cat.id]: cat.subcategories[0]?.id || null
    }), {})
  );
  const [cart, setCart] = useState<{ [prodId: string]: number }>({});
  const [accumulated, setAccumulated] = useState(0);
  const [quickviewProduct, setQuickviewProduct] = useState<Product | null>(null);
  const [showCartDetail, setShowCartDetail] = useState(false);

  // ===== NUEVO: Auth (Firebase) + perfil (Supabase) con UI replegable =====
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [authCollapsed, setAuthCollapsed] = useState(true); // panel de autenticación
  const [profileCollapsed, setProfileCollapsed] = useState(false); // formulario datos
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

  // Escuchar sesión Firebase
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthChecked(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthChecked(true);

      // Si inicia sesión, plegar panel auth
      if (u) setAuthCollapsed(true);
      // Si se desloguea, expandir panel auth y expandir formulario (aunque estará bloqueado)
      if (!u) {
        setAuthCollapsed(false);
        setProfileCollapsed(false);
      }
    });

    return () => unsub();
  }, []);

  // Cargar perfil desde Supabase cuando haya usuario autenticado
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

        // addresses puede venir como string o como JSON
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
        } catch {
          // Si falla el parseo, deja los valores por defecto
        }

        setProfileForm({
          name: data.name ?? '',
          phone: data.phone ?? '',
          city: addr0.city ?? '',
          state: addr0.state ?? '',
          street: addr0.street ?? '',
          country: addr0.country ?? 'Colombia',
          zipCode: addr0.zipCode ?? '',
        });

        // Si “ya está lleno”, iniciar replegado
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

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileStatus({ type: 'saving' });

    // Exigir autenticación
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
          id: firebaseUser.email, // tu esquema usa email como id
          name,
          phone,
          addresses: JSON.stringify(addresses), // compatible con tu dump actual
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
  // ===== FIN NUEVO =====

  // Modificar CATEGORIES para usar productos extendidos en Cuadernos
  const CATEGORIES_EXTENDED = CATEGORIES.map(cat =>
    cat.id === 'cuadernos'
      ? {
          ...cat,
          subcategories: cat.subcategories.map(sub => ({
            ...sub,
            products:
              sub.id === 'cosido'
                ? EXTENDED_CUADERNOS_PRODUCTS.slice(0, 4)
                : sub.id === 'argollado'
                  ? EXTENDED_CUADERNOS_PRODUCTS.slice(4, 8)
                  : EXTENDED_CUADERNOS_PRODUCTS.slice(8),
          })),
        }
      : cat
  );

  const handleToggleSub = (catId: string, subId: string) => {
    setOpenSub((prev) => ({
      ...prev,
      [catId]: prev[catId] === subId ? null : subId,
    }));
  };

  // Nueva función para toggle de categorías
  const handleToggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) // Replegar si ya está expandida
        : [...prev, catId] // Expandir si está replegada
    );
  };

  // Agrega productos de cualquier categoría expandida
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
    CATEGORIES_EXTENDED.forEach((cat) =>
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

  // Obtener productos en el carrito con detalles
  const getCartItems = () => {
    const items: Array<{ product: Product; quantity: number }> = [];
    Object.entries(cart).forEach(([prodId, qty]) => {
      if (qty > 0) {
        const product = CATEGORIES_EXTENDED.flatMap(cat => 
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
          price: product.price
        })),
        total: accumulated
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
            price: product.price
          })),
          total: accumulated
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

  return (
    <>
      <Header />
      <main className="pt-16 pb-32 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <section className="container mx-auto px-4 py-8">
          {/* Encabezado */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ¡Completa tu Lista Escolar!
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="font-bold text-primary">Paso a paso:</span> Selecciona productos, toca
              <Eye className="inline w-5 h-5 mx-1 text-primary" />
              para ver detalles y presiona
              <span className="inline-block mx-1 px-3 py-1 bg-primary text-white rounded-full text-sm font-bold">
                Siguiente
              </span>
              para avanzar.
            </p>
          </div>

          {/* ===== NUEVO: Autenticación replegable (antes del formulario) ===== */}
          <div className="mb-6 max-w-4xl mx-auto flex justify-center">
            <div 
              onClick={() => authCollapsed && setAuthCollapsed(false)}
              className={`bg-white shadow-2xl border border-gray-100 transition-all duration-500 overflow-hidden ${
                authCollapsed 
                  ? 'w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary/5 ring-2 ring-primary/20' 
                  : 'w-full rounded-3xl'
              }`}
            >
              {authCollapsed ? (
                <div className="relative">
                  <User className="w-7 h-7 text-primary" />
                  {firebaseUser && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
              ) : (
                <>
                  <div className="p-6 lg:p-8 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-black text-gray-900">
                        {firebaseUser ? 'Sesión iniciada' : 'Inicia sesión'}
                      </h2>
                      <p className="text-gray-600 mt-1 text-sm">
                        {firebaseUser?.email || 'Para guardar tus datos'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAuthCollapsed(true); }}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                    {!firebaseUser ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <GoogleLoginButton className="w-full" text="Google" />
                        <button
                          type="button"
                          onClick={() => router.push('/login')}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-black text-sm"
                        >
                          Email
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Cerrar sesión
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* ===== FIN auth ===== */}

          {/* ===== Formulario (al principio) replegable si ya hay datos ===== */}
          <div className="mb-12 max-w-4xl mx-auto flex justify-center">
            <div 
              onClick={() => profileCollapsed && setProfileCollapsed(false)}
              className={`bg-white shadow-2xl border border-gray-100 transition-all duration-500 overflow-hidden ${
                profileCollapsed 
                  ? 'w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary/5 ring-2 ring-primary/20' 
                  : 'w-full rounded-3xl'
              }`}
            >
              {profileCollapsed ? (
                <div className="relative">
                  <ClipboardList className="w-7 h-7 text-primary" />
                  {profileForm.name && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-6 lg:p-8 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Tus datos</h2>
                      <p className="text-gray-600 text-sm">Información para el pedido</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProfileCollapsed(true); }}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Email (solo lectura)
                        </label>
                        <input
                          value={firebaseUser?.email ?? ''}
                          readOnly
                          className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                          placeholder="Inicia sesión para ver tu email"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Nombre
                        </label>
                        <input
                          value={profileForm.name}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, name: ev.target.value }))}
                          type="text"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Teléfono
                        </label>
                        <input
                          value={profileForm.phone}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, phone: ev.target.value }))}
                          type="tel"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="3001234567"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Ciudad
                        </label>
                        <input
                          value={profileForm.city}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, city: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Bogotá"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Departamento/Estado
                        </label>
                        <input
                          value={profileForm.state}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, state: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Cundinamarca"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Código postal
                        </label>
                        <input
                          value={profileForm.zipCode}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, zipCode: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="110121"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                          Dirección
                        </label>
                        <input
                          value={profileForm.street}
                          onChange={(ev) => setProfileForm((p) => ({ ...p, street: ev.target.value }))}
                          type="text"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Calle / Carrera / Apt..."
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={profileStatus.type === 'saving' || !firebaseUser?.email}
                        className="w-full bg-primary text-white py-3 rounded-xl font-black shadow-lg disabled:opacity-50"
                      >
                        {profileStatus.type === 'saving' ? 'GUARDANDO...' : 'GUARDAR DATOS'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
          {/* ===== FIN formulario ===== */}

          <div className="flex flex-col gap-8">
            {CATEGORIES_EXTENDED.map((cat: Category, catIdx: number) => {
              const isExpanded = expandedCategories.includes(cat.id);
              const allProducts = cat.id === 'cuadernos' 
                ? cat.subcategories.flatMap(s => s.products) 
                : cat.subcategories.find(s => s.id === openSub[cat.id])?.products || [];

              return (
                <div
                  key={cat.id}
                  className={`rounded-3xl overflow-hidden shadow-2xl bg-white transition-all duration-500 ring-2 ${
                    isExpanded 
                      ? 'ring-primary hover:ring-primary/80' 
                      : 'ring-gray-200 hover:ring-primary/40'
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
                    <div className="w-full lg:w-[72%] xl:w-[77%] p-4 lg:p-6 xl:p-8 flex flex-col bg-gray-50 animate-in slide-in-from-bottom duration-300">
                      {/* Botón para contraer (móvil) */}
                      <div className="flex justify-between items-center mb-4 lg:hidden">
                        <h3 className="text-lg font-black text-gray-900">Productos</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCategory(cat.id);
                          }}
                          className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300 transition"
                        >
                          Contraer ▲
                        </button>
                      </div>

                      {/* Selector de Subcategorías */}
                      {cat.id !== 'cuadernos' && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {cat.subcategories.map((sub: Subcategory) => (
                            <button
                              key={sub.id}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                openSub[cat.id] === sub.id 
                                  ? 'bg-primary text-white scale-105 shadow-lg' 
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                              onClick={() => setOpenSub(prev => ({ 
                                ...prev, 
                                [cat.id]: prev[cat.id] === sub.id ? null : sub.id 
                              }))}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Grid de productos */}
                      <div 
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 lg:gap-3 pr-2 ${
                          allProducts.length > 10 
                            ? 'max-h-[600px] lg:max-h-[750px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-200' 
                            : ''
                        }`}
                      >
                        {allProducts.map((prod: Product) => {
                          const qty = cart[prod.id] || 0;
                          return (
                            <div 
                              key={prod.id} 
                              className="relative group bg-white rounded-lg lg:rounded-xl p-2 hover:shadow-xl transition-all border border-gray-100 hover:border-primary/40 hover:scale-[1.03]"
                            >
                              {/* Imagen MÁS COMPACTA */}
                              <div className="aspect-[4/5] rounded-md lg:rounded-lg overflow-hidden mb-2 relative">
                                <img 
                                  src={prod.image} 
                                  alt={prod.name} 
                                  className="w-full h-full object-cover" 
                                />
                                {qty > 0 && (
                                  <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center text-[10px] lg:text-xs font-black shadow-lg ring-2 ring-white">
                                    {qty}
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => setQuickviewProduct(prod)}
                                  className="absolute bottom-1 right-1 bg-white/95 hover:bg-white p-1 lg:p-1.5 rounded-md shadow-md transition-all lg:opacity-0 lg:group-hover:opacity-100"
                                  aria-label="Vista rápida"
                                >
                                  <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight h-6 lg:h-7">
                                  {prod.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-primary font-black text-xs lg:text-sm">
                                    ${(prod.price / 1000).toFixed(0)}K
                                  </span>
                                  <span className="text-gray-400 text-[8px] lg:text-[9px] line-through">
                                    ${((prod.price * 1.2) / 1000).toFixed(0)}K
                                  </span>
                                </div>
                                
                                {/* Controles ULTRA COMPACTOS */}
                                <div className="flex items-center gap-1">
                                  <button 
                                    className="flex-1 py-1 lg:py-1.5 rounded-md bg-gray-100 hover:bg-red-50 text-gray-700 font-bold text-[10px] lg:text-xs transition disabled:opacity-30"
                                    onClick={() => handleRemoveFromCart(prod)}
                                    disabled={qty === 0}
                                  >
                                    −
                                  </button>
                                  <span className="font-black text-xs lg:text-sm min-w-[18px] lg:min-w-[20px] text-center">{qty}</span>
                                  <button 
                                    className="flex-1 py-1 lg:py-1.5 rounded-md bg-primary hover:bg-primary/90 text-white font-bold text-[10px] lg:text-xs transition shadow-sm hover:shadow-md"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="relative z-10 text-center p-6 md:p-12 w-full text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-2xl uppercase tracking-tight">
                ¡Finaliza tu Lista!
              </h2>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-10 inline-block border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="text-center md:text-left">
                    <p className="text-white/70 uppercase tracking-widest text-xs font-bold mb-1">
                      Productos
                    </p>
                    <p className="text-3xl font-black">{totalItems} items</p>
                  </div>
                  
                  <div className="w-px h-12 bg-white/20 hidden md:block" />
                  
                  <div className="text-center md:text-left">
                    <p className="text-white/70 uppercase tracking-widest text-xs font-bold mb-1">
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
                    className="group bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleWhatsAppCheckout}
                    disabled={!firebaseUser || totalItems === 0}
                  >
                    <MessageCircle className="w-6 h-6 fill-current" />
                    <span className="hidden sm:inline">FINALIZAR POR</span>
                    <span className="font-black">WHATSAPP</span>
                  </button>
                  
                  <button 
                    className="group bg-[#FF3D00] hover:bg-[#E63600] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleBoldPayment}
                    disabled={!firebaseUser || totalItems === 0 || isProcessingPayment}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="hidden sm:inline">PAGAR CON</span>
                    <span className="font-black">{isProcessingPayment ? 'PROCESANDO...' : 'BOLD'}</span>
                  </button>
                  
                  <button 
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50"
                    onClick={handleEmailQuote}
                    disabled={!firebaseUser || totalItems === 0 || isProcessingPayment}
                  >
                    <Mail className="w-6 h-6" />
                    <span className="hidden sm:inline">ENVIAR</span>
                    <span className="font-black">COTIZACIÓN</span>
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-6">
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
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">
                Vista Rápida
              </span>
              <button
                onClick={() => setQuickviewProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 lg:flex lg:gap-6">
              <div className="lg:w-1/2 mb-6 lg:mb-0">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden ring-2 ring-primary/20">
                  <img 
                    src={quickviewProduct.image} 
                    alt={quickviewProduct.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-2">
                      {quickviewProduct.name}
                    </h2>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-gray-400 line-through text-lg">
                        ${(quickviewProduct.price * 1.2).toLocaleString()}
                      </span>
                      <span className="text-primary font-black text-4xl">
                        ${quickviewProduct.price.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        -20%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Características</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        Producto de alta calidad para uso escolar
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        Material resistente y duradero
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        Disponible para entrega inmediata
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-bold">En stock - Entrega rápida</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-600">Cantidad:</span>
                    <div className="flex items-center gap-3">
                      <button 
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-red-50 font-bold text-lg transition"
                        onClick={() => handleRemoveFromCart(quickviewProduct)}
                        disabled={(cart[quickviewProduct.id] || 0) === 0}
                      >
                        −
                      </button>
                      <span className="font-black text-2xl min-w-[40px] text-center">
                        {cart[quickviewProduct.id] || 0}
                      </span>
                      <button 
                        className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-lg transition shadow-md"
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
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
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
          <div className="mb-3 bg-white rounded-2xl shadow-2xl border-2 border-primary/20 max-h-[400px] overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-3 flex items-center justify-between">
              <span className="font-black text-sm uppercase tracking-wider">Detalle de tu pedido</span>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 p-4 space-y-3">
              {getCartItems().map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 hover:bg-gray-100 transition group">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-14 h-14 object-cover rounded-lg ring-1 ring-gray-200" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-black text-sm">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[8px] lg:text-[9px] line-through">
                        ${((product.price * 1.2) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-gray-900 font-black text-sm">
                      ${(product.price * quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        // Eliminar completamente del carrito
                        setCart(prev => {
                          const newCart = { ...prev };
                          delete newCart[product.id];
                          recalculateAccumulated(newCart);
                          return newCart;
                        });
                      }}
                      className="text-red-500 hover:text-red-700 transition opacity-0 group-hover:opacity-100"
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
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 lg:p-5 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-primary/30 backdrop-blur-md cursor-pointer hover:scale-[1.02] transition-transform">
          <div className="flex flex-col">
            <span className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">
              Tu Pedido {showCartDetail && '👇'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-xl lg:text-2xl">{totalItems}</span>
              <span className="text-xs lg:text-sm text-gray-400">productos</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">
              Total Acumulado
            </span>
            <p className="font-black text-xl lg:text-2xl text-primary">{formattedTotal}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
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