'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Category, Product } from '@/types';
import { ListFilter, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: Category[];
  products?: Product[];
  onFilterChange: (filters: any) => void;
  onSortChange: (sortKey: string) => void;
  className?: string;
  maxPrice?: number;
  priceStep?: number;
}

const formatColombianCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export default function FilterSidebar({
  categories,
  products = [],
  onFilterChange,
  onSortChange,
  className,
  maxPrice = 800000,
  priceStep = 100000
}: FilterSidebarProps) {
  
  const groupCategories = (cats: Category[]) => {
    const groups: { [key: string]: { parent: Category; children: Category[] } } = {};
    
    const parents = cats.filter(cat => !cat.parentId);
    
    parents.forEach(parent => {
      groups[parent.id] = { parent, children: [] };
    });
    
    cats.forEach(cat => {
      if (cat.parentId && groups[cat.parentId]) {
        groups[cat.parentId].children.push(cat);
      }
    });
    
    return groups;
  };

  const categoryGroups = groupCategories(categories);

  // 🔍 DEBUG: Ver qué tienen los productos
  console.log('Products received:', products.slice(0, 2).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryType: typeof p.category
  })));

  // Calcular el rango de precios real de los productos mostrados
  const productPrices = products.map(p => p.price);
  const minProductPrice = productPrices.length ? Math.min(...productPrices) : 0;
  const maxProductPriceReal = productPrices.length ? Math.max(...productPrices) : maxPrice;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([minProductPrice, maxProductPriceReal]);
  const [sortKey, setSortKey] = useState<string>('relevance');

  // Actualizar rango de precios cuando cambian los productos
  useEffect(() => {
    setPriceRange([minProductPrice, maxProductPriceReal]);
  }, [minProductPrice, maxProductPriceReal]);

  const handleCategoryChange = (categoryId: string, checked: boolean, isParent = false, childrenIds: string[] = []) => {
    let newSelectedCategories = [...selectedCategories];
    
    if (isParent) {
      if (checked) {
        // Seleccionar padre y todos sus hijos
        newSelectedCategories = [...new Set([...newSelectedCategories, categoryId, ...childrenIds])];
      } else {
        // Deseleccionar padre y todos sus hijos
        newSelectedCategories = newSelectedCategories.filter(id => id !== categoryId && !childrenIds.includes(id));
      }
    } else {
      if (checked) {
        newSelectedCategories.push(categoryId);
      } else {
        newSelectedCategories = newSelectedCategories.filter(id => id !== categoryId);
      }
    }
    
    setSelectedCategories(newSelectedCategories);
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };

  const handleSortChange = (value: string) => {
    setSortKey(value);
    onSortChange(value);
  };

  const applyFilters = () => {
    onFilterChange({ categories: selectedCategories, priceRange });
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([minProductPrice, maxProductPriceReal]);
    setSortKey('relevance');
    onFilterChange({ categories: [], priceRange: [minProductPrice, maxProductPriceReal] });
    onSortChange('relevance');
  };

  return (
    <div className={cn("space-y-6 p-4 bg-card rounded-lg shadow-sm", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold font-headline flex items-center">
          <ListFilter className="mr-2 h-5 w-5 text-primary" />
          Filtros
        </h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
          <RotateCcw className="mr-1 h-3 w-3" />
          Reiniciar
        </Button>
      </div>

      <div>
        <Label htmlFor="sort-by" className="text-sm font-medium">Ordenar Por</Label>
        <Select value={sortKey} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-by" className="w-full mt-1">
            <SelectValue placeholder="Seleccionar ordenación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevancia</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="rating-desc">Calificación: Mayor a Menor</SelectItem>
            <SelectItem value="newest">Más Recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">Categorías</AccordionTrigger>
          {/* MODIFICACIÓN: Agregamos max-h-[300px] y overflow-y-auto para crear el scroll */}
          <AccordionContent className="space-y-2 pt-2 max-h-[300px] overflow-y-auto pr-2">
            {Object.keys(categoryGroups).length === 0 && (
              <div className="text-sm text-muted-foreground">No hay categorías disponibles</div>
            )}
            {/* ✅ MOSTRAR TODAS LAS CATEGORÍAS SIN FILTRAR */}
            {Object.entries(categoryGroups).map(([key, group]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${group.parent.id}`}
                    checked={selectedCategories.includes(group.parent.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(
                        group.parent.id, 
                        !!checked, 
                        true, 
                        group.children.map(c => c.id)
                      )
                    }
                  />
                  <Label 
                    htmlFor={`category-${group.parent.id}`} 
                    className="font-medium text-sm cursor-pointer"
                  >
                    {group.parent.name}
                  </Label>
                </div>
                
                {group.children.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {group.children.map(child => (
                      <div key={child.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${child.id}`}
                          checked={selectedCategories.includes(child.id)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(child.id, !!checked)
                          }
                        />
                        <Label 
                          htmlFor={`category-${child.id}`} 
                          className="font-normal text-sm cursor-pointer"
                        >
                          {child.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Rango de Precios</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Slider
              min={minProductPrice}
              max={maxProductPriceReal}
              step={priceStep}
              value={priceRange}
              onValueChange={(value) => handlePriceChange(value as [number, number])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatColombianCurrency(priceRange[0])}</span>
              <span>{formatColombianCurrency(priceRange[1])}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={applyFilters} className="w-full mt-4">Aplicar Filtros</Button>
    </div>
  );
}

