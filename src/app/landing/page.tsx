'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mic, Radio, Clock, Usb, Video, Battery, Sparkles, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LandingPage() {
  const router = useRouter();

  // Función para agregar el combo al carrito y redirigir
  function handleBuyComboPro() {
    const comboPro = {
      id: 'combo-pro',
      name: 'Combo PRO',
      price: 489900,
      quantity: 1,
      imageUrls: ['/images/combos/combo_1/combo1.png'],
      descripcion: 'Combo profesional con audio dual y estabilización inteligente. Incluye Gimbal KOOSDA KM03 y Micrófono REMAX K18.',
      category: {
        name: 'Combos',
        id: 'combos'
      },
      stock: 10, // Cantidad disponible
    };

    // Obtener carrito actual
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Verificar si ya existe
    const exists = cart.find((item: any) => item.id === comboPro.id);
    if (!exists) {
      cart.push(comboPro);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  return (
    <>
      <Header />

      <main>
        <section id="combos" className="py-12 bg-background">
          <div className="container mx-auto px-0">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Combo Pro</h2>
            
            <div className="space-y-24 max-w-7xl mx-auto">
              {/* Combo 1: Micrófono REMAX K18 */}
              <div>
                {/* Imagen grande ocupando todo el espacio vertical */}
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  {/* Imagen para escritorio */}
                  <Image
                    src="/images/combos/combo_1/combo_k18.png"
                    alt="REMAX Wireless Microphone K18"
                    fill
                    className="object-contain hidden md:block"
                  />
                  {/* Imagen para móvil */}
                  <Image
                    src="/images/combos/combo_1/combo_k18_mobile.png"
                    alt="REMAX Wireless Microphone K18 Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>

                {/* Detalles abajo sin contenedor */}
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-4xl font-bold mb-3 text-card-foreground">REMAX Wireless Microphone K18</h3>
                  <p className="text-2xl text-muted-foreground mb-8">Tu Voz, Sin Interrupciones</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <Mic className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Reduce Ruido con IA</p>
                        <p className="text-lg text-muted-foreground">Tu voz se escucha clara</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Radio className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Sistema 2 en 1</p>
                        <p className="text-lg text-muted-foreground">Ideal para entrevistas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">6 Horas de Batería</p>
                        <p className="text-lg text-muted-foreground">Graba por más tiempo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Usb className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Fácil de Usar (Tipo-C)</p>
                        <p className="text-lg text-muted-foreground">Conecta y graba al instante</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xl font-semibold text-muted-foreground mb-2">Audio Profesional. Conexión Fácil.</p>
                    <p className="text-muted-foreground">Micrófono dual diseñado para creadores</p>
                  </div>
                </div>
              </div>

              {/* Combo 2: Kit PRO Gimbal + Micrófono */}
              <div>
                {/* Imagen grande ocupando todo el espacio vertical */}
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  {/* Imagen para escritorio */}
                  <Image
                    src="/images/combos/combo_1/combo1.png"
                    alt="Combo PRO: Audio Dual y Estabilización Inteligente"
                    fill
                    className="object-contain hidden md:block"
                  />
                  {/* Imagen para móvil */}
                  <Image
                    src="/images/combos/combo_1/combo1_mobile.png"
                    alt="Combo PRO: Audio Dual y Estabilización Inteligente Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>

                {/* Detalles abajo sin contenedor */}
                <div className="max-w-4xl mx-auto text-center">
                  <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full inline-block mb-6">
                    <p className="text-sm font-bold">CALIDAD DE ESTUDIO, LIBERTAD TOTAL</p>
                  </div>
                  
                  <h3 className="text-4xl font-bold mb-3 text-card-foreground">Combo PRO</h3>
                  <p className="text-2xl text-muted-foreground mb-8">Audio Dual y Estabilización Inteligente</p>
                  
                  <div className="bg-accent border-l-4 border-primary p-8 mb-8 rounded inline-block">
                    <p className="font-semibold text-xl text-accent-foreground">"Graba con audio dual y estabilización inteligente."</p>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-6xl font-bold text-primary">$489.900 <span className="text-2xl text-muted-foreground">COP</span></p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
                    onClick={handleBuyComboPro}
                  >
                    Comprar el Kit PRO ahora
                  </Button>
                  
                  <div className="mt-6">
                    <p className="text-muted-foreground">Incluye: Gimbal KOOSDA KM03 + Micrófono REMAX K18</p>
                  </div>
                </div>
              </div>

              {/* Combo 3: KOOSDA Gimbal Stabilizer */}
              <div>
                {/* Imagen grande ocupando todo el espacio vertical */}
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  {/* Imagen para escritorio */}
                  <Image
                    src="/images/combos/combo_1/combo km03.png"
                    alt="KOOSDA 3-AXIS GIMBAL STABILIZER KM03"
                    fill
                    className="object-contain hidden md:block"
                  />
                  {/* Imagen para móvil */}
                  <Image
                    src="/images/combos/combo_1/combo_km03_mobile.png"
                    alt="KOOSDA 3-AXIS GIMBAL STABILIZER KM03 Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>

                {/* Detalles abajo sin contenedor */}
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-5xl font-bold mb-2 text-card-foreground text-center">Videos Fluidos.</h3>
                  <h4 className="text-5xl font-bold text-primary mb-12 text-center">Calidad de Cine.</h4>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="flex items-center gap-4">
                      <Video className="w-12 h-12 text-primary flex-shrink-0" />
                      <p className="font-semibold text-xl text-card-foreground">Estabilización 3 Ejes</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Battery className="w-12 h-12 text-primary flex-shrink-0" />
                      <p className="font-semibold text-xl text-card-foreground">8 Horas de Batería</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Sparkles className="w-12 h-12 text-primary flex-shrink-0" />
                      <p className="font-semibold text-xl text-card-foreground">Seguimiento con IA</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Lightbulb className="w-12 h-12 text-primary flex-shrink-0" />
                      <p className="font-semibold text-xl text-card-foreground">Luz de Relleno Integrada</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary text-secondary-foreground p-8 rounded-lg border border-border mb-8">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold">
                        KOOSDA
                      </div>
                      <p className="text-muted-foreground">PROD-KM03</p>
                    </div>
                    <p className="font-bold text-xl text-foreground">KOOSDA 3-AXIS GIMBAL STABILIZER KM03</p>
                  </div>
                  
                  <div className="text-center">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                      Graba como un Profesional
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </main>

      <Footer />
    </>
  );
}