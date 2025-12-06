import { products as allProducts } from './placeholder-data';
import type { Product } from '@/types';

/**
 * Obtener productos destacados desde placeholder-data
 */
export function getFeaturedProducts(): Product[] {
  return allProducts.filter(product => product.featured && product.active);
}

/**
 * Obtener producto por ID
 */
export function getProductById(id: string): Product | undefined {
  return allProducts.find(product => product.id === id);
}

/**
 * Obtener producto por slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find(product => product.slug === slug);
}

/**
 * Obtener todos los productos activos
 */
export function getAllProducts(): Product[] {
  return allProducts.filter(product => product.active);
}