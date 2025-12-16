'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mic, Video, ShieldCheck, Truck, Award, ChevronDown, Check, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import { gtagViewItem, gtagAddToCart } from '@/lib/google-ads';

export default function KitEsencialPage() {
  const router = useRouter();

  useEffect(() => {
    gtagViewItem(299900, [{
      id: 'kit-esencial',
      name: 'Kit Esencial',
      price: 299900,
      quantity: 1,
    }]);
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Kit Esencial - CCS724',
    image: 'https://www.ccs724.com/images/combos/combos_2/kit_esencial.png',
    description: 'Kit esencial para creadores: incluye Micrófono REMAX K18 y KOOSDA Mini Gimbal KM01.',
    brand: { '@type': 'Brand', name: 'CCS724' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '127' },
    offers: {
      '@type': 'Offer',
      url: 'https://www.ccs724.com/landing/kit-esencial',
      priceCurrency: 'COP',
      price: '299900',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2025-12-31',
    },
  };

  function handleBuyKitEsencial() {
    const kitEsencial = {
      id: 'kit-esencial',
      name: 'Kit Esencial',
      price: 299900,
      quantity: 1,
      imageUrls: ['/images/combos/combos_2/kit_esencial.png'],
      descripcion: 'Kit esencial para creadores: incluye micrófono y mini gimbal.',
      category: { name: 'Combos', id: 'combos' },
      stock: 15,
    };
    gtagAddToCart(299900, [kitEsencial]);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find((item: any) => item.id === kitEsencial.id);
    if (!exists) cart.push(kitEsencial);
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  const scrollToBuy = () => {
    document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />

      <main className="pt-16">
        
        {/* ===== SECCIÓN 1: PROBLEMA ===== */}
        <section className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/1 imagen problmea.jpeg"
              alt="El problema de grabar sin equipo profesional"
              fill
              priority
              className="object-cover"
            />
            
            {/* Overlay solo en desktop - más ligero */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Contenido overlay en desktop */}
            <div className="hidden md:flex absolute inset-0 items-end pb-16">
              <div className="container mx-auto max-w-3xl text-center space-y-4 px-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Grabar no es lo mismo que <span className="text-red-400">crear.</span>
                </h1>
                <p className="text-lg text-white/90">
                  Cuando no tienes control, tu contenido se nota.
                </p>
                <Button
                  size="lg"
                  onClick={scrollToBuy}
                  className="text-base px-8 py-6 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                  Quiero la Solución →
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contenido debajo en mobile */}
          <div className="md:hidden bg-background p-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold leading-tight">
                Grabar no es lo mismo que <span className="text-red-400">crear.</span>
              </h1>
              <p className="text-base">
                Cuando no tienes control, tu contenido se nota.
              </p>
              <Button
                size="lg"
                onClick={scrollToBuy}
                className="text-base px-8 py-6 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                Quiero la Solución →
              </Button>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 2: SOLUCIÓN ===== */}
        <section className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/2. solucion.jpeg"
              alt="Kit Esencial CCS724"
              fill
              className="object-cover"
            />
            
            {/* Overlay ligero en desktop */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            {/* Contenido overlay en desktop */}
            <div className="hidden md:flex absolute inset-0 items-center">
              <div className="container mx-auto max-w-2xl space-y-6 px-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/30 border border-primary/50 rounded-full">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-white">KIT ESENCIAL</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Todo cambia cuando decides <span className="text-primary">hacerlo bien.</span>
                </h2>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-primary">$299.900</span>
                  <span className="text-base text-white/60 line-through">$420.000</span>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">-29%</span>
                </div>

                <div className="flex flex-wrap gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" /> Envío Gratis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Pago Contra Entrega
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={handleBuyKitEsencial}
                  className="text-lg px-10 py-7 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                  🛒 Comprar Ahora
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contenido debajo en mobile */}
          <div className="md:hidden bg-background p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/30 border border-primary/50 rounded-full">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary">KIT ESENCIAL</span>
              </div>
              
              <h2 className="text-2xl font-bold leading-tight">
                Todo cambia cuando decides <span className="text-primary">hacerlo bien.</span>
              </h2>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-primary">$299.900</span>
                <span className="text-base text-muted-foreground line-through">$420.000</span>
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">-29%</span>
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" /> Envío Gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Pago Contra Entrega
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleBuyKitEsencial}
                className="w-full text-lg px-10 py-7 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                🛒 Comprar Ahora
              </Button>
            </div>
          </div>
        </section>

        {/* ===== BARRA DE CONFIANZA ===== */}
        <section className="bg-primary py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-primary-foreground text-xs md:text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> +500 creadores
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current" /> 4.8/5
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Envío 24-48h
              </span>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 3: AUDIO ===== */}
        <section className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/3 audio.jpeg"
              alt="Micrófono REMAX K18"
              fill
              className="object-cover"
            />
            
            <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
            
            <div className="hidden md:flex absolute inset-0 items-center justify-end">
              <div className="max-w-xl text-right space-y-4 px-6 mr-12">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs">
                  🎤 Micrófono REMAX K18
                </span>
                <h2 className="text-4xl font-bold text-white">
                  Que te escuchen, <span className="text-primary">importa más.</span>
                </h2>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center justify-end gap-2">
                    Cancelación de Ruido IA <Check className="h-4 w-4 text-primary" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    Sistema Dual <Check className="h-4 w-4 text-primary" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    6h batería <Check className="h-4 w-4 text-primary" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:hidden bg-background p-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs">
                🎤 Micrófono REMAX K18
              </span>
              <h2 className="text-2xl font-bold">
                Que te escuchen, <span className="text-primary">importa más.</span>
              </h2>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Cancelación de Ruido IA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Sistema Dual
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 6h batería
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 4: ESTABILIZACIÓN ===== */}
        <section className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/4 estalibizacionb.jpeg"
              alt="Gimbal KM01"
              fill
              className="object-cover"
            />
            
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            <div className="hidden md:flex absolute inset-0 items-center">
              <div className="max-w-xl space-y-4 px-6 ml-12">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs">
                  📹 Gimbal KM01
                </span>
                <h2 className="text-4xl font-bold text-white">
                  Muévete. <span className="text-primary">Tu imagen sigue estable.</span>
                </h2>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> 3 en 1: Gimbal + Selfie + Trípode
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Luz LED incorporada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Rotación 360°
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:hidden bg-background p-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs">
                📹 Gimbal KM01
              </span>
              <h2 className="text-2xl font-bold">
                Muévete. <span className="text-primary">Tu imagen sigue estable.</span>
              </h2>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 3 en 1: Gimbal + Selfie + Trípode
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Luz LED incorporada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Rotación 360°
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 5: PROFESIONAL ===== */}
        <section className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/5 profesional.jpeg"
              alt="Resultado profesional"
              fill
              className="object-cover"
            />
            
            <div className="hidden md:flex absolute inset-0 items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 space-y-4 text-center max-w-lg">
                <h2 className="text-4xl font-bold text-white">
                  Esto ya se ve <span className="text-primary">profesional.</span>
                </h2>
                <p className="text-white/80 text-lg">Y no necesitas un estudio.</p>
                <div className="flex justify-center gap-8 pt-2">
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">2</div>
                    <div className="text-sm text-white/70">Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">∞</div>
                    <div className="text-sm text-white/70">Posibilidades</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:hidden bg-background p-6">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold">
                Esto ya se ve <span className="text-primary">profesional.</span>
              </h2>
              <p>Y no necesitas un estudio.</p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">2</div>
                  <div className="text-xs text-muted-foreground">Productos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">∞</div>
                  <div className="text-xs text-muted-foreground">Posibilidades</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 6: CTA FINAL ===== */}
        <section id="comprar" className="w-full">
          <div className="relative w-full aspect-[4/5] md:aspect-video">
            <Image
              src="/images/landing/6 cta.jpeg"
              alt="Compra Kit Esencial"
              fill
              className="object-cover"
            />
            
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="hidden md:flex absolute inset-0 items-center justify-center">
              <div className="max-w-2xl space-y-6 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/30 border border-green-500/50 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-green-400">¡Últimas unidades!</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-white">
                  Crea contenido <span className="text-primary">profesional.</span>
                </h2>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-white">
                    <Mic className="h-5 w-5 text-primary" />
                    <span className="text-sm">Micrófono REMAX K18</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="text-sm">Gimbal KM01</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                    <span className="text-white/60 text-sm line-through">$420.000</span>
                    <span className="font-black text-primary text-3xl">$299.900</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-white/80 text-xs">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                    <Truck className="h-3 w-3" /> Envío Gratis
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> Pago Contra Entrega
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                    <Award className="h-3 w-3" /> 30 días garantía
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={handleBuyKitEsencial}
                  className="text-xl px-12 py-8 font-black bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                  🛒 ¡LO QUIERO! - $299.900
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:hidden bg-background p-6">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/30 border border-green-500/50 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-400">¡Últimas unidades!</span>
              </div>
              
              <h2 className="text-2xl font-bold">
                Crea contenido <span className="text-primary">profesional.</span>
              </h2>

              <div className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-primary" />
                  <span className="text-sm">Micrófono REMAX K18</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="text-sm">Gimbal KM01</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-muted-foreground text-sm line-through">$420.000</span>
                  <span className="font-black text-primary text-2xl">$299.900</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                  <Truck className="h-3 w-3" /> Envío Gratis
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> Pago Contra Entrega
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                  <Award className="h-3 w-3" /> 30 días garantía
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleBuyKitEsencial}
                className="w-full text-lg py-7 font-black bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                🛒 ¡LO QUIERO! - $299.900
              </Button>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {[
                { q: '¿Funciona con mi celular?', a: 'Sí, compatible con USB-C y todos los smartphones.' },
                { q: '¿Cómo es el envío?', a: 'Envío gratis, llega en 2-5 días hábiles.' },
                { q: '¿Puedo pagar contra entrega?', a: '¡Sí! Pagas cuando recibes.' },
                { q: '¿Tiene garantía?', a: '30 días de garantía.' },
              ].map((faq, i) => (
                <details key={i} className="group bg-card border rounded-xl p-4">
                  <summary className="font-semibold flex justify-between items-center cursor-pointer">
                    {faq.q}
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-muted-foreground text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FLOATING CTA (Mobile) ===== */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background to-transparent md:hidden">
          <Button
            size="lg"
            onClick={handleBuyKitEsencial}
            className="w-full text-base py-5 font-bold bg-primary text-primary-foreground rounded-full shadow-xl"
          >
            🛒 Comprar - $299.900
          </Button>
        </div>

      </main>

      <Footer />
    </>
  );
}