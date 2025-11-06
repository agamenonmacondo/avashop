'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  '/images/combos/combo_1/combo km03.png',
  '/images/combos/combo_1/combo1_km03.png',
  '/images/combos/combo_1/combo1.png',
  '/images/combos/combo_1/Generated Image November 05, 2025 - 4_17PM.png',
  '/images/combos/combos_2/kit_esencial.png',
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-background w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center py-20 md:py-32">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              <span className="text-primary">CCS 724:</span> Compra Confianza Seguridad
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              Explora lo último en accesorios premium, productos de belleza. Calidad y servicio que marcan la diferencia.
            </p>
          </div>
          <div className="relative h-80 md:h-96 flex flex-col items-center justify-center">
            <Image
              src={heroImages[activeIndex]}
              alt={`Imagen combo ${activeIndex + 1}`}
              fill
              className="object-contain drop-shadow-[0_15px_30px_rgba(255,255,255,0.1)] animate-in fade-in duration-500"
              priority
            />
            <div className="absolute -bottom-4 md:-bottom-8 flex justify-center gap-3">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-6 bg-primary' : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Mostrar imagen ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
