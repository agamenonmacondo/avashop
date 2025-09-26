export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  details?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt?: Date | string;
  slug?: string; // Asegúrate de que esta propiedad existe
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string; // Added phone to User type
  avatar?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string; // For Colombia, this would be "Departamento"
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';


export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number; // Prices in COP
  status: OrderStatus;
  orderDate: string; // ISO string date
  shippingAddress: Address;
  trackingNumber?: string;
}
