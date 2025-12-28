export interface ProductDetails {
  pagina?: number;
  categoria_original?: string;
  color_principal?: string;
  precio_original?: number;
  url_producto?: string;
  marca?: string;
  material?: string;
  dimensiones?: string;
  peso?: string;
  garantia?: string;
  [key: string]: any; // Para cualquier otro campo adicional
}

export interface Review {
  author: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: Category;
  subcategory?: Category;
  slug?: string;           // ✅ Ahora es opcional
  stock: number;
  featured?: boolean;      // ✅ Ahora es opcional
  active?: boolean;        // ✅ Ahora es opcional
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[]; // ✅ Nuevo: array de reseñas individuales
  priceValidUntil?: string; // ✅ Nuevo: fecha de validez del precio (YYYY-MM-DD)
  details?: ProductDetails;
  createdAt?: Date | string;   // ✅ Acepta Date o string
  updatedAt?: Date | string;   // ✅ Acepta Date o string
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  googleTaxonomy?: string; 
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  shippingAddress: Address;
  trackingNumber?: string;
}
