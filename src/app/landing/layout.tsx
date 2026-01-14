'use client';

import React, { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

// Configuración de heros por landing
const landingHeroConfig: Record<string, {
  type: 'image' | 'video';
  src: string;
  title: string;
  description: string;
  price?: string;
  buttonText: string;
  showCard: boolean;
}> = {
  'utiles-escolares': {
    type: 'image',
    src: '/images/UTILES/BANNER UTILES.png',
    title: '📚 Útiles Escolares 2025',
    description: 'Todo lo que necesitas para el regreso a clases',
    price: '',
    buttonText: 'Ver Productos',
    showCard: false,
  },
  'creatina': {
    type: 'image',
    src: '/images/creatina/hero_creatina.jpeg',
    title: '💪 Creatina Monohidrato',
    description: 'Potencia tu energía y fuerza',
    price: '$65.000',
    buttonText: 'Comprar Ahora',
    showCard: true,
  },
  // Agrega más landings aquí
};

// Context para compartir config del hero
const LandingContext = createContext<{
  slug: string;
  heroConfig?: typeof landingHeroConfig[string];
}>({ slug: 'default' });

export const useLandingConfig = () => useContext(LandingContext);

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const parts = pathname.split('/').filter(Boolean);
  const slug = parts[1] || 'default';
  
  const heroConfig = landingHeroConfig[slug];

  return (
    <LandingContext.Provider value={{ slug, heroConfig }}>
      <div data-landing={slug}>{children}</div>
    </LandingContext.Provider>
  );
}