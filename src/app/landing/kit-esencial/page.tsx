'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mic, Video, Clock, Usb, ShieldCheck, Truck, Award, RotateCw, Lightbulb, Smartphone, Play, Pause, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';

export default function KitEsencialPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Kit Esencial - CCS724',
    image: 'https://www.ccs724.com/images/combos/combos_2/kit_esencial.png',
    description: 'Kit esencial para creadores: incluye Micrófono REMAX K18 y KOOSDA Mini Gimbal KM01.',
    brand: {
      '@type': 'Brand',
      name: 'CCS724',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.ccs724.com/landing/kit-esencial',
      priceCurrency: 'COP',
      price: '299900',
      availability: 'https://schema.org/InStock',
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
      category: {
        name: 'Combos',
        id: 'combos'
      },
      stock: 15,
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find((item: any) => item.id === kitEsencial.id);
    if (!exists) {
      cart.push(kitEsencial);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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
        {/* HERO VIDEO SECTION */}
        <section className="relative w-full bg-black min-h-[calc(100vh-4rem)] flex flex-col">
          
          {/* VIDEO - Ocupa la mayor parte */}
          <div className="relative w-full flex-1 min-h-[50vh] md:min-h-[60vh]">
            <video
              ref={videoRef}
              src="/images/combos/combo_1/ESENCIAL REEL DESKTOP.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

            {/* Controles de video - Arriba derecha */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Badge flotante - Arriba izquierda */}
            <div className="absolute top-4 left-4 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary rounded-full shadow-lg">
                <span className="text-xs font-bold text-primary-foreground tracking-wide">
                  CCS724 • KIT ESENCIAL
                </span>
              </div>
            </div>
          </div>

          {/* CONTENIDO - Parte inferior sobre el video */}
          <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent -mt-32 pt-32 pb-6 px-4 md:px-8">
            <div className="container mx-auto max-w-4xl">
              <div className="space-y-4 text-center md:text-left">
                {/* Título */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Empieza a Crear <span className="text-primary">Como Profesional</span>
                </h1>

                {/* Descripción corta */}
                <p className="text-sm md:text-lg text-white/80 max-w-xl mx-auto md:mx-0">
                  Micrófono REMAX K18 + KOOSDA Mini Gimbal KM01
                </p>

                {/* Precio y beneficios */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-primary">
                      $299.900
                    </span>
                    <span className="text-sm text-white/70">COP</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-xs md:text-sm">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-primary" />
                      Envío Gratis
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Pago Contra Entrega
                    </span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleBuyKitEsencial}
                    className="flex-1 sm:flex-none text-base px-8 py-6 font-bold shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    Comprar Ahora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('detalles')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 sm:flex-none text-base px-8 py-6 font-semibold border-white/50 text-white hover:bg-white/20 hover:text-white rounded-full backdrop-blur-sm"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="flex justify-center pt-6">
                <button 
                  onClick={() => document.getElementById('confianza')?.scrollIntoView({ behavior: 'smooth' })}
                  className="animate-bounce text-white/50 hover:text-white/80 transition-colors"
                >
                  <ChevronDown className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE CONFIANZA */}
        <section id="confianza" className="bg-secondary/30 py-6 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Truck className="h-7 w-7 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-foreground text-sm md:text-base">Envío a toda Colombia</p>
                  <p className="text-xs text-muted-foreground">Rápido y seguro</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <ShieldCheck className="h-7 w-7 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-foreground text-sm md:text-base">Pago 100% Seguro</p>
                  <p className="text-xs text-muted-foreground">Transacciones protegidas</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Award className="h-7 w-7 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-foreground text-sm md:text-base">Garantía de Calidad</p>
                  <p className="text-xs text-muted-foreground">30 días de garantía</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RESUMEN DEL KIT */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-3">¿Qué incluye el Kit Esencial?</h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                Todo lo esencial para comenzar a crear contenido de calidad
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-center">REMAX Wireless K18</h3>
                  <p className="text-muted-foreground mb-4 text-center text-sm">Micrófono inalámbrico profesional</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Cancelación de Ruido IA</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Sistema 2 en 1</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> 6 Horas de Grabación</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Plug & Play (Tipo-C)</li>
                  </ul>
                </div>
                <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-center">KOOSDA Mini Gimbal KM01</h3>
                  <p className="text-muted-foreground mb-4 text-center text-sm">3 en 1: Gimbal, Selfie Stick y Trípode</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Diseño Mini Portátil</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Luz de Relleno Extraíble</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Rotación 360°</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Compatible con cualquier celular</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DETALLES DE PRODUCTOS */}
        <section id="detalles" className="py-12 md:py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="space-y-16 md:space-y-24 max-w-7xl mx-auto">
              
              {/* Producto 1: Micrófono */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 md:order-1">
                  <span className="text-primary font-semibold text-xs md:text-sm tracking-wider uppercase">Incluido en el Kit</span>
                  <h3 className="text-2xl md:text-4xl font-bold mt-2 mb-3">REMAX Wireless K18</h3>
                  <p className="text-lg md:text-xl text-muted-foreground mb-6">Audio Profesional. Conexión Instantánea.</p>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Mic className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Cancelación de Ruido IA</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Tu voz se escucha clara y nítida</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Video className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Sistema 2 en 1</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Ideal para entrevistas y contenido dual</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">6 Horas de Grabación</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Batería de larga duración</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Usb className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Plug & Play (Tipo-C)</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Conecta y graba al instante sin apps</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative h-[280px] md:h-[450px] w-full">
                  <Image 
                    src="/images/remax/115_K-18.png" 
                    alt="Micrófono REMAX K18" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Producto 2: Mini Gimbal */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="relative h-[280px] md:h-[450px] w-full">
                  <Image 
                    src="/images/remax/007_KM-01.png" 
                    alt="Gimbal KOOSDA KM01" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-primary font-semibold text-xs md:text-sm tracking-wider uppercase">Incluido en el Kit</span>
                  <h3 className="text-2xl md:text-4xl font-bold mt-2 mb-3">KOOSDA Mini Gimbal KM01</h3>
                  <p className="text-lg md:text-xl text-muted-foreground mb-6">3 en 1: Graba, Transmite, Captura.</p>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Gimbal, Selfie Stick y Trípode</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Versatilidad total para cualquier toma</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Luz de Relleno Extraíble</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Iluminación perfecta en cualquier lugar</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <Video className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Diseño Mini Portátil</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Cabe en tu bolsillo, listo para viajar</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border">
                      <RotateCw className="w-5 h-5 md:w-6 md:h-6 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-card-foreground text-sm md:text-base">Rotación 360°</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Captura todos los ángulos automáticamente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA FINAL */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-5xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              El Kit Esencial tiene todo lo que necesitas para comenzar tu camino como creador.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-lg md:text-xl rounded-full shadow-lg transition-transform hover:scale-105"
                onClick={handleBuyKitEsencial}
              >
                Comprar - $299.900
              </Button>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-4">Envío Gratis • Pago Contra Entrega • 30 días de garantía</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}