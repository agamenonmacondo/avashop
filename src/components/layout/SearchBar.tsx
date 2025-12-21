'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/placeholder-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    
    const scoredProducts = products
      .map(product => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        const categoryName = (product.category?.name || '').toLowerCase();
        const productId = product.id.toLowerCase();

        // Dividir el nombre del producto en palabras
        const productWords = productName.split(/[\s\-_]+/);
        const searchWords = searchQuery.split(/[\s\-_]+/);

        // Coincidencia exacta completa (máxima prioridad)
        if (productName === searchQuery) score += 1000;
        
        // Coincidencia exacta de palabras individuales
        productWords.forEach(word => {
          searchWords.forEach(searchWord => {
            if (word === searchWord) score += 200;
          });
        });

        // Comienza con la búsqueda completa
        if (productName.startsWith(searchQuery)) score += 150;
        
        // Cualquier palabra comienza con la búsqueda
        productWords.forEach(word => {
          if (word.startsWith(searchQuery)) score += 100;
        });

        // Contiene la búsqueda completa en el nombre
        if (productName.includes(searchQuery)) score += 80;
        
        // Búsqueda de palabras parciales (el cambio importante)
        searchWords.forEach(searchWord => {
          if (searchWord.length >= 2) {
            // Buscar en cada palabra del producto
            productWords.forEach(productWord => {
              // Coincidencia parcial dentro de la palabra
              if (productWord.includes(searchWord)) {
                score += 60;
              }
              // Si la palabra del producto comienza con la búsqueda
              if (productWord.startsWith(searchWord)) {
                score += 40;
              }
            });
          }
        });

        // Búsqueda en números (para modelos como iPhone 15, 16, etc.)
        const productNumbers = productName.match(/\d+/g) || [];
        const searchNumbers = searchQuery.match(/\d+/g) || [];
        
        searchNumbers.forEach(searchNum => {
          productNumbers.forEach(productNum => {
            if (productNum === searchNum) score += 150; // Coincidencia exacta de número
            if (productNum.includes(searchNum)) score += 100; // Número parcial
          });
        });

        // Búsqueda en el ID del producto
        if (productId.includes(searchQuery)) score += 50;

        // Contiene en la descripción
        if (productDesc.includes(searchQuery)) score += 30;
        
        // Contiene en la categoría
        if (categoryName.includes(searchQuery)) score += 20;

        // Búsqueda fuzzy (tolerancia a errores de escritura)
        searchWords.forEach(searchWord => {
          if (searchWord.length >= 3) {
            productWords.forEach(productWord => {
              // Calcular similitud (simple: cuántos caracteres coinciden)
              let matches = 0;
              for (let i = 0; i < Math.min(searchWord.length, productWord.length); i++) {
                if (searchWord[i] === productWord[i]) matches++;
              }
              const similarity = matches / searchWord.length;
              if (similarity > 0.6) { // 60% de similitud
                score += Math.floor(similarity * 30);
              }
            });
          }
        });

        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => {
        const imageUrl = (item.product.imageUrls && item.product.imageUrls.length > 0)
          ? item.product.imageUrls[0]
          : '/images/placeholder-product.png';

        return {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: imageUrl,
          category: item.product.category?.name || 'Sin categoría',
        };
      });

    setResults(scoredProducts);
    setIsOpen(scoredProducts.length > 0);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${productId}`);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/60 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "pl-8 pr-8 h-9 md:h-11 md:pl-10 md:pr-10",
            "bg-background/60 backdrop-blur-md",
            "border-border/40 focus:border-primary/60",
            "rounded-full",
            "transition-all duration-300 ease-out",
            "focus:bg-background/80",
            "placeholder:text-muted-foreground/50",
            "text-sm md:text-base"
          )}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results.length > 0) {
              handleSelectProduct(results[0].id);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 md:h-7 md:w-7 rounded-full hover:bg-muted/50"
          >
            <X className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>

      {/* Menú de resultados */}
      {isOpen && results.length > 0 && (
        <div className={cn(
          "absolute top-full mt-2 md:mt-3 w-full",
          "bg-card/95 backdrop-blur-xl",
          "border border-border/30 rounded-xl md:rounded-2xl shadow-xl z-50",
          "overflow-hidden",
          "animate-in fade-in-0 slide-in-from-top-2 duration-300"
        )}>
          {/* Lista de resultados */}
          <div className="divide-y divide-border/20">
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectProduct(result.id)}
                className={cn(
                  "w-full flex items-center gap-3 md:gap-4 p-3 md:p-4",
                  "hover:bg-accent/50 active:bg-accent/70",
                  "transition-all duration-200 text-left",
                  "focus-visible:bg-accent/50 focus-visible:outline-none",
                  "group"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Imagen del producto */}
                <div className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden bg-muted/30 ring-1 ring-border/20">
                  <Image
                    src={result.imageUrl}
                    alt={result.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 48px, 64px"
                    unoptimized={result.imageUrl.startsWith('/images')}
                  />
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                  <p className="text-xs md:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors leading-tight">
                    {result.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground/80">
                    {result.category}
                  </p>
                </div>

                {/* Precio */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm md:text-base font-bold text-primary whitespace-nowrap">
                    ${result.price.toLocaleString('es-CO')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de "sin resultados" */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className={cn(
          "absolute top-full mt-2 md:mt-3 w-full",
          "bg-card/95 backdrop-blur-xl",
          "border border-border/30 rounded-xl md:rounded-2xl shadow-xl z-50",
          "p-6 md:p-8",
          "animate-in fade-in-0 slide-in-from-top-2 duration-300"
        )}>
          <div className="text-center space-y-2 md:space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted/30 ring-1 ring-border/20">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-xs md:text-sm font-semibold text-foreground">
                Sin resultados
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground/70">
                Intenta con otros términos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}