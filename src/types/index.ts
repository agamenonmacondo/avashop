export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: Category;
  subcategory?: Category;
  slug: string;
  stock: number;
  featured: boolean;    // ✅ Obligatorio
  active: boolean;      // ✅ Obligatorio
  rating?: number;
  reviewsCount?: number;
  createdAt: Date | string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
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
  country: string;
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
