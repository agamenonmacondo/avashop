'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';
import { ChevronDown, Package } from 'lucide-react';
import Image from 'next/image';

interface CategoryFilterProps {
  categories: Category[];
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory?: string | null;
  productsCount?: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  onCategorySelect,
  selectedCategory,
  productsCount = {},
}: CategoryFilterProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [selectedSubcategoryImage, setSelectedSubcategoryImage] = useState<string | null>(null);

  const mainCategories = categories
    .filter(cat => !cat.parentId)
    .sort((a, b) => {
      const order = { 'accesorios': 1, 'belleza': 2 };
      return (order[a.id as keyof typeof order] || 999) - (order[b.id as keyof typeof order] || 999);
    });
  
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getCategoryIcon = (categoryId: string) => {
    if (categoryId === 'belleza') return '💄';
    if (categoryId === 'accesorios') return '🎧';
    return '📦';
  };

  const getCategoryImage = (categoryId: string) => {
    const images: Record<string, string> = {
      'accesorios': '/images/banners/banner acesosrios.jpeg',
      'belleza': '/images/banners/banner belleza.jpeg',
    };
    return images[categoryId];
  };

  // Mapeo de subcategorías por nombre para mayor claridad
  const getSubcategoryBannerImage = (subcategoryId: string) => {
    // Primero obtener el nombre de la subcategoría para mapear correctamente
    const subcategory = categories.find(c => c.id === subcategoryId);
    const subcategoryName = subcategory?.name?.toLowerCase() || '';

    // Mapeo por nombre de subcategoría
    const imagesByName: Record<string, string> = {
      // Belleza
      'limpiadores': '/images/banners/banner limpiadores.jpeg',
      'hidratantes': '/images/banners/BANNER HIDRATANTES.jpeg',
      'mascarillas': '/images/banners/BANNER MASCARILLAS.jpeg',
      'protectores solares': '/images/banners/BANNER PROTECTORES SOLARES.jpeg',
      'bálsamos labiales': '/images/banners/BANNER BALSAMOS LABIALES.jpeg',
      'exfoliantes': '/images/banners/BANNER EXFOLIANTES.jpeg',
      'aceites faciales': '/images/banners/BANNER ACEITES  FACIALES.jpeg',
      'cremas faciales': '/images/banners/BANNER CREMAS FACIALES.jpeg',
      'sets de belleza': '/images/banners/BANNER SET DE BELLEZA.jpeg',
      'cremas de manos': '/images/banners/BANNER CREMA DE MANOS.jpeg',
      'lociones': '/images/banners/BANNER LOCION.jpeg',
      'serum': '/images/banners/BANNER SERUM.jpeg',
      
      // Accesorios
      'auriculares': '/images/banners/BANNER AURICULARES.jpeg',
      'cargadores': '/images/banners/BANNER CARGADORES.jpeg',
      'cables': '/images/banners/BANNER CABLES.jpeg',
      'soportes': '/images/banners/BANNER SOPORTES.jpeg',
      'powerbanks': '/images/banners/BANNER POWERBANKS.jpeg',
      'adaptadores': '/images/banners/BANNER ADPATDORES.jpeg',
      'hubs': '/images/banners/BANNER HUBS.jpeg',
      'altavoces': '/images/banners/BANNER ALTAVOCES.jpeg',
      'micrófonos': '/images/banners/BANNER MICROFONOS.jpeg',
      'microfonos': '/images/banners/BANNER MICROFONOS.jpeg',
      'teclados': '/images/banners/BANNER TECLADOS.jpeg',
      'smartwatch': '/images/banners/BANNER SMART WACHT.jpeg',
      'smart watch': '/images/banners/BANNER SMART WACHT.jpeg',
      'relojes inteligentes': '/images/banners/BANNER SMART WACHT.jpeg',
    };

    // Buscar por nombre
    for (const [name, image] of Object.entries(imagesByName)) {
      if (subcategoryName.includes(name) || name.includes(subcategoryName)) {
        return image;
      }
    }

    // Fallback al mapeo por ID si no se encuentra por nombre
    const imagesById: Record<string, string> = {
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

    return imagesById[subcategoryId];
  };

  const getSubcategoryIconImage = (subcategoryId: string) => {
    return getSubcategoryBannerImage(subcategoryId);
  };

  const getBannerImage = (categoryId: string) => {
    if (selectedCategory && selectedCategory !== categoryId && selectedSubcategoryImage) {
      const selectedCat = categories.find(c => c.id === selectedCategory);
      if (selectedCat?.parentId === categoryId) {
        return selectedSubcategoryImage;
      }
    }

    if (hoveredCategory === categoryId) {
      if (hoveredSubcategory) {
        const subcategoryImage = getSubcategoryBannerImage(hoveredSubcategory);
        if (subcategoryImage) return subcategoryImage;
      }
      
      if (hoveredSubcategory === null) {
        return getCategoryImage(categoryId);
      }
    }

    if (selectedCategory === categoryId) {
      return getCategoryImage(categoryId);
    }
    
    return getCategoryImage(categoryId);
  };

  const handleSubcategoryClick = (e: React.MouseEvent, subcategoryId: string) => {
    e.stopPropagation();
    const bannerImage = getSubcategoryBannerImage(subcategoryId);
    if (bannerImage) {
      setSelectedSubcategoryImage(bannerImage);
    }
    onCategorySelect(subcategoryId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedSubcategoryImage(null);
    onCategorySelect(categoryId);
  };

  useEffect(() => {
    if (selectedCategory) {
      const selectedCat = categories.find(c => c.id === selectedCategory);
      if (selectedCat?.parentId) {
        const bannerImage = getSubcategoryBannerImage(selectedCategory);
        if (bannerImage) {
          setSelectedSubcategoryImage(bannerImage);
        }
      } else {
        setSelectedSubcategoryImage(null);
      }
    } else {
      setSelectedSubcategoryImage(null);
    }
  }, [selectedCategory, categories]);

  // Debug: mostrar mapeo de categorías en consola
  useEffect(() => {
    console.log('=== DEBUG: Mapeo de Subcategorías ===');
    categories.forEach(cat => {
      if (cat.parentId) {
        const image = getSubcategoryBannerImage(cat.id);
        console.log(`ID: ${cat.id}, Nombre: ${cat.name}, Imagen: ${image}`);
      }
    });
  }, [categories]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline mb-2">
          Explorar por Categorías
        </h2>
        <p className="text-muted-foreground">
          Pasa el cursor sobre una categoría para ver todas las opciones
        </p>
      </div>

      {/* Segmentos Horizontales */}
      <div className="space-y-4 max-w-7xl mx-auto">
        {mainCategories.map((category) => {
          const subcategories = getSubcategories(category.id);
          const isHovered = hoveredCategory === category.id;
          const categoryImage = getBannerImage(category.id);
          const isCategoryOrSubcategorySelected = 
            selectedCategory === category.id || 
            categories.find(c => c.id === selectedCategory)?.parentId === category.id;

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => {
                setHoveredCategory(null);
                setHoveredSubcategory(null);
              }}
            >
              {/* Banner Principal */}
              <div
                className={cn(
                  "group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer border-2",
                  "hover:shadow-xl aspect-[21/9] bg-card",
                  isHovered || isCategoryOrSubcategorySelected
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleCategoryClick(category.id)}
              >
                {categoryImage && (
                  <div className="absolute inset-0">
                    <Image
                      key={categoryImage}
                      src={categoryImage}
                      alt={category.name}
                      fill
                      className="object-cover transition-all duration-500 ease-in-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
                      priority
                    />
                  </div>
                )}

                {!categoryImage && (
                  <div className={cn(
                    "absolute inset-0",
                    category.id === 'accesorios' 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600" 
                      : "bg-gradient-to-r from-pink-600 to-rose-600"
                  )} />
                )}

                <div className="absolute bottom-6 right-6 z-10">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                    {productsCount[category.id] && (
                      <span className="text-sm text-white/90">
                        {productsCount[category.id]} productos
                      </span>
                    )}
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 text-white transition-transform duration-300",
                        (isHovered || isCategoryOrSubcategorySelected) && "rotate-180"
                      )} 
                    />
                  </div>
                </div>
              </div>

              {/* Cuadrícula de Subcategorías */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-500 ease-in-out",
                  (isHovered || isCategoryOrSubcategorySelected) 
                    ? "max-h-[800px] opacity-100 mt-4" 
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="bg-card/30 backdrop-blur-sm rounded-xl border-2 border-primary/20 p-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* Botón "Ver Todas" */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.id);
                      }}
                      onMouseEnter={() => setHoveredSubcategory(null)}
                      className={cn(
                        "group/item relative overflow-hidden rounded-lg transition-all duration-300",
                        "border-2 hover:shadow-lg hover:scale-105 aspect-[21/9] bg-card",
                        selectedCategory === category.id && !selectedSubcategoryImage
                          ? "border-primary ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {getCategoryImage(category.id) && (
                        <div className="absolute inset-0">
                          <Image
                            src={getCategoryImage(category.id)}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="400px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <Package className="h-8 w-8 text-white drop-shadow-lg mb-1" />
                        <span className="font-bold text-sm text-white drop-shadow-lg">
                          Ver Todas
                        </span>
                        {productsCount[category.id] && (
                          <span className="text-xs text-white/90 drop-shadow">
                            {productsCount[category.id]} productos
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </button>

                    {/* Subcategorías */}
                    {subcategories.map((subcategory) => {
                      const iconImage = getSubcategoryIconImage(subcategory.id);
                      
                      return (
                        <button
                          key={subcategory.id}
                          onClick={(e) => handleSubcategoryClick(e, subcategory.id)}
                          onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
                          className={cn(
                            "group/item relative overflow-hidden rounded-lg transition-all duration-300",
                            "border-2 hover:shadow-lg hover:scale-105 aspect-[21/9] bg-card",
                            selectedCategory === subcategory.id
                              ? "border-primary ring-2 ring-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {iconImage ? (
                            <div className="absolute inset-0">
                              <Image
                                src={iconImage}
                                alt={subcategory.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 400px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                          )}

                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <span className="font-bold text-sm text-white drop-shadow-lg">
                              {subcategory.name}
                            </span>
                            {productsCount[subcategory.id] && (
                              <span className="text-xs text-white/90 drop-shadow">
                                {productsCount[subcategory.id]} productos
                              </span>
                            )}
                          </div>
                          
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón para limpiar filtro */}
      {selectedCategory && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => {
              onCategorySelect(null);
              setSelectedSubcategoryImage(null);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ver Todos los Productos
          </button>
        </div>
      )}
    </div>
  );
}

export function CategoryFilterMobile({ 
  categories, 
  onCategorySelect, 
  selectedCategory,
  productsCount = {},
}: CategoryFilterProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const mainCategories = categories
    .filter(cat => !cat.parentId)
    .sort((a, b) => {
      const order = { 'accesorios': 1, 'belleza': 2 };
      return (order[a.id as keyof typeof order] || 999) - (order[b.id as keyof typeof order] || 999);
    });
  
  const getCategoryIcon = (categoryId: string) => {
    if (categoryId === 'belleza') return '💄';
    if (categoryId === 'accesorios') return '🎧';
    return '📦';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg mb-4">Categorías</h3>
      
      {mainCategories.map(category => {
        const isExpanded = expandedCategory === category.id;
        const subcategories = categories.filter(sub => sub.parentId === category.id);

        return (
          <div key={category.id} className="space-y-2">
            <button
              onClick={() => {
                setExpandedCategory(isExpanded ? null : category.id);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-colors",
                selectedCategory === category.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category.id)}</span>
                {category.name}
              </span>
              <ChevronDown 
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )} 
              />
            </button>
            
            {isExpanded && (
              <div className="grid grid-cols-2 gap-2 px-2 animate-in slide-in-from-top-2 duration-300">
                <button
                  onClick={() => onCategorySelect(category.id)}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-colors border-2",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Package className="h-5 w-5" />
                    <span>Ver Todas</span>
                    {productsCount[category.id] && (
                      <span className="text-xs opacity-70">
                        ({productsCount[category.id]})
                      </span>
                    )}
                  </div>
                </button>

                {subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => onCategorySelect(subcategory.id)}
                    className={cn(
                      "p-3 rounded-lg text-sm font-medium transition-colors border-2",
                      selectedCategory === subcategory.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">
                        {subcategory.id.startsWith('b') ? '✨' : '🔌'}
                      </span>
                      <span className="text-xs">{subcategory.name}</span>
                      {productsCount[subcategory.id] && (
                        <span className="text-xs opacity-70">
                          ({productsCount[subcategory.id]})
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}