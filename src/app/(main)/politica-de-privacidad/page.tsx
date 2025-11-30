import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Eye, UserCheck, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | CCS724',
  description: 'Política de tratamiento de datos personales de CCS724 conforme a la ley colombiana.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-2 font-headline">Política de Privacidad</h1>
      <p className="text-muted-foreground mb-8">Cumplimiento Ley 1581 de 2012 (Habeas Data)</p>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              1. Responsable del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              <strong>CCS724</strong> es el responsable del tratamiento de los datos personales recolectados a través de este sitio web. Estamos comprometidos con la protección de tu privacidad y el manejo seguro de tu información.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              2. Datos que Recolectamos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Para procesar tus pedidos y mejorar tu experiencia, podemos solicitar la siguiente información:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Nombre completo e identificación.</li>
              <li>Información de contacto (correo electrónico, número de teléfono, dirección física).</li>
              <li>Información de pago y facturación.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              3. Finalidad del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Tus datos personales serán utilizados para:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Procesar, enviar y entregar tus pedidos.</li>
              <li>Enviar notificaciones sobre el estado de tu compra.</li>
              <li>Responder a tus consultas, quejas o reclamos.</li>
              <li>Enviar información promocional (solo si has dado tu autorización expresa).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              4. Tus Derechos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Como titular de los datos, tienes derecho a:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Conocer, actualizar y rectificar tus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios constitucionales y legales.</li>
              <li>Acceder en forma gratuita a tus datos personales.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-6 rounded-lg mt-8 text-sm text-muted-foreground">
          <p>
            Para ejercer tus derechos de Habeas Data, puedes escribirnos al correo: <strong>ventas@ccs724.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}