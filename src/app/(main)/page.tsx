'use client'; 

import { useState, useEffect, useCallback } from 'react';
import ProductList from '@/components/products/ProductList';
import FilterSidebar from '@/components/products/FilterSidebar';
import { products as allProducts, categories } from '@/lib/placeholder-data';
import type { Product } from '@/types';
import HeroSection from '@/components/layout/HeroSection';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

// Definir tipos para los filtros
interface Filters {
  categories: string[];
  priceRange: [number, number];
}

export default function HomePage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);
  const [currentFilters, setCurrentFilters] = useState<Filters>({ 
    categories: [], 
    priceRange: [0, 5000000] 
  });
  const [currentSortKey, setCurrentSortKey] = useState('relevance');

  const applyFiltersAndSort = useCallback(() => {
    let tempProducts = [...allProducts];

    if (currentFilters.categories.length > 0) {
      tempProducts = tempProducts.filter(product => 
        currentFilters.categories.includes(product.category.id)
      );
    }

    tempProducts = tempProducts.filter(product => 
      product.price >= currentFilters.priceRange[0] && product.price <= currentFilters.priceRange[1]
    );
    
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
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }); 
        break;
      case 'relevance': 
      default:
        break;
    }

    setFilteredProducts(tempProducts);
  }, [currentFilters, currentSortKey]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  const handleSortChange = (sortKey: string) => {
    setCurrentSortKey(sortKey);
  };
  
  const filterProps = {
    categories: categories, 
    onFilterChange: handleFilterChange,
    onSortChange: handleSortChange,
    maxPrice: 5000000, 
    priceStep: 100000,
  };

  return (
    <>
      <HeroSection />
      <section id="products" className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5">
              <FilterSidebar {...filterProps} />
            </aside>
            <div className="w-full md:w-3/4 lg:w-4/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-headline">Nuestros Productos</h2>
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filtrar
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-3/4">
                      <FilterSidebar {...filterProps} />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              <ProductList products={filteredProducts} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
