'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, ShieldCheck, Truck, Award, ChevronDown, Check, Star, Zap, Heart, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import { gtagViewItem, gtagAddToCart } from '@/lib/google-ads';

export default function ComboNavidenoPage() {
  const router = useRouter();

  useEffect(() => {
    gtagViewItem(145000, [{
      id: 'combo-navideno',
      name: 'Combo Navideño CCS724',
      price: 145000,
      quantity: 1,
    }]);
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Combo Navideño - CCS724',
    image: 'https://www.ccs724.com/images/combo_navideño/landing_1.JPG',
    description: 'Regalo familiar a precio inteligente: Masajeador facial + Smart Band + Consola Retro. Tecnología + bienestar + diversión en un solo regalo.',
    brand: { '@type': 'Brand', name: 'CCS724' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '243' },
    offers: {
      '@type': 'Offer',
      url: 'https://www.ccs724.com/landing/combo-navideno',
      priceCurrency: 'COP',
      price: '145000',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2025-12-31',
    },
  };

  function handleBuyComboNavideno() {
    const comboNavideno = {
      id: 'combo-navideno',
      name: 'Combo Navideño CCS724',
      price: 145000,
      quantity: 1,
      imageUrls: ['/images/combo_navideño/landing_1.JPG'],
      descripcion: 'Masajeador facial + Smart Band + Consola Retro - El regalo perfecto',
      category: { name: 'Combos', id: 'combos' },
      stock: 25,
    };
    gtagAddToCart(145000, [comboNavideno]);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find((item: any) => item.id === comboNavideno.id);
    if (!exists) cart.push(comboNavideno);
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  function handleWhatsAppInquiry() {
    const phoneNumber = '573504017710';
    const message = `¡Hola! Estoy interesado en el *Combo Navideño CCS724*

🎁 *3 productos por $145.000*
✅ Masajeador Facial
✅ Smart Band  
✅ Consola Retro (400 juegos)

Me gustaría saber:
• ¿Cómo funciona el *pago contra entrega*?
• ¿Cuándo llega mi pedido?
• ¿Tienen garantía?

Gracias 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
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
        
        {/* SECCIÓN 1: PROBLEMA - Regalo Familiar */}
        <section className="w-full">
          {/* Mobile: imagen + contenido debajo */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_1.JPG"
                alt="Regalo familiar a precio inteligente"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 rounded-full">
                  <Gift className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">OFERTA NAVIDEÑA</span>
                </div>
                
                <h1 className="text-2xl font-bold leading-tight">
                  Regalo familiar a precio <span className="text-primary">inteligente</span>
                </h1>
                <p className="text-base">
                  Masajeador + Smart Band + Consola Retro
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={scrollToBuy}
                    className="text-base px-8 py-6 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    Ver Oferta Especial →
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleWhatsAppInquiry}
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

          {/* Desktop: grid con imagen completa */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="relative col-span-2 aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_1.JPG"
                alt="Regalo familiar a precio inteligente"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 rounded-full">
                  <Gift className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white">OFERTA NAVIDEÑA</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Regalo familiar a precio <span className="text-primary">inteligente</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Masajeador + Smart Band + Consola Retro
                </p>
                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    onClick={scrollToBuy}
                    className="text-lg px-10 py-7 font-bold bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    Ver Oferta Especial →
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleWhatsAppInquiry}
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

        {/* SECCIÓN 2: DIVERSIÓN - Consola Retro */}
        <section className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing _2.JPG"
                alt="Diversión instantánea con 400 juegos clásicos"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/30 border border-purple-500/50 rounded-full">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400">DIVERSIÓN INSTANTÁNEA</span>
                </div>
                
                <h2 className="text-2xl font-bold leading-tight">
                  400 juegos clásicos<br />
                  <span className="text-primary">Sin internet. Para todos.</span>
                </h2>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> 400 juegos clásicos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Sin internet necesario
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Para niños y adultos
                  </li>
                </ul>

                <div className="bg-card border rounded-lg p-3">
                  <p className="text-sm font-semibold">
                    Un regalo que <span className="text-primary">reúne a la familia</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-bold text-purple-400">DIVERSIÓN INSTANTÁNEA</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  400 juegos clásicos<br />
                  <span className="text-primary">Sin internet. Para todos.</span>
                </h2>

                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>400 juegos clásicos precargados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Sin internet - Diversión instantánea</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Para niños y adultos</span>
                  </li>
                </ul>

                <div className="bg-card border-2 border-primary/20 rounded-xl p-5">
                  <p className="text-lg font-semibold">
                    Un regalo que <span className="text-primary">reúne a toda la familia</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="relative col-span-2 aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing _2.JPG"
                alt="Diversión instantánea con 400 juegos clásicos"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* BARRA DE CONFIANZA */}
        <section className="bg-primary py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-primary-foreground text-xs md:text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> +800 combos vendidos
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current" /> 4.9/5 estrellas
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Envío incluido
              </span>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: TECNOLOGÍA - Smart Band */}
        <section className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_3.JPG"
                alt="Tecnología útil para el día a día"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-blue-600/30 border border-blue-500/50 rounded-full text-xs">
                  ⌚ Smart Band
                </span>
                <h2 className="text-2xl font-bold">
                  Tecnología útil<br />
                  <span className="text-primary">Para el día a día</span>
                </h2>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Pasos y actividad
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Monitoreo de salud
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Liviana y cómoda
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="relative col-span-2 aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_3.JPG"
                alt="Tecnología útil para el día a día"
                fill
                className="object-contain"
              />
            </div>
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <span className="inline-block px-4 py-2 bg-blue-600/30 border border-blue-500/50 rounded-full text-sm">
                  ⌚ Smart Band
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Tecnología útil<br />
                  <span className="text-primary">Para el día a día</span>
                </h2>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Pasos y actividad diaria</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Monitoreo básico de salud</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Liviana y cómoda</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: RELAJACIÓN - Masajeador */}
        <section className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_4.JPG"
                alt="Relajación todos los días"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-pink-600/30 border border-pink-500/50 rounded-full text-xs">
                  💆 Masajeador Facial
                </span>
                <h2 className="text-2xl font-bold">
                  Relajación<br />
                  <span className="text-primary">todos los días</span>
                </h2>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Cara, cuello y ojos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Uso fácil en casa
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Ideal para desestresarse
                  </li>
                </ul>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-sm font-semibold">
                    Un regalo que <span className="text-primary">sí se usa</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-6">
                <span className="inline-block px-4 py-2 bg-pink-600/30 border border-pink-500/50 rounded-full text-sm">
                  💆 Masajeador Facial
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Relajación<br />
                  <span className="text-primary">todos los días</span>
                </h2>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" /> Cara, cuello y ojos
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" /> Uso fácil en casa
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" /> Ideal para desestresarse
                  </li>
                </ul>
                <div className="bg-card border-2 border-primary/20 rounded-xl p-5">
                  <p className="text-lg font-semibold">
                    Un regalo que <span className="text-primary">sí se usa</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="relative col-span-2 aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_4.JPG"
                alt="Relajación todos los días"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: COMBO COMPLETO */}
        <section className="w-full">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_5.JPG"
                alt="Combo Navideño para quedar bien sin gastar de más"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-background p-6">
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 rounded-full">
                  <Gift className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">COMBO NAVIDEÑO</span>
                </div>
                
                <h2 className="text-2xl font-bold">
                  Para quedar bien<br />
                  <span className="text-primary">sin gastar de más</span>
                </h2>
                
                <p className="text-sm">
                  Tecnología + bienestar + diversión en un solo regalo
                </p>

                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">3</div>
                    <div className="text-xs text-muted-foreground">Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">1</div>
                    <div className="text-xs text-muted-foreground">Precio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">∞</div>
                    <div className="text-xs text-muted-foreground">Sonrisas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-0">
            <div className="relative col-span-2 aspect-[4/5]">
              <Image
                src="/images/combo_navideño/landing_5.JPG"
                alt="Combo Navideño para quedar bien sin gastar de más"
                fill
                className="object-contain"
              />
            </div>
            <div className="col-span-3 flex items-center justify-center bg-background p-12">
              <div className="max-w-xl space-y-8 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/80 rounded-full">
                  <Gift className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white">COMBO NAVIDEÑO</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Para quedar bien<br />
                  <span className="text-primary">sin gastar de más</span>
                </h2>
                
                <p className="text-xl text-muted-foreground">
                  Tecnología + bienestar + diversión<br />
                  en un solo regalo
                </p>

                <div className="flex justify-center gap-12 pt-4">
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">3</div>
                    <div className="text-sm text-muted-foreground mt-1">Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">1</div>
                    <div className="text-sm text-muted-foreground mt-1">Precio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary">∞</div>
                    <div className="text-sm text-muted-foreground mt-1">Sonrisas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: CTA FINAL */}
        <section id="comprar" className="w-full bg-gradient-to-b from-background to-primary/10 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-primary p-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-xs font-medium text-white">¡Unidades limitadas!</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Aprovecha el Combo Navideño
                </h2>
                <p className="text-white/90">de CCS724</p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                
                {/* Products List */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Consola Retro SUP</h3>
                      <p className="text-sm text-muted-foreground">400 juegos clásicos · Sin internet · Para toda la familia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Smart Band</h3>
                      <p className="text-sm text-muted-foreground">Monitoreo diario · Pasos · Salud básica</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                      <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Masajeador Facial</h3>
                      <p className="text-sm text-muted-foreground">Cara · Cuello · Ojos · Relajación diaria</p>
                    </div>
                  </div>
                </div>

                {/* Price Box */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-lg line-through">Antes $180.000</span>
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">-19%</span>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-black text-primary">$145.000</div>
                    <p className="text-sm text-muted-foreground mt-2">Envío incluido</p>
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
                    onClick={handleBuyComboNavideno}
                    className="w-full text-xl py-8 font-black bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform"
                  >
                    <Gift className="h-6 w-6 mr-2" />
                    ¡LO QUIERO! - $145.000
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleWhatsAppInquiry}
                    variant="outline"
                    className="w-full text-lg py-7 font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full shadow-xl hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Preguntar por WhatsApp
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  🎄 Oferta válida por tiempo limitado
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
                { q: '¿Qué incluye el combo?', a: 'Masajeador facial + Smart Band + Consola Retro con 400 juegos. Todo en una sola compra.' },
                { q: '¿La consola necesita internet?', a: 'No, trae 400 juegos precargados. Funciona sin internet.' },
                { q: '¿Cómo funciona el envío?', a: 'Envío GRATIS a toda Colombia. Llega en 2-5 días hábiles.' },
                { q: '¿Puedo pagar al recibir?', a: '¡Sí! Aceptamos pago contra entrega.' },
                { q: '¿Tiene garantía?', a: '30 días de garantía en todos los productos del combo.' },
                { q: '¿Es buen regalo?', a: 'Perfecto para Navidad. Tiene algo para todos: tecnología, bienestar y diversión.' },
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

        {/* SOCIAL PROOF */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">Lo que dicen nuestros clientes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'María G.', text: 'El mejor regalo de Navidad. A mi mamá le encantó el masajeador y mis hijos no sueltan la consola.', stars: 5 },
                { name: 'Carlos R.', text: 'Excelente relación calidad-precio. Llegó rápido y todo funciona perfecto.', stars: 5 },
                { name: 'Laura M.', text: 'Compré 3 combos para regalos. Súper recomendado, tiene de todo.', stars: 5 },
              ].map((review, i) => (
                <div key={i} className="bg-card border rounded-xl p-5 space-y-3">
                  <div className="flex gap-1">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">&quot;{review.text}&quot;</p>
                  <p className="text-sm font-semibold">- {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLOATING CTA (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background via-background to-transparent md:hidden">
          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={handleBuyComboNavideno}
              className="flex-1 text-base py-5 font-bold bg-primary text-primary-foreground rounded-full shadow-xl"
            >
              🎁 $145.000
            </Button>
            <Button
              size="lg"
              onClick={handleWhatsAppInquiry}
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