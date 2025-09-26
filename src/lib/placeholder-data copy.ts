import type { Product, Category, Order, User } from '@/types';

// Updated categories based on the full product list
export const iphoneCategory: Category = { id: '1', name: 'iPhones', slug: 'iphones' };
export const macbookCategory: Category = { id: '5', name: 'MacBooks', slug: 'macbooks' };
export const accesoriosCategory: Category = { id: '3', name: 'Accesorios', slug: 'accesorios' };
export const appleWatchCategory: Category = { id: '6', name: 'Apple Watch', slug: 'apple-watch' };
export const otrosCelularesCategory: Category = { id: '10', name: 'Otros Celulares', slug: 'otros-celulares' };

export const categories: Category[] = [
  iphoneCategory,
  macbookCategory,
  accesoriosCategory,
  appleWatchCategory,
  otrosCelularesCategory, // <-- agrega aquí la nueva categoría
];

const now = new Date();

export const products: Product[] = [
  {
    id: 'iphone-16-pro-max-256-es',
    name: 'iPhone 16 Pro Max 256GB ES (Nuevo)',
    description: 'Experimenta el pináculo de la innovación con el iPhone 16 Pro Max. Con Dynamic Island, pantalla ProMotion siempre activa, el potente chip A18 Pro y un revolucionario sistema de cámaras Pro Fusion.',
    price: 4650000,
    imageUrls: ['/images/iphone_16_promax/121032-iphone-16-pro-max.png', '/images/iphone_16_promax/Celular-Apple-iPhone-16-PRO---PRO-MAX-Desert-Titanium-2.png', '/images/iphone_16_promax/iphone-16-pro-max-desert-titanium-pdp-image-position-2-en-ww.png'],
    category: iphoneCategory,
    stock: 20,
    rating: 4.9,
    reviewsCount: 150,
    details: {
      Pantalla: 'Super Retina XDR OLED 6,9", ProMotion 120Hz',
      Chip: 'A18 Pro con Neural Engine de 16 núcleos',
      'Camara Principal': 'Pro Fusion 48MP + Ultra Gran Angular 48MP + Teleobjetivo 5x 12MP',
      Condición: 'Nuevo',
    },
    createdAt: now,
    updatedAt: now,
  },
   {
    id: 'iphone-13-128gb-usado-list',
    name: 'iPhone 13 128GB (Usado)',
    description: 'iPhone 13 con 128GB de almacenamiento. Condición: Usado, Garantía 3 meses.',
    price: 1260000,
  imageUrls: ['/images/iphone_13/iphone-13-pink-select-2021-1.png', '/images/iphone_13/iPhone-13-PNG-Pic.png'],
    category: iphoneCategory, stock: 8, rating: 4.2, reviewsCount: 50,
    details: { Condición: 'Usado', Almacenamiento: '128GB', Garantía: '3 meses' }, createdAt: now, updatedAt: now,
  },
  {
  id: 'iphone-15promax-256gb-es-cpo',
  name: 'iPhone 15 Pro Max 256GB ES (CPO)',
  description:
    'iPhone 15 Pro Max Certified Pre-Owned (CPO) con 256GB de almacenamiento. Pantalla Super Retina XDR OLED de 6.7", Dynamic Island, pantalla siempre activa, chip A17 Pro, triple cámara de 48MP, Face ID, batería de larga duración y resistencia IP68. Garantía y calidad Apple directa.',
  price: 3790000,
  imageUrls: [
    '/images/15_promax/15_promax_1.png',
    '/images/15_promax/15pormax.png'
  ],
  category: iphoneCategory,
  stock: 4,
  rating: 4.6,
  reviewsCount: 45,
  details: {
    Pantalla: '6.7" Super Retina XDR OLED, 2796x1290px, ProMotion 120Hz, Dynamic Island, siempre activa, 2000 nits',
    Procesador: 'Apple A17 Pro (3 nm), Hexa-core, GPU 6 núcleos',
    RAM: '8GB',
    Almacenamiento: '256GB',
    Cámaras: 'Principal: 48MP OIS, Ultra gran angular: 12MP, Teleobjetivo: 12MP 5x, Frontal: 12MP AF',
    Video: '4K a 24/25/30/60 fps',
    Batería: '4422 mAh, carga rápida 50% en 30min (20W+), MagSafe/Qi2 15W',
    Conectividad: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C',
    Sensores: 'Face ID, LiDAR, barómetro, giroscopio, acelerómetro',
    Materiales: 'Titanio',
    Dimensiones: '159,9 x 76,7 x 8,25 mm',
    Peso: '221g',
    Resistencia: 'IP68 polvo y agua',
    Condición: 'CPO (Certified Pre-Owned)',
    Garantía: '12 meses'
  },
  createdAt: now,
  updatedAt: now,
  },
  {
    id: 'iphone-14-pro-max-128gb-cpo',
    name: 'iPhone 14 Pro Max 128GB CPO',
    description:
      'iPhone 14 Pro Max Certified Pre-Owned (CPO) con 128GB de almacenamiento. Pantalla Super Retina XDR de 6.7", chip A16 Bionic, triple cámara de 48MP, Face ID y batería de larga duración. Garantía y calidad Apple directa.',
    price: 2900000,
    imageUrls: [
      '/images/14_promax/14_promax.png',
      '/images/14_promax/14promax.png'
    ],
    category: iphoneCategory,
    stock: 5,
    rating: 4.7,
    reviewsCount: 0,
    details: {
      Pantalla: '6.7" Super Retina XDR OLED, 120Hz',
      Procesador: 'A16 Bionic',
      Almacenamiento: '128GB',
      Cámaras: 'Triple 48MP + 12MP + 12MP',
      CámaraFrontal: '12MP TrueDepth',
      FaceID: 'Sí',
      Batería: 'Hasta 29 horas de reproducción de video',
      Resistencia: 'IP68 agua y polvo',
      Condición: 'CPO (Certified Pre-Owned)',
      Garantía: '12 meses'
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'iphone-14-plus-128gb-cpo',
    name: 'iPhone 14 Plus 128GB CPO',
    description:
      'iPhone 14 Plus Certified Pre-Owned (CPO) con 128GB de almacenamiento. Pantalla Super Retina XDR de 6.7 pulgadas, chip A15 Bionic, sistema de doble cámara de 12MP, Face ID, batería de larga duración y resistencia IP68. Garantía y calidad Apple directa.',
    price: 2320000,
    imageUrls: [
      '/images/14_plus/14plus.png',
      '/images/14_plus/iphone-14plus.png'
    ],
    category: iphoneCategory,
    stock: 5,
    rating: 4.7,
    reviewsCount: 0,
    details: {
      Pantalla: 'Super Retina XDR 6.7", 2778 x 1284 px, 458 ppi, True Tone, P3, hasta 1200 nits HDR',
      Procesador: 'A15 Bionic, GPU 5 núcleos, CPU 6 núcleos, Neural Engine 16 núcleos',
      Almacenamiento: '128GB',
      Cámaras: 'Principal 12MP ƒ/1.5, Ultra gran angular 12MP ƒ/2.4 120°, Frontal 12MP ƒ/1.9 TrueDepth',
      Video: 'Modo Cine (1080p 30fps), Modo Acción, 4K hasta 60fps',
      Batería: 'Hasta 26h video, 20h streaming, 100h audio, carga rápida 50% en 30min (20W+)',
      Conectividad: '5G',
      Resistencia: 'IP68 agua y polvo',
      Detección: 'Detección de accidentes',
      FaceID: 'Sí',
      Condición: 'CPO (Certified Pre-Owned)',
      Garantía: '3 meses'
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'note-14-pro-256gb-5g',
    name: 'NOTE 14 PRO 256GB 5G',
    description:
      'Este dispositivo de gama media-alta se distingue por una combinación de características de calidad y un precio competitivo. El procesador es un MediaTek Dimensity 7300-Ultra, fabricado en un proceso de 4nm, que ofrece un rendimiento equilibrado y una conectividad 5G robusta. La memoria y el almacenamiento incluyen opciones de 8GB y 12GB de RAM, con 256GB o 512GB de almacenamiento UFS 2.2. La batería de 5110 mAh soporta una carga turbo de 45W. La pantalla es otro punto fuerte, una CrystalRes AMOLED de 6.67 pulgadas con una resolución de 1.5K (2712 x 1220 píxeles) y una tasa de refresco de 120Hz. Con un brillo máximo de 3000 nits, está protegida por Corning® Gorilla® Glass Victus® 2. Esta durabilidad es poco común en su segmento de precio. En cuanto a las cámaras, el sistema trasero se compone de un sensor principal de 200MP con OIS, un ultra gran angular de 8MP y una cámara macro de 2MP. La cámara frontal es de 20MP. El teléfono tiene una clasificación IP68 de resistencia al polvo y al agua.',
    price: 820000,
    imageUrls: [
      '/images/note_14_pro5g/note_14_pro_png.png',
      '/images/note_14_pro5g/note_14_pro_5g.png'
    ], // Cambia la ruta si tienes otra imagen
    category: otrosCelularesCategory,
    stock: 10,
    rating: 4.5,
    reviewsCount: 0,
    details: {
      Procesador: 'MediaTek Dimensity 7300-Ultra (4nm)',
      RAM: '8GB/12GB',
      Almacenamiento: '256GB UFS 2.2',
      Batería: '5110 mAh, carga turbo 45W',
      Pantalla: '6.67" CrystalRes AMOLED, 1.5K, 120Hz, 3000 nits',
      Protección: 'Corning® Gorilla® Glass Victus® 2',
      Cámaras: 'Trasera: 200MP+8MP+2MP, Frontal: 20MP',
      Resistencia: 'IP68 polvo y agua',
      Condición: 'Nuevo',
      Conectividad: '5G',
    },
    createdAt: now,
    updatedAt: now,
  },
  {
  id: 'redmi-15-256gb-8ram',
  name: 'REDMI 15 256GB 8RAM',
  description:
    'Este smartphone de gama media se distingue por una batería masiva y una pantalla de alta calidad. El dispositivo está impulsado por un procesador Qualcomm Snapdragon 6s Gen 3 de ocho núcleos a 2.3 GHz. Incluye 8GB de RAM y 256GB de almacenamiento. La característica más sobresaliente es su batería de 7000 mAh, compatible con carga rápida de 33W. La pantalla es de 6.9 pulgadas con resolución Full HD+ (2340 x 1080) y una tasa de refresco de 144Hz, lo que proporciona una experiencia visual fluida. La cámara dual trasera de 50MP y la cámara frontal de 8MP permiten capturar imágenes de alta calidad. El dispositivo cuenta con una clasificación IP64 de resistencia al polvo y al agua.',
  price: 600000,
  imageUrls: [
    '/images/REDMI_15/REDMI_15.png',
    '/images/REDMI_15/RED_MI_FRONTAL.png'
  ],
  category: otrosCelularesCategory,
  stock: 10,
  rating: 4.4,
  reviewsCount: 0,
  details: {
    Procesador: 'Qualcomm Snapdragon 6s Gen 3, 8 núcleos, 2.3 GHz',
    RAM: '8GB',
    Almacenamiento: '256GB',
    Batería: '7000 mAh, carga rápida 33W',
    Pantalla: '6.9" Full HD+ (2340 x 1080), 144Hz',
    Cámaras: 'Trasera: Dual 50MP, Frontal: 8MP',
    Resistencia: 'IP64 polvo y agua',
    Condición: 'Nuevo',
    Marca: 'Xiaomi',
    Modelo: 'Redmi 15'
  },
  createdAt: now,
  updatedAt: now,
},
{
  id: 'iphone-16-pro-256gb-esim',
  name: 'iPhone 16 Pro 256GB eSIM',
  description:
    'iPhone 16 Pro con 256GB de almacenamiento y eSIM. Acabado en titanio negro, blanco, natural o desierto. Pantalla Super Retina XDR OLED de 6.3" con Dynamic Island, ProMotion hasta 120 Hz y brillo máximo de 2,000 nits. Chip A18 Pro, triple cámara trasera de 48MP+48MP+12MP, cámara frontal de 12MP, grabación 4K hasta 60 fps, video ProRes y espacial. Conectividad 5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C y batería de 3582 mAh con carga rápida e inalámbrica.',
  price: 4250000,
  imageUrls: [
    '/images/iphone 16 pro/16pro.png',
    '/images/iphone 16 pro/iphone-16pro.png'
  ],
  category: iphoneCategory,
  stock: 5,
  rating: 4.9,
  reviewsCount: 0,
  details: {
    Acabado: 'Titanio negro, titanio blanco, titanio natural, titanio del desierto',
    Pantalla: 'Super Retina XDR OLED 6.3", Dynamic Island, ProMotion 120Hz, 2000 nits',
    Procesador: 'Apple A18 Pro, 6 núcleos CPU, 6 núcleos GPU',
    RAM: '8GB',
    Almacenamiento: '256GB',
    Cámaras: 'Principal: 48MP, Ultra gran angular: 48MP, Teleobjetivo: 12MP 5x',
    CámaraFrontal: '12MP',
    Video: '4K hasta 60fps, ProRes, video/audio espacial 3D',
    Conectividad: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C, banda ultraancha 2da gen',
    Batería: '13.94 Wh (3582 mAh), carga rápida e inalámbrica',
    Condición: 'Nuevo',
  },
  createdAt: now,
  updatedAt: now,
},
{
  id: 'iphone-16-128gb-chip',
  name: 'iPhone 16 128GB CHIP',
  description:
    'iPhone 16 con 128GB de almacenamiento. Diseño de aluminio con parte posterior de vidrio con infusión de color. Pantalla Super Retina XDR OLED de 6.1 pulgadas con Dynamic Island, resolución de 2556 x 1179 píxeles y brillo máximo de 2,000 nits. Resistencia IP68. Chip Apple A18, doble cámara trasera de 48MP + 12MP, cámara frontal de 12MP, batería de 3,561 mAh y conectividad 5G.',
  price: 3050000,
  imageUrls: [
    '/images/iphone16/iphone-16-plus-colors.png',
    '/images/iphone16/images.png'
  ],
  category: iphoneCategory,
  stock: 5,
  rating: 4.8,
  reviewsCount: 0,
  details: {
    Acabado: 'Aluminio con vidrio de infusión de color',
    Colores: 'Negro, blanco, rosa, verde azulado, ultramarino',
    Pantalla: 'Super Retina XDR OLED 6.1", Dynamic Island, 2556 x 1179 px, 2000 nits',
    Resistencia: 'IP68 (agua y polvo)',
    Procesador: 'Apple A18, CPU 6 núcleos (2 rendimiento, 4 eficiencia), GPU 5 núcleos',
    RAM: 'No especificado',
    Almacenamiento: '128GB',
    SO: 'iOS 18',
    Cámaras: 'Trasera: 48MP principal + 12MP ultra gran angular',
    ZoomÓptico: '2x acercamiento, 2x alejamiento',
    ZoomDigital: 'Hasta 10x',
    CámaraFrontal: '12MP',
    Video: '4K a 24/25/30/60 fps',
    Conectividad: '5G, Wi-Fi 7, Bluetooth 5.3, banda ultraancha 2da gen',
    Puerto: 'USB-C (USB 2.0)',
    Batería: '3,561 mAh, carga rápida e inalámbrica (MagSafe y Qi2)',
    Condición: 'Nuevo'
  },
  createdAt: now,
  updatedAt: now,
},
{
  id: 'samsung-s25-ultra-512gb',
  name: 'Samsung S25 Ultra 512GB',
  description:
    'Samsung S25 Ultra con 512GB de almacenamiento y 12GB de RAM. Pantalla Dynamic AMOLED de 6.9", procesador Snapdragon 8 Elite para Galaxy, cámara principal de 200MP, batería de 5000 mAh, S Pen incluido y protección IP68. Android 15 con One UI 7 y 7 años de actualizaciones.',
  price: 3900000,
  imageUrls: [
    '/images/s25ultra/s25.png'
  ],
  category: otrosCelularesCategory,
  stock: 5,
  rating: 4.8,
  reviewsCount: 0,
  details: {
    Procesador: 'Qualcomm Snapdragon 8 Elite para Galaxy (3 nm), octa-core',
    Pantalla: '6.9" Dynamic AMOLED, 3120x1440 px, 120Hz, 2600 nits',
    RAM: '12GB',
    Almacenamiento: '512GB',
    Cámaras: 'Principal: 200MP OIS, Ultra gran angular: 50MP, Teleobjetivo 3x: 10MP OIS, Teleobjetivo periscopio 5x: 50MP OIS',
    Batería: '5000 mAh',
    SO: 'Android 15 con One UI 7',
    Actualizaciones: '7 años de sistema y seguridad',
    Diseño: 'Marco de titanio, Gorilla Glass Armor 2',
    Resistencia: 'IP68 agua y polvo',
    S_Pen: 'Incluido',
    Huella: 'Lector ultrasónico en pantalla',
    IA: 'Capacidades de IA mejoradas'
  },
  createdAt: now,
  updatedAt: now,
},
];

export const mockUser: User = {
  id: 'user123',
  name: 'Ana Pérez',
  email: 'ana.perez@example.com',
  phone: '3001234567',
  avatar: 'https://placehold.co/100x100.png',
  addresses: [
    { id: 'addr1', street: 'Carrera 7 # 70-30', city: 'Bogotá D.C.', state: 'Cundinamarca', zipCode: '110231', country: 'Colombia', isDefault: true },
  ],
};

export const mockOrders: Order[] = [
  {
    id: 'order001',
    userId: 'user123',
    items: [], 
    totalAmount: 0, 
    status: 'Entregado',
    orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: mockUser.addresses![0],
    trackingNumber: 'CO999AA10123456789',
  },
];

export function getProductById(id: string): Product | undefined {
  const product = products.find(p => p.id === id);
  return product;
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return products.filter(p => p.category.id === category.id);
}
