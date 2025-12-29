export interface Review {
  id: string;
  author?: string;
  datePublished?: string;
  reviewBody?: string;
  ratingValue?: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number; }; // requerido, objeto con claves 1-5
}

export interface CreateReviewInput {
  order_id: number;
  product_id: string;
  rating: number;
  comment: string;
  token: string;
}

export interface ReviewRequest {
  id: number;
  order_id: number;
  user_email: string;
  token: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}