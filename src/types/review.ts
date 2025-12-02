export interface Review {
  id: number;
  order_id: number;
  product_id: string;
  user_id: string | null;
  user_email: string;
  rating: number; // 1-5
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

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