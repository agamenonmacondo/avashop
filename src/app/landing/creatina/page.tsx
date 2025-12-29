'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, ShoppingCart, Check, Star, Truck, ShieldCheck, Award, Heart, Zap, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import { gtagViewItem, gtagAddToCart } from '@/lib/google-ads';

export default function CreatinaLanding() {
  const router = useRouter();
  const phone = '573504017710';

  useEffect(() => {
    gtagViewItem(65000, [{
      id: 'creatina-for-women',
      name: 'Creatina Monohidrato – For Women',
      price: 65000,
      quantity: 1,
    }]);
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Creatina Monohidrato – For Women',
    image: 'https://www.ccs724.com/images/creatina/landing 1.jpeg',
    description:
      'Creatina monohidrato para suplementación deportiva. Diseñada para complementar la dieta de personas físicamente activas que realizan entrenamientos de alta intensidad. Siga la dosis recomendada y consulte con un profesional de la salud en caso de dudas. No está destinada a diagnosticar, tratar o curar enfermedades. Los resultados pueden variar.',
    brand: { '@type': 'Brand', name: 'CCS724' },
     offers: {
       '@type': 'Offer',
       url: 'https://www.ccs724.com/landing/creatina',
       priceCurrency: 'COP',
       price: '65000',
       availability: 'https://schema.org/InStock',
       priceValidUntil: '2025-12-31',
     },
   };

  function buyNow() {
    const product = {
      id: 'creatina-for-women',
      name: 'Creatina Monohidrato – For Women',
      price: 65000,
      quantity: 1,
      imageUrls: ['/images/creatina/landing 1.jpeg'],
      stock: 50,
    };
    gtagAddToCart(65000, [product]);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.find((i: any) => i.id === product.id)) cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  function openWhatsApp() {
    const msg = encodeURIComponent('Hola, quiero más info / comprar la creatina for women.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  const scrollToBuy = () => {
    const element = document.getElementById('comprar');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />

      <Header />

      <main className="pt-16">
        {/* SECCIÓN 1: PROBLEMA - Energía y Fuerza */}
        <section className="w-full">
          {/* Mobile: imagen + contenido debajo */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[9/16]">
              <Image
                src="/images/creatina/landing 1.jpeg"
                alt="Potencia tu energía y fuerza con creatina"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 rounded-full">
                  <Zap className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">ENERGÍA FEMENINA</span>
                </div>

                <h1 className="text-2xl font-bold leading-tight">
                  Potencia tu <span className="text-primary">energía y fuerza</span>
                </h1>
                <p className="text-base">
                  Creatina Monohidrato diseñada para mujeres activas
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={scrollToBuy}
                    className="text-base px-8 py-6 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    Ver Beneficios →
                  </Button>
                  <Button
                    size="lg"
                    onClick={openWhatsApp}
                    variant="outline"
                    className="text-base px-8 py-6 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: grid con imagen 9:16 y texto */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="relative col-span-2 aspect-[9/16]">
              <Image
                src="/images/creatina/landing 1.jpeg"
                alt="Potencia tu energía y fuerza con creatina"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 rounded-full">
                  <Zap className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white">ENERGÍA FEMENINA</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Potencia tu <span className="text-primary">energía y fuerza</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Creatina Monohidrato diseñada para mujeres activas
                </p>
                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    onClick={scrollToBuy}
                    className="text-lg px-10 py-7 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    Ver Beneficios →
                  </Button>
                  <Button
                    size="lg"
                    onClick={openWhatsApp}
                    variant="outline"
                    className="text-lg px-10 py-7 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-6 w-6 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: BENEFICIOS - Recuperación Muscular */}
        <section className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[9/16]">
              <Image
                src="/images/creatina/lanidng 2.jpeg"
                alt="Mejora recuperación y rendimiento muscular"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/30 border border-green-500/50 rounded-full">
                  <Heart className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-bold text-green-400">RECUPERACIÓN MUSCULAR</span>
                </div>

                <h2 className="text-2xl font-bold leading-tight">
                  Mejora tu <span className="text-primary">recuperación y rendimiento</span>
                </h2>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Aumenta fuerza y potencia
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Acelera recuperación post-entreno
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Ideal para fitness y gimnasio
                  </li>
                </ul>
                
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-sm font-semibold">
                    Suplemento diseñado para <span className="text-primary">complementar la dieta</span> en personas activas. Consulte con un profesional de la salud.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/30 border border-green-500/50 rounded-full">
                  <Heart className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-bold text-green-400">RECUPERACIÓN MUSCULAR</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Mejora tu <span className="text-primary">recuperación y rendimiento</span>
                </h2>

                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Puede ayudar a la fuerza y potencia muscular cuando se usa según indicaciones</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Apoya la recuperación post‑entreno en combinación con dieta y descanso</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Adecuado para personas activas que realizan entrenamientos de alta intensidad</span>
                  </li>
                </ul>

                <div className="bg-card border-2 border-primary/20 rounded-xl p-5">
                  <p className="text-lg font-semibold">
                    Suplemento diseñado para <span className="text-primary">complementar la dieta</span> en personas activas. Consulte con un profesional de la salud.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative col-span-2 aspect-[9/16]">
              <Image
                src="/images/creatina/lanidng 2.jpeg"
                alt="Mejora recuperación y rendimiento muscular"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* BARRA DE CONFIANZA */}
        <section className="bg-primary py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-primary-foreground text-xs md:text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> +500 mujeres activas
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current" /> 4.8/5 estrellas
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Envío incluido
              </span>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: CTA FINAL */}
        <section id="comprar" className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[9/16]">
              <Image
                src="/images/creatina/landing 3.jpeg"
                alt="Compra creatina para mujeres ahora"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 rounded-full">
                  <Zap className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">CREATINA PARA MUJERES</span>
                </div>

                <h2 className="text-2xl font-bold">
                  Energía que <span className="text-primary">transforma tu rutina</span>
                </h2>

                <p className="text-sm">
                  Monohidrato puro, sin aditivos, para resultados reales
                </p>

                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">Pura</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">5g</div>
                    <div className="text-xs text-muted-foreground">Dosis sugerida</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">Varía</div>
                    <div className="text-xs text-muted-foreground">Resultados individuales</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={buyNow}
                    className="w-full text-xl py-8 font-black bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform"
                  >
                    <ShoppingCart className="h-6 w-6 mr-2" />
                    ¡LO QUIERO! - $65.000
                  </Button>

                  <Button
                    size="lg"
                    onClick={openWhatsApp}
                    variant="outline"
                    className="w-full text-lg py-7 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Preguntar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="relative col-span-2 aspect-[9/16]">
              <Image
                src="/images/creatina/landing 3.jpeg"
                alt="Compra creatina para mujeres ahora"
                fill
                className="object-cover"
              />
            </div>
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-8 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600/80 rounded-full">
                  <Zap className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white">CREATINA PARA MUJERES</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Apoya tu <span className="text-primary">rutina de entrenamiento</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Monohidrato puro, sin aditivos. Resultados individuales pueden variar; siga la dosis recomendada.
                </p>

                <div className="flex justify-center gap-12 pt-4">
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">100%</div>
                    <div className="text-sm text-muted-foreground mt-1">Pura</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">5g</div>
                    <div className="text-sm text-muted-foreground mt-1">Dosis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">∞</div>
                    <div className="text-sm text-muted-foreground mt-1">Energía</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-lg">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Envío Gratis</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Pago Contra Entrega</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-lg">
                    <Award className="h-4 w-4 text-primary" />
                    <span>30 días garantía</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={buyNow}
                    className="w-full text-xl py-8 font-black bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform"
                  >
                    <ShoppingCart className="h-6 w-6 mr-2" />
                    ¡LO QUIERO! - $65.000
                  </Button>

                  <Button
                    size="lg"
                    onClick={openWhatsApp}
                    variant="outline"
                    className="w-full text-lg py-7 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Preguntar por WhatsApp
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  💪 Energía para mujeres activas
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {[
                { q: '¿Cómo tomar la creatina?', a: 'Mezcla 5 g con agua o jugo. Tomar según indicación del envase. Consulte a un profesional de la salud si tiene dudas.' },
                { q: '¿Es segura para mujeres?', a: 'Cuando se usa según indicaciones, la creatina es un suplemento comúnmente utilizado en deportistas; consulte con un profesional de la salud si tiene condiciones médicas.' },
                { q: '¿Cuánto tarda en hacer efecto?', a: 'Los efectos pueden variar entre personas; algunos notan cambios tras semanas de uso consistente.' },
                { q: '¿Puedo pagar al recibir?', a: '¡Sí! Aceptamos pago contra entrega.' },
                { q: '¿Tiene garantía?', a: '30 días de garantía. Si no te gusta, te devolvemos.' },
                { q: '¿Es para principiantes?', a: 'Perfecta para todas: principiantes y avanzadas en fitness.' },
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

        {/* Social proof removed — only show verified reviews via product pages or structured data */}

        {/* FLOATING CTA (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background via-background to-transparent md:hidden">
          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={buyNow}
              className="flex-1 text-base py-5 font-bold bg-primary text-primary-foreground rounded-full shadow-xl"
            >
              💪 $65.000
            </Button>
            <Button
              size="lg"
              onClick={openWhatsApp}
              variant="outline"
              className="flex-1 text-base py-5 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}