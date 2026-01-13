export interface Review {
  id: string;
  product_id: string;
  order_id?: string;
  user_email: string;
  user_name?: string;
  rating: number;
  comment: string;
  photo_url?: string;      // ✅ Agregar esta propiedad
  is_verified?: boolean;   // ✅ Agregar esta propiedad
  created_at: string;
  updated_at?: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

// ✅ Cambiar Record<number, number> a distribución específica
export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}