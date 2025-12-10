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

// ✅ Función centralizada para obtener imagen de banner por categoría
const getBannerImageByCategory = (categoryId: string, categoryName: string, parentId?: string): string | null => {
  // Mapeo de banners principales
  const mainCategoryImages: Record<string, string> = {
    'accesorios': '/images/banners/banner acesosrios.jpeg',
    'belleza': '/images/banners/banner belleza.jpeg',
  };

  // Normalizar nombre para búsqueda
  const normalizedName = categoryName.toLowerCase().trim();

  // Mapeo COMPLETO basado en nombre de categoría
  const imagesByName: Record<string, string> = {
    // ===== BELLEZA =====
    'limpiadores': '/images/banners/banner limpiadores.jpeg',
    'hidratantes': '/images/banners/BANNER HIDRATANTES.jpeg',
    'mascarillas': '/images/banners/BANNER MASCARILLAS.jpeg',
    'protectores solares': '/images/banners/BANNER PROTECTORES SOLARES.jpeg',
    'bálsamos labiales': '/images/banners/BANNER BALSAMOS LABIALES.jpeg',
    'balsamos labiales': '/images/banners/BANNER BALSAMOS LABIALES.jpeg',
    'exfoliantes': '/images/banners/BANNER EXFOLIANTES.jpeg',
    'aceites faciales': '/images/banners/BANNER ACEITES  FACIALES.jpeg',
    'cremas faciales': '/images/banners/BANNER CREMAS FACIALES.jpeg',
    'sets de belleza': '/images/banners/BANNER SET DE BELLEZA.jpeg',
    'set de belleza': '/images/banners/BANNER SET DE BELLEZA.jpeg',
    'cremas de manos': '/images/banners/BANNER CREMA DE MANOS.jpeg',
    'crema de manos': '/images/banners/BANNER CREMA DE MANOS.jpeg',
    'lociones': '/images/banners/BANNER LOCION.jpeg',
    'loción': '/images/banners/BANNER LOCION.jpeg',
    'locion': '/images/banners/BANNER LOCION.jpeg',
    'sérum': '/images/banners/BANNER SERUM.jpeg',
    'serum': '/images/banners/BANNER SERUM.jpeg',
    'sérums': '/images/banners/BANNER SERUM.jpeg',
    
    // ===== ACCESORIOS =====
    'auriculares': '/images/banners/BANNER AURICULARES.jpeg',
    'cargadores': '/images/banners/BANNER CARGADORES.jpeg',
    'cables': '/images/banners/BANNER CABLES.jpeg',
    'soportes': '/images/banners/BANNER SOPORTES.jpeg',
    'soporte': '/images/banners/BANNER SOPORTES.jpeg',
    'power banks': '/images/banners/BANNER POWERBANKS.jpeg',
    'powerbanks': '/images/banners/BANNER POWERBANKS.jpeg',
    'powerbank': '/images/banners/BANNER POWERBANKS.jpeg',
    'power bank': '/images/banners/BANNER POWERBANKS.jpeg',
    'adaptadores': '/images/banners/BANNER ADPATDORES.jpeg',
    'adaptador': '/images/banners/BANNER ADPATDORES.jpeg',
    'hubs': '/images/banners/BANNER HUBS.jpeg',
    'hub': '/images/banners/BANNER HUBS.jpeg',
    'altavoces': '/images/banners/BANNER ALTAVOCES.jpeg',
    'altavoz': '/images/banners/BANNER ALTAVOCES.jpeg',
    'parlantes': '/images/banners/BANNER ALTAVOCES.jpeg',
    'parlante': '/images/banners/BANNER ALTAVOCES.jpeg',
    'bocinas': '/images/banners/BANNER ALTAVOCES.jpeg',
    'bocina': '/images/banners/BANNER ALTAVOCES.jpeg',
    'speaker': '/images/banners/BANNER ALTAVOCES.jpeg',
    'speakers': '/images/banners/BANNER ALTAVOCES.jpeg',
    'micrófonos': '/images/banners/BANNER MICROFONOS.jpeg',
    'microfonos': '/images/banners/BANNER MICROFONOS.jpeg',
    'micrófono': '/images/banners/BANNER MICROFONOS.jpeg',
    'microfono': '/images/banners/BANNER MICROFONOS.jpeg',
    'teclados': '/images/banners/BANNER TECLADOS.jpeg',
    'teclado': '/images/banners/BANNER TECLADOS.jpeg',
    'smartwatches': '/images/banners/BANNER SMART WACHT.jpeg',
    'smartwatch': '/images/banners/BANNER SMART WACHT.jpeg',
    'smart watch': '/images/banners/BANNER SMART WACHT.jpeg',
    'relojes inteligentes': '/images/banners/BANNER SMART WACHT.jpeg',
    'reloj inteligente': '/images/banners/BANNER SMART WACHT.jpeg',
  };

  // Si es categoría principal
  if (!parentId && mainCategoryImages[categoryId]) {
    return mainCategoryImages[categoryId];
  }

  // Buscar por nombre exacto
  if (imagesByName[normalizedName]) {
    console.log(`✅ Imagen encontrada por nombre exacto: "${normalizedName}" -> ${imagesByName[normalizedName]}`);
    return imagesByName[normalizedName];
  }

  // Buscar por coincidencia parcial (el nombre contiene la clave)
  for (const [key, image] of Object.entries(imagesByName)) {
    if (normalizedName.includes(key)) {
      console.log(`✅ Imagen encontrada por coincidencia parcial: "${normalizedName}" incluye "${key}" -> ${image}`);
      return image;
    }
  }

  // Buscar por coincidencia inversa (la clave contiene el nombre)
  for (const [key, image] of Object.entries(imagesByName)) {
    if (key.includes(normalizedName) && normalizedName.length > 3) {
      console.log(`✅ Imagen encontrada por coincidencia inversa: "${key}" incluye "${normalizedName}" -> ${image}`);
      return image;
    }
  }

  // Fallback a categoría padre si existe
  if (parentId && mainCategoryImages[parentId]) {
    console.log(`⚠️ Usando imagen de categoría padre para: "${normalizedName}"`);
    return mainCategoryImages[parentId];
  }

  console.log(`❌ No se encontró imagen para: "${normalizedName}" (ID: ${categoryId})`);
  return null;
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

  // Debug: Mostrar todas las categorías al cargar
  useEffect(() => {
    console.log('=== CATEGORÍAS DISPONIBLES ===');
    categories.forEach(cat => {
      console.log(`ID: "${cat.id}", Nombre: "${cat.name}", ParentID: "${cat.parentId || 'ninguno'}"`);
    });
  }, []);

  // Función para obtener el banner de la categoría seleccionada
  const getCategoryBannerImage = useCallback(() => {
    if (!selectedCategory) return null;

    const selectedCat = categories.find(c => c.id === selectedCategory);
    if (!selectedCat) {
      console.log(`❌ Categoría no encontrada: ${selectedCategory}`);
      return null;
    }

    console.log(`🔍 Buscando imagen para: ID="${selectedCat.id}", Nombre="${selectedCat.name}"`);
    
    return getBannerImageByCategory(
      selectedCat.id, 
      selectedCat.name, 
      selectedCat.parentId || undefined
    );
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
        
        setShowScrollButton(scrollPosition > categoryFilterBottom + 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
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
          
          {/* Banner de Categoría - Imagen completa sin truncar */}
          {selectedCategory && categoryBannerImage && (
            <div className="mb-8 relative w-full rounded-xl overflow-hidden shadow-2xl">
              {/* Contenedor que se adapta a la imagen */}
              <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
                <Image
                  key={`${selectedCategory}-${categoryBannerImage}`}
                  src={categoryBannerImage}
                  alt={selectedCategoryName || 'Categoría'}
                  fill
                  className="object-contain bg-gradient-to-r from-gray-900 to-gray-800"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  onError={(e) => {
                    console.error(`Error cargando imagen: ${categoryBannerImage}`);
                  }}
                />
                
                {/* Overlay ligero */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Botón para limpiar filtro */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/20 z-10"
                  aria-label="Ver todas las categorías"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>

                {/* Nombre de categoría superpuesto */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <h2 className="text-white font-bold text-lg md:text-xl">
                      {selectedCategoryName}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {filteredProducts.length} productos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Título cuando no hay categoría seleccionada */}
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