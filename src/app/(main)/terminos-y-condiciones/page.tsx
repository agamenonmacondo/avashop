import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, ShoppingBag, Truck, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | CCS724',
  description: 'Términos y condiciones de uso del sitio web CCS724 en Colombia.',
};

export default function TerminosCondicionesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-2 font-headline">Términos y Condiciones</h1>
      <p className="text-muted-foreground mb-8">Última actualización: {new Date().getFullYear()}</p>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              1. Aspectos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Bienvenido a <strong>CCS724</strong>. Al acceder y utilizar nuestro sitio web, aceptas estar sujeto a los siguientes términos y condiciones. Este sitio es operado desde Colombia y se rige por las leyes de la República de Colombia.
            </p>
            <p>
              Nos reservamos el derecho de actualizar o cambiar estos términos en cualquier momento sin previo aviso. Es tu responsabilidad revisarlos periódicamente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              2. Precios y Pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Todos los precios mostrados en el sitio web están expresados en <strong>Pesos Colombianos (COP)</strong> e incluyen los impuestos aplicables, salvo que se indique lo contrario.
            </p>
            <p>
              Nos reservamos el derecho de modificar los precios de los productos en cualquier momento. Sin embargo, se respetará el precio vigente al momento de confirmar tu pedido.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              3. Envíos y Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Realizamos envíos a la mayor parte del territorio colombiano. Los tiempos de entrega son estimados y pueden variar debido a factores logísticos o de fuerza mayor.
            </p>
            <p>
              El costo del envío será informado antes de finalizar la compra. Es responsabilidad del cliente proporcionar una dirección exacta y completa para la entrega.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              4. Derecho de Retracto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              De acuerdo con la Ley 1480 de 2011 (Estatuto del Consumidor), tienes derecho a retractarte de tu compra dentro de los <strong>5 días hábiles</strong> siguientes a la entrega del producto.
            </p>
            <p>
              El producto debe ser devuelto en las mismas condiciones en que lo recibiste (nuevo, sin uso, con todos sus empaques y accesorios). Los costos de transporte por devolución corren por cuenta del cliente.
            </p>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-6 rounded-lg mt-8 text-sm text-muted-foreground">
          <p>
            Para cualquier duda o consulta sobre estos términos, por favor contáctanos a través de nuestro correo electrónico: <strong>ventas@ccs724.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}