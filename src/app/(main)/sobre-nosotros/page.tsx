import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | CCS724',
  description: 'Conoce más sobre CCS724, tu tienda de tecnología de confianza en Colombia.',
};

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Sobre Nosotros</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          En CCS724, nos apasiona la tecnología y creemos en hacerla accesible para todos. 
          Somos una empresa colombiana dedicada a ofrecer los mejores gadgets y accesorios del mercado.
        </p>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center p-6 border-none shadow-md bg-secondary/5">
          <CardContent className="pt-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Nuestra Misión</h3>
            <p className="text-muted-foreground">
              Proporcionar tecnología de vanguardia con un servicio al cliente excepcional, 
              garantizando calidad y confianza en cada compra.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 border-none shadow-md bg-secondary/5">
          <CardContent className="pt-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Nuestros Valores</h3>
            <p className="text-muted-foreground">
              Honestidad, transparencia y compromiso. Nos esforzamos por construir relaciones 
              duraderas con nuestros clientes basadas en la confianza.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 border-none shadow-md bg-secondary/5">
          <CardContent className="pt-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Garantía de Calidad</h3>
            <p className="text-muted-foreground">
              Seleccionamos cuidadosamente cada producto de nuestro catálogo para asegurar 
              que cumpla con los más altos estándares de calidad y durabilidad.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Story Section */}
      <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Nuestra Historia</h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              Fundada en Bogotá, CCS724 nació con el objetivo de simplificar la búsqueda de accesorios tecnológicos de calidad en Colombia. Entendimos que los usuarios necesitaban un lugar donde no solo encontraran productos, sino también asesoría y respaldo.
            </p>
            <p>
              A lo largo de los años, hemos crecido gracias a la confianza de miles de clientes satisfechos. Hoy en día, seguimos innovando y ampliando nuestro catálogo para traerte lo último en tecnología móvil, audio y accesorios inteligentes.
            </p>
            <p>
              Gracias por elegirnos y ser parte de nuestra comunidad tecnológica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}