import type { Product, Category, Order, User } from '@/types';

// Updated categories based on the full product list
export const iphoneCategory: Category = { id: '1', name: 'iPhones', slug: 'iphones' };
export const macbookCategory: Category = { id: '5', name: 'MacBooks', slug: 'macbooks' };
export const accesoriosCategory: Category = { id: '3', name: 'Accesorios', slug: 'accesorios' };
export const appleWatchCategory: Category = { id: '6', name: 'Apple Watch', slug: 'apple-watch' };

export const categories: Category[] = [
  iphoneCategory,
  macbookCategory,
  accesoriosCategory,
  appleWatchCategory,
];

const now = new Date();

export const products: Product[] = [
  {
    id: 'iphone-16-pro-max-256-es',
    name: 'iPhone 16 Pro Max 256GB ES (Nuevo)',
    description: 'Experimenta el pináculo de la innovación con el iPhone 16 Pro Max. Con Dynamic Island, pantalla ProMotion siempre activa, el potente chip A18 Pro y un revolucionario sistema de cámaras Pro Fusion.',
    price: 4450000,
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
    id: 'iphone-15-128gb-sf-nuevo-list',
    name: 'iPhone 15 128GB SF (Nuevo)',
    description: 'Un excelente iPhone 15 con 128GB de almacenamiento, sellado de fábrica. Condición: Nuevo.',
    price: 2790000,
  // prefer hero + color shot
  imageUrls: ['/images/iphone 15/iphone_15_hero.png', '/images/iphone 15/IPhone-15-Pink.png'],
    category: iphoneCategory, stock: 20, rating: 4.7, reviewsCount: 100,
    details: { Condición: 'Nuevo', Almacenamiento: '128GB', Variante: 'SF (Sellado Fábrica)' }, createdAt: now, updatedAt: now,
  },
  {
    id: 'iphone-15-256gb-sf-nuevo-list',
    name: 'iPhone 15 256GB SF (Nuevo)',
    description: 'Un excelente iPhone 15 con 256GB de almacenamiento, sellado de fábrica. Condición: Nuevo.',
    price: 3300000,
  imageUrls: ['/images/iphone 15/iphone_15_hero.png'],
    category: iphoneCategory, stock: 22, rating: 4.7, reviewsCount: 110,
    details: { Condición: 'Nuevo', Almacenamiento: '256GB', Variante: 'SF (Sellado Fábrica)' }, createdAt: now, updatedAt: now,
  },

  {
    id: 'iphone-16-pro-max-256-sf-nuevo-list', 
    name: 'iPhone 16 Pro Max 256GB SF (Nuevo)',
    description: 'El impresionante iPhone 16 Pro Max con 256GB, sellado de fábrica. Condición: Nuevo.',
    price: 4990000,
  imageUrls: ['/images/iphone_16_promax/121032-iphone-16-pro-max.png', '/images/iphone_16_promax/iphone-16-pro-max-desert-titanium-pdp-image-position-2-en-ww.png'],
    category: iphoneCategory, stock: 12, rating: 4.9, reviewsCount: 95,
    details: { Condición: 'Nuevo', Almacenamiento: '256GB', Variante: 'SF (Sellado Fábrica)' }, createdAt: now, updatedAt: now,
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
    id: 'iphone-13promax-128gb-usado-list',
    name: 'iPhone 13 Pro Max 128GB (Usado)',
    description: 'iPhone 13 Pro Max con 128GB de almacenamiento. Condición: Usado, Garantía 3 meses.',
    price: 1990000,
  imageUrls: ['/images/iphone 13 promax/02-iphone-13-pro-max-128gb-plateado-side.png', '/images/iphone 13 promax/111870_iphone13-pro-max-colors-480.png'],
    category: iphoneCategory, stock: 5, rating: 4.4, reviewsCount: 60,
    details: { Condición: 'Usado', Almacenamiento: '128GB', Garantía: '3 meses' }, createdAt: now, updatedAt: now,
  },
  {
    id: 'iphone-15plus-128gb-usado-list',
    name: 'iPhone 15 Plus 128GB (Usado)',
    description: 'iPhone 15 Plus con 128GB de almacenamiento. Condición: Usado, Garantía 3 meses.',
    price: 2550000,
  imageUrls: ['/images/iphone 15/iphone_15_hero.png', '/images/iphone 15/IPhone-15-Pink.png'],
    category: iphoneCategory, stock: 7, rating: 4.5, reviewsCount: 40,
    details: { Condición: 'Usado', Almacenamiento: '128GB', Garantía: '3 meses' }, createdAt: now, updatedAt: now,
  },
  {
    id: 'iphone-15pro-256gb-usado-list',
    name: 'iPhone 15 Pro 256GB (Usado)',
    description: 'iPhone 15 Pro con 256GB de almacenamiento. Condición: Usado, Garantía 3 meses.',
    price: 2800000,
  imageUrls: ['/images/iphone 15/iphone_15_hero.png', '/images/iphone 15/IPhone-15-Pink.png'],
    category: iphoneCategory, stock: 6, rating: 4.6, reviewsCount: 55,
    details: { Condición: 'Usado', Almacenamiento: '256GB', Garantía: '3 meses' }, createdAt: now, updatedAt: now,
  },
  {
    id: 'iphone-15promax-256gb-es-usado-list',
    name: 'iPhone 15 Pro Max 256GB ES (Usado)',
    description: 'iPhone 15 Pro Max con 256GB, variante ES. Condición: Usado, Garantía 3 meses.',
    price: 3340000,
  imageUrls: ['/images/iphone 15/iphone_15_hero.png', '/images/iphone 15/IPhone-15-Pink.png'],
    category: iphoneCategory, stock: 4, rating: 4.6, reviewsCount: 45,
    details: { Condición: 'Usado', Almacenamiento: '256GB', Variante: 'ES', Garantía: '3 meses' }, 
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
