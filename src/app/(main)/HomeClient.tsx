'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProductList from '@/components/products/ProductList';
import CategoryFilter from '@/components/products/CategoryFilter';
import { products as allProducts, categories } from '@/lib/placeholder-data';
import type { Product } from '@/types';
import HeroSection from '@/components/layout/HeroSection';
import { ArrowUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Referencias para hacer scroll
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

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

  // Función para obtener el banner de la categoría seleccionada
  const getCategoryBannerImage = useCallback(() => {
    if (!selectedCategory) return null;

    const selectedCat = categories.find(c => c.id === selectedCategory);
    if (!selectedCat) return null;

    // Mapeo de banners principales
    const mainCategoryImages: Record<string, string> = {
      'accesorios': '/images/banners/banner acesosrios.jpeg',
      'belleza': '/images/banners/banner belleza.jpeg',
    };

    // Mapeo de subcategorías
    const subcategoryImages: Record<string, string> = {
      // Belleza
      'b1': '/images/banners/banner limpiadores.jpeg',
      'b2': '/images/banners/BANNER HIDRATANTES.jpeg',
      'b3': '/images/banners/BANNER MASCARILLAS.jpeg',
      'b4': '/images/banners/BANNER PROTECTORES SOLARES.jpeg',
      'b5': '/images/banners/BANNER BALSAMOS LABIALES.jpeg',
      'b6': '/images/banners/BANNER EXFOLIANTES.jpeg',
      'b7': '/images/banners/BANNER ACEITES  FACIALES.jpeg',
      'b8': '/images/banners/BANNER CREMAS FACIALES.jpeg',
      'b9': '/images/banners/BANNER SET DE BELLEZA.jpeg',
      'b10': '/images/banners/BANNER CREMA DE MANOS.jpeg',
      'b11': '/images/banners/BANNER LOCION.jpeg',
      'b12': '/images/banners/BANNER SERUM.jpeg',
      
      // Accesorios
      'a1': '/images/banners/BANNER AURICULARES.jpeg',
      'a2': '/images/banners/BANNER CARGADORES.jpeg',
      'a3': '/images/banners/BANNER CABLES.jpeg',
      'a4': '/images/banners/BANNER SOPORTES.jpeg',
      'a5': '/images/banners/BANNER POWERBANKS.jpeg',
      'a6': '/images/banners/BANNER ADPATDORES.jpeg',
      'a7': '/images/banners/BANNER HUBS.jpeg',
      'a8': '/images/banners/BANNER ALTAVOCES.jpeg',
      'a9': '/images/banners/BANNER MICROFONOS.jpeg',
      'a10': '/images/banners/BANNER TECLADOS.jpeg',
      'a11': '/images/banners/BANNER SMART WACHT.jpeg',
    };

    // Si es subcategoría, retornar su banner
    if (selectedCat.parentId) {
      return subcategoryImages[selectedCategory] || mainCategoryImages[selectedCat.parentId];
    }

    // Si es categoría principal
    return mainCategoryImages[selectedCategory];
  }, [selectedCategory]);

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

  // Scroll automático a productos cuando se selecciona categoría
  useEffect(() => {
    if (selectedCategory && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [selectedCategory]);

  // Detectar scroll para mostrar/ocultar botón
  useEffect(() => {
    const handleScroll = () => {
      if (categoryFilterRef.current) {
        const categoryFilterBottom = categoryFilterRef.current.offsetTop + categoryFilterRef.current.offsetHeight;
        const scrollPosition = window.scrollY;
        
        // Mostrar botón si estamos más abajo del filtro
        setShowScrollButton(scrollPosition > categoryFilterBottom + 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar al montar
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const scrollToFilter = () => {
    categoryFilterRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const categoryBannerImage = getCategoryBannerImage();
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  return (
    <>
      <HeroSection />
      
      {/* Filtro Interactivo de Categorías */}
      <section ref={categoryFilterRef} className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6">
          <CategoryFilter 
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
            productsCount={productsCount}
          />
        </div>
      </section>

      {/* Sección de Productos con Banner */}
      <section ref={productsRef} id="products" className="py-12 md:py-16 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Banner de Categoría Fijo en formato 21:9 */}
          {selectedCategory && categoryBannerImage && (
            <div className="mb-8 relative w-full rounded-xl overflow-hidden shadow-2xl">
              {/* Contenedor con aspect ratio 21:9 */}
              <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
                <Image
                  src={categoryBannerImage}
                  alt={selectedCategoryName || 'Categoría'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
                
                {/* Overlay con gradiente más oscuro para mejor contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                
                {/* Contenido del banner */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      {/* Título con mejor contraste y sombra más pronunciada */}
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-3 text-white dark:text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        {selectedCategoryName}
                      </h2>
                      <p className="text-lg md:text-xl lg:text-2xl font-medium text-white/95 dark:text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {filteredProducts.length} productos encontrados
                      </p>
                    </div>
                    
                    {/* Botón para limpiar filtro */}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-lg"
                      aria-label="Ver todas las categorías"
                    >
                      <X className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Título alternativo cuando no hay categoría seleccionada */}
          {!selectedCategory && (
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Nuestros Productos
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                {filteredProducts.length} productos disponibles
              </p>
            </div>
          )}
          
          {/* Lista de Productos */}
          <ProductList products={filteredProducts} />
        </div>
      </section>

      {/* Botón flotante "Volver al filtro" */}
      <button
        onClick={scrollToFilter}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "hover:scale-110 active:scale-95",
          "flex items-center gap-2 group",
          showScrollButton 
            ? "translate-y-0 opacity-100" 
            : "translate-y-20 opacity-0 pointer-events-none"
        )}
        aria-label="Volver al filtro de categorías"
      >
        <ArrowUp className="h-5 w-5" />
        <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">
          Ver Categorías
        </span>
      </button>
    </>
  );
}