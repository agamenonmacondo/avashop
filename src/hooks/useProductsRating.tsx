'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

interface ProductRating {
  productId: string;
  averageRating: number;
  reviewsCount: number;
}

export function useProductRating(productId: string) {
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRating() {
      const supabase = getSupabase();
      
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', productId);

        if (error) {
          console.error('Error fetching rating:', error);
          setLoading(false);
          return;
        }

        const count = data?.length || 0;
        const total = data?.reduce((sum, r) => sum + r.rating, 0) || 0;
        
        setRating({
          productId,
          averageRating: count > 0 ? total / count : 0,
          reviewsCount: count,
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchRating();
    }
  }, [productId]);

  return { rating, loading };
}

export function useProductRatings() {
  const [ratings, setRatings] = useState<Record<string, ProductRating>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatings() {
      const supabase = getSupabase();
      
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('product_id, rating');

        if (error) {
          console.error('Error fetching ratings:', error);
          setLoading(false);
          return;
        }

        const ratingsMap: Record<string, { total: number; count: number }> = {};
        
        data?.forEach((review) => {
          const productId = review.product_id;
          if (!ratingsMap[productId]) {
            ratingsMap[productId] = { total: 0, count: 0 };
          }
          ratingsMap[productId].total += review.rating;
          ratingsMap[productId].count += 1;
        });

        const finalRatings: Record<string, ProductRating> = {};
        Object.entries(ratingsMap).forEach(([productId, { total, count }]) => {
          finalRatings[productId] = {
            productId,
            averageRating: count > 0 ? total / count : 0,
            reviewsCount: count,
          };
        });

        setRatings(finalRatings);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRatings();
  }, []);

  return { ratings, loading };
}