export type ReviewPayload = {
  product_id: string;
  user_email: string;
  rating: number; // 1..5
  comment?: string;
  order_id?: string | null;
  photo_url?: string | null;
};

export async function submitReview(payload: ReviewPayload) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error submitting review');
  return data;
}

export type ReviewRequestPayload = {
  orderId: string;
  userEmail: string;
  customerName?: string;
  products?: { id: string; name?: string }[];
};

export async function requestReviewEmail(payload: ReviewRequestPayload) {
  const res = await fetch('/api/reviews/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error requesting review email');
  return data;
}