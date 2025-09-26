import { products } from './placeholder-data';
import type { Product } from '@/types';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Buscar producto por slug o por ID como fallback
  const product = products.find(p => {
    // Si el producto tiene slug, usarlo
    if (p.slug) {
      return p.slug === slug;
    }
    // Fallback: generar slug desde el nombre y comparar
    const generatedSlug = p.name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // remover caracteres especiales
      .replace(/\s+/g, '-') // espacios a guiones
      .trim();
    return generatedSlug === slug || p.id === slug;
  });
  
  return product || null;
}

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return products.filter(p => p.category.id === categoryId);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description?.toLowerCase().includes(lowercaseQuery) ||
    p.category.name.toLowerCase().includes(lowercaseQuery)
  );
}