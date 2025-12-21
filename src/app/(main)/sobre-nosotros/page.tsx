import { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, ShieldCheck, Package, Truck, Shield, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | CCS724 - Tecnología de Confianza en Colombia',
  description: 'CCS724 es operada por OG REAL ESTATE SAS (NIT 901067922-2). Tienda oficial de tecnología en Colombia con garantía, envíos seguros y atención personalizada. Fundada por Alejandro Sevilla Velez.',
  openGraph: {
    title: 'Sobre Nosotros | CCS724',
    description: 'Conoce la historia de CCS724, tu tienda de tecnología de confianza en Colombia',
    type: 'website',
  },
};

export default function SobreNosotrosPage() {
  return (
    <div className="bg-background">
      {/* Hero Banner - 21:9 ratio, responsive */}
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <Image
          src="/images/sobre-nosotros/banner-alejandro.jpeg"
          alt="CCS724 - Tecnología de Confianza"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {/* Copy debajo del banner */}
      <div className="container mx-auto px-4 pt-8 pb-4 max-w-6xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline">
          Sobre Nosotros
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Tecnología de calidad con respaldo colombiano
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Founder Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20 items-center">
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/sobre-nosotros/hero-alejandro-(1).jpeg"
                alt="Alejandro Sevilla Velez - Fundador de CCS724"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                Fundador y Director
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">
                Alejandro Sevilla Velez
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              <p>
                Con una visión clara de democratizar el acceso a la tecnología de calidad en Colombia, 
                Alejandro fundó CCS724 en Bogotá, estableciendo un nuevo estándar en el comercio 
                electrónico de accesorios tecnológicos.
              </p>
              <p>
                Su compromiso con la excelencia y la satisfacción del cliente ha convertido a CCS724 
                en un referente de confianza para miles de colombianos que buscan los mejores 
                productos tecnológicos con garantía y respaldo local.
              </p>
            </div>
          </div>
        </div>

        {/* Company Information - Critical for Google Merchant Center */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center font-headline">
            Información Empresarial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Razón Social</p>
                <p className="text-lg font-bold">OG REAL ESTATE SAS</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">NIT</p>
                <p className="text-lg font-bold">901067922-2</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Nombre Comercial</p>
                <p className="text-lg font-bold">CCS724</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Ciudad</p>
                <p className="text-lg font-bold">Bogotá, Colombia</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Fundador</p>
                <p className="text-lg font-bold">Alejandro Sevilla Velez</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Registro Comercial</p>
                <p className="text-lg font-bold">Cámara de Comercio de Bogotá</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission, Vision & Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center font-headline">
            Nuestros Pilares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Proporcionar tecnología de vanguardia con un servicio al cliente excepcional, 
                  garantizando calidad, autenticidad y confianza en cada compra realizada en Colombia.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Nuestros Valores</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Honestidad, transparencia y compromiso. Construimos relaciones duraderas 
                  con nuestros clientes basadas en la confianza y el respeto mutuo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Garantía de Calidad</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Seleccionamos cuidadosamente cada producto de nuestro catálogo, asegurando 
                  que cumpla con los más altos estándares de calidad y autenticidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-headline">
              Nuestra Historia
            </h2>
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-xl">
                Fundada en Bogotá, Colombia, CCS724 nació con el objetivo de simplificar 
                la búsqueda de accesorios tecnológicos de calidad y autenticidad garantizada.
              </p>
              <p>
                Entendimos que los usuarios colombianos necesitaban un lugar donde no solo 
                encontraran productos originales, sino también asesoría especializada, 
                garantía respaldada y un servicio postventa confiable.
              </p>
              <p>
                A lo largo de los años, hemos crecido gracias a la confianza de miles de 
                clientes satisfechos en todo el territorio nacional. Hoy en día, seguimos 
                innovando y ampliando nuestro catálogo para traerte lo último en tecnología 
                móvil, audio y accesorios inteligentes, siempre con productos 100% originales.
              </p>
              <p>
                Cada producto que ofrecemos pasa por un riguroso proceso de selección y 
                verificación de autenticidad, garantizando que nuestros clientes reciban 
                exactamente lo que esperan: calidad, innovación y tranquilidad.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us - Important for Google Merchant Center Trust */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-12 text-center font-headline">
            ¿Por Qué Elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Productos Originales</h3>
              <p className="text-sm text-muted-foreground">
                100% auténticos con garantía de fábrica
              </p>
            </div>

            <div className="text-center">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Envíos Seguros</h3>
              <p className="text-sm text-muted-foreground">
                A todo Colombia con seguimiento en tiempo real
              </p>
            </div>

            <div className="text-center">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Garantía Respaldada</h3>
              <p className="text-sm text-muted-foreground">
                Servicio postventa y soporte técnico
              </p>
            </div>

            <div className="text-center">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Empresa Registrada</h3>
              <p className="text-sm text-muted-foreground">
                NIT 901067922-2 verificado ante DIAN
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-20">
          <p className="text-lg text-muted-foreground mb-4">
            Gracias por elegirnos y ser parte de nuestra comunidad tecnológica.
          </p>
          <p className="text-sm text-muted-foreground">
            ¿Tienes preguntas? Estamos aquí para ayudarte.
          </p>
        </div>
      </div>
    </div>
  );
}