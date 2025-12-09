'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductList from '@/components/products/ProductList';
import CategoryFilter from '@/components/products/CategoryFilter';
import { products as allProducts, categories } from '@/lib/placeholder-data';
import type { Product } from '@/types';
import HeroSection from '@/components/layout/HeroSection';

// Definir tipos para los filtros
interface Filters {
  categories: string[];
  priceRange: [number, number];
}

// ✅ Helper para obtener timestamp de forma segura
const getTimestamp = (date: Date | string | undefined): number => {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  return new Date(date).getTime();
};

export default function HomeClient() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSortKey, setCurrentSortKey] = useState('relevance');

  // Calcular productos por categoría
  const productsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    
    categories.forEach(category => {
      counts[category.id] = allProducts.filter(product => 
        product.category?.id === category.id || 
        product.subcategory?.id === category.id
      ).length;
    });
    
    return counts;
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let tempProducts = [...allProducts];

    // Filtrar por categoría seleccionada (del CategoryFilter)
    if (selectedCategory) {
      tempProducts = tempProducts.filter(product => {
        const categoryId = product.category?.id;
        const subcategoryId = product.subcategory?.id;
        return categoryId === selectedCategory || subcategoryId === selectedCategory;
      });
    }
    
    // Ordenar
    switch (currentSortKey) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        tempProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest': 
        tempProducts.sort((a, b) => {
          const aTime = getTimestamp(a.createdAt);
          const bTime = getTimestamp(b.createdAt);
          return bTime - aTime;
        }); 
        break;
      case 'relevance': 
      default:
        break;
    }

    setFilteredProducts(tempProducts);
  }, [selectedCategory, currentSortKey]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <>
      <HeroSection />
      
      {/* Filtro Interactivo de Categorías */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6">
          <CategoryFilter 
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
            productsCount={productsCount}
          />
        </div>
      </section>

      {/* Productos - Ahora ocupando todo el ancho */}
      <section id="products" className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'Nuestros Productos'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} productos encontrados
            </p>
          </div>
          
          {/* ProductList ahora ocupa todo el ancho disponible */}
          <ProductList products={filteredProducts} />
        </div>
      </section>
    </>
  );
}