'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function ProductTickerBar({ products }: { products: { id: string, name: string, price: number }[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 border-y border-purple-200/60 dark:border-purple-500/20 shadow-md dark:shadow-2xl backdrop-blur-sm">
      <div className="container mx-auto px-4 py-1.5 max-w-3xl">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400 flex-shrink-0 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] dark:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          
          <div className="text-center overflow-hidden flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 text-sm tracking-wide animate-fade-in inline-block truncate max-w-[200px] md:max-w-[380px] drop-shadow-[0_0_8px_rgba(126,34,206,0.3)] dark:drop-shadow-[0_0_10px_rgba(216,180,254,0.5)]">
              {products[current].name}
            </span>
            <span className="mx-1 text-purple-500/70 dark:text-purple-400/60 text-sm">•</span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 dark:from-yellow-300 dark:via-amber-200 dark:to-yellow-300 text-sm tracking-wider drop-shadow-[0_0_10px_rgba(217,119,6,0.5)] dark:drop-shadow-[0_0_12px_rgba(252,211,77,0.7)] animate-glow">
              ${products[current].price.toLocaleString('es-CO')}
            </span>
          </div>
          
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400 flex-shrink-0 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] dark:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-5px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            filter: drop-shadow(0 0 10px rgba(217, 119, 6, 0.5));
          }
          50% { 
            filter: drop-shadow(0 0 16px rgba(217, 119, 6, 0.7));
          }
        }
        
        @media (prefers-color-scheme: dark) {
          @keyframes glow {
            0%, 100% { 
              filter: drop-shadow(0 0 12px rgba(252, 211, 77, 0.7));
            }
            50% { 
              filter: drop-shadow(0 0 18px rgba(252, 211, 77, 0.9));
            }
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}