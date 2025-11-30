import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Clock, MapPin, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Envíos | CCS724',
  description: 'Información sobre tiempos de entrega, costos de envío y cobertura en Colombia.',
};

export default function PoliticaEnviosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-2 font-headline">Política de Envíos</h1>
      <p className="text-muted-foreground mb-8">Información sobre entregas y despachos</p>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              1. Tiempos de Procesamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Todos los pedidos se procesan y despachan en un plazo de <strong>1 a 2 días hábiles</strong> después de confirmado el pago.
            </p>
            <p>
              Los pedidos realizados los fines de semana o festivos se procesarán el siguiente día hábil.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              2. Tiempos de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Una vez despachado, el tiempo estimado de entrega depende de tu ubicación:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li><strong>Ciudades principales:</strong> 2 a 4 días hábiles.</li>
              <li><strong>Ciudades intermedias:</strong> 3 a 5 días hábiles.</li>
              <li><strong>Destinos especiales:</strong> 5 a 8 días hábiles.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              3. Cobertura y Transportadoras
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Realizamos envíos a todo el territorio nacional de Colombia a través de transportadoras certificadas como <strong>Servientrega, Interrapidísimo y Coordinadora</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              4. Costos de Envío
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Para pedidos inferiores a <strong>$200.000 COP</strong>, el costo del envío es de <strong>$15.000 COP</strong> a nivel nacional.
            </p>
            <p>
              Ofrecemos <strong>envío gratis</strong> en compras superiores a $200.000 COP (sujeto a cobertura).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}