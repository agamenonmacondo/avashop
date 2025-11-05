'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mic, Video, Clock, Usb } from 'lucide-react';
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
          <div className="container mx-auto px-0">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Kit Esencial</h2>
            
            {/* Combo principal */}
            <div className="space-y-12 max-w-7xl mx-auto">
              <div>
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  <Image
                    src="/images/combos/combos_2/kit_esencial.png"
                    alt="Kit Esencial"
                    fill
                    className="object-contain hidden md:block"
                  />
                  <Image
                    src="/images/combos/combos_2/kit_esencial_mobile.png"
                    alt="Kit Esencial Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-4xl font-bold mb-3 text-card-foreground">Kit Esencial</h3>
                  <p className="text-2xl text-muted-foreground mb-8">Incluye Micrófono REMAX K18 y KOOSDA Mini Gimbal KM01</p>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <Mic className="w-10 h-10 text-primary mx-auto mb-2" />
                      <p className="font-semibold text-xl text-card-foreground">REMAX Wireless Microphone K18</p>
                      <ul className="mt-2 text-muted-foreground space-y-1">
                        <li>Cancelación de Ruido IA</li>
                        <li>Sistema 2 en 1</li>
                        <li>6 Horas de Grabación</li>
                        <li>Plug & Play (Tipo-C)</li>
                      </ul>
                    </div>
                    <div>
                      <Video className="w-10 h-10 text-primary mx-auto mb-2" />
                      <p className="font-semibold text-xl text-card-foreground">KOOSDA Mini Gimbal KM01</p>
                      <ul className="mt-2 text-muted-foreground space-y-1">
                        <li>Gimbal, Selfie Stick y Trípode</li>
                        <li>Luz de Relleno Extraíble</li>
                        <li>Diseño Mini Portátil</li>
                        <li>Rotación 360°</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mb-8">
                    <p className="text-5xl font-bold text-primary">$299.900 <span className="text-2xl text-muted-foreground">COP</span></p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
                    onClick={handleBuyKitEsencial}
                  >
                    Comprar Kit Esencial
                  </Button>
                </div>
              </div>
            </div>

            {/* Imágenes y descripciones de los productos del combo */}
            <div className="space-y-24 max-w-7xl mx-auto mt-16">
              {/* Producto 1: Micrófono REMAX Wireless K18 */}
              <div>
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  <Image
                    src="/images/combos/combos_2/combo_k18.png"
                    alt="REMAX Wireless Microphone K18"
                    fill
                    className="object-contain hidden md:block"
                  />
                  <Image
                    src="/images/combos/combos_2/combo_k18_mobile.png"
                    alt="REMAX Wireless Microphone K18 Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-4xl font-bold mb-3 text-card-foreground">REMAX Wireless Microphone K18</h3>
                  <p className="text-2xl text-muted-foreground mb-8">Audio Profesional. Conexión Instantánea.</p>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <Mic className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Cancelación de Ruido IA</p>
                        <p className="text-lg text-muted-foreground">Tu voz se escucha clara</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Video className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Sistema 2 en 1</p>
                        <p className="text-lg text-muted-foreground">Ideal para entrevistas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">6 Horas de Grabación</p>
                        <p className="text-lg text-muted-foreground">Graba por más tiempo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Usb className="w-10 h-10 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-xl text-card-foreground">Plug & Play (Tipo-C)</p>
                        <p className="text-lg text-muted-foreground">Conecta y graba al instante</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Producto 2: KOOSDA Mini Gimbal KM01 */}
              <div>
                <div className="relative h-[70vh] min-h-[800px] mb-8">
                  <Image
                    src="/images/combos/combos_2/mini_gymbal.png"
                    alt="KOOSDA Mini Gimbal KM01"
                    fill
                    className="object-contain hidden md:block"
                  />
                  <Image
                    src="/images/combos/combos_2/mini_gymbal_mobile.png"
                    alt="KOOSDA Mini Gimbal KM01 Mobile"
                    fill
                    className="object-contain block md:hidden"
                  />
                </div>
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-4xl font-bold mb-3 text-card-foreground">KOOSDA Mini Gimbal KM01</h3>
                  <p className="text-2xl text-muted-foreground mb-8">3 en 1: Graba, Transmite, Captura.</p>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="font-semibold text-xl text-card-foreground mb-2">Gimbal, Selfie Stick y Trípode</p>
                      <p className="text-lg text-muted-foreground">Versatilidad para grabar en cualquier lugar</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xl text-card-foreground mb-2">Luz de Relleno Extraíble</p>
                      <p className="text-lg text-muted-foreground">Iluminación portátil para tus videos</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xl text-card-foreground mb-2">Diseño Mini Portátil</p>
                      <p className="text-lg text-muted-foreground">Fácil de llevar y usar</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xl text-card-foreground mb-2">Rotación 360°</p>
                      <p className="text-lg text-muted-foreground">Captura todos los ángulos</p>
                    </div>
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