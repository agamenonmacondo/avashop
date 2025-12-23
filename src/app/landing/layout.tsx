'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  // extrae el slug del landing: /landing/creatina -> creatina
  const parts = pathname.split('/').filter(Boolean);
  const slug = parts[1] || 'default';

  // data-landing permite aplicar estilos/logic por landing desde CSS/JS (ej: header, hero)
  return <div data-landing={slug}>{children}</div>;
}