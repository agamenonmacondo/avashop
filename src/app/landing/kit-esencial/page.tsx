'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mic, Video, Clock, Usb, ShieldCheck, Truck, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function KitEsencialPage() {
  const router = useRouter();

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

  return (
    <>
      <Header />

      <main>
        <section id="kit-esencial" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            
            {/* HERO SECTION: Título, Precio y CTA PRIMERO */}
            <div className="text-center max-w-4xl mx-auto mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">Kit Esencial</h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                Incluye Micrófono REMAX K18 y KOOSDA Mini Gimbal KM01
              </p>
              
              <div className="mb-6">
                <p className="text-5xl font-bold text-primary">$299.900 <span className="text-2xl text-muted-foreground">COP</span></p>
              </div>

              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-xl rounded-full shadow-lg transition-transform hover:scale-105 mb-4"
                onClick={handleBuyKitEsencial}
              >
                Comprar Kit Esencial
              </Button>
              <p className="text-sm text-muted-foreground">Envío Gratis • Pago Contra Entrega</p>
            </div>
            
            {/* Video demostrativo PRINCIPAL (Único video) */}
            <div className="relative h-[75vh] md:h-[85vh] min-h-[600px] mb-12 w-full mx-auto">
              <video
                src="/images/combos/combo_1/ESENCIAL REEL DESKTOP.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="object-contain hidden md:block w-full h-full"
                style={{ position: 'absolute', inset: 0 }}
              />
              <video
                src="/images/combos/combo_1/ESENCIAL MOBILE.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="object-contain block md:hidden w-full h-full"
                style={{ position: 'absolute', inset: 0 }}
              />
            </div>

            {/* Características detalladas (Resumen) */}
            <div className="max-w-4xl mx-auto text-center px-4">
              <div className="grid md:grid-cols-2 gap-8 mb-8 text-left md:text-center">
                <div>
                  <Mic className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-xl text-card-foreground">REMAX Wireless Microphone K18</p>
                  <ul className="mt-2 text-muted-foreground space-y-1 list-disc list-inside md:list-none">
                    <li>Cancelación de Ruido IA</li>
                    <li>Sistema 2 en 1</li>
                    <li>6 Horas de Grabación</li>
                    <li>Plug & Play (Tipo-C)</li>
                  </ul>
                </div>
                <div>
                  <Video className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-xl text-card-foreground">KOOSDA Mini Gimbal KM01</p>
                  <ul className="mt-2 text-muted-foreground space-y-1 list-disc list-inside md:list-none">
                    <li>Gimbal, Selfie Stick y Trípode</li>
                    <li>Luz de Relleno Extraíble</li>
                    <li>Diseño Mini Portátil</li>
                    <li>Rotación 360°</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE CONFIANZA */}
          <div className="bg-secondary/20 py-8 border-y border-border/50 my-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <Truck className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-bold text-foreground">Envío a toda Colombia</p>
                    <p className="text-xs text-muted-foreground">Rápido y seguro</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-bold text-foreground">Pago 100% Seguro</p>
                    <p className="text-xs text-muted-foreground">Transacciones protegidas</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-bold text-foreground">Garantía de Calidad</p>
                    <p className="text-xs text-muted-foreground">30 días de garantía</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de los productos con imágenes a la derecha */}
          <div className="space-y-24 max-w-7xl mx-auto mt-16 px-4">
            
            {/* Producto 1: Micrófono REMAX Wireless K18 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <h3 className="text-3xl md:text-4xl font-bold mb-3 text-card-foreground">REMAX Wireless Microphone K18</h3>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">Audio Profesional. Conexión Instantánea.</p>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <Mic className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Cancelación de Ruido IA</p>
                      <p className="text-muted-foreground">Tu voz se escucha clara y nítida</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Sistema 2 en 1</p>
                      <p className="text-muted-foreground">Ideal para entrevistas y contenido dual</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">6 Horas de Grabación</p>
                      <p className="text-muted-foreground">Batería de larga duración</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Usb className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Plug & Play (Tipo-C)</p>
                      <p className="text-muted-foreground">Conecta y graba al instante sin apps</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Imagen del Micrófono */}
              <div className="order-2 relative h-[400px] md:h-[500px] w-full flex items-center justify-center">
                 <Image 
                    src="/images/remax/115_K-18.png" 
                    alt="Micrófono REMAX K18" 
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                 />
              </div>
            </div>

            {/* Producto 2: KOOSDA Mini Gimbal KM01 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <h3 className="text-3xl md:text-4xl font-bold mb-3 text-card-foreground">KOOSDA Mini Gimbal KM01</h3>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">3 en 1: Graba, Transmite, Captura.</p>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <Video className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Gimbal, Selfie Stick y Trípode</p>
                      <p className="text-muted-foreground">Versatilidad total para cualquier toma</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Luz de Relleno Extraíble</p>
                      <p className="text-muted-foreground">Iluminación perfecta en cualquier lugar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Diseño Mini Portátil</p>
                      <p className="text-muted-foreground">Cabe en tu bolsillo, listo para viajar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-card-foreground">Rotación 360°</p>
                      <p className="text-muted-foreground">Captura todos los ángulos automáticamente</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Imagen del Gimbal */}
              <div className="order-2 relative h-[400px] md:h-[500px] w-full flex items-center justify-center">
                 <Image 
                    src="/images/remax/007_KM-01.png" 
                    alt="Gimbal KOOSDA KM01" 
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                 />
              </div>
            </div>
          </div>
          
          {/* CTA FINAL */}
          <div className="py-16 text-center mt-12">
             <h2 className="text-3xl font-bold mb-6">¿Listo para empezar?</h2>
             <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-xl rounded-full shadow-lg transition-transform hover:scale-105"
                onClick={handleBuyKitEsencial}
              >
                Comprar Kit Esencial - $299.900
              </Button>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}