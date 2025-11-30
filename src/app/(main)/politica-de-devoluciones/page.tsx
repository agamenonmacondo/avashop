import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Mail, Phone, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Devoluciones | CCS724',
  description: 'Conoce nuestra política de devoluciones y garantías. Tienes 30 días para devolver productos en Colombia.',
};

export default function PoliticaDevolucionesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-6 font-headline">Política de Devoluciones y Garantías</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Plazo de Devolución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              En <strong>CCS724</strong> queremos que estés completamente satisfecho con tu compra. 
              Por ello, aceptamos devoluciones dentro de los <strong>30 días calendario</strong> posteriores 
              a la fecha de recepción del producto.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Condiciones para Devoluciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Para que tu devolución sea válida, el producto debe cumplir con las siguientes condiciones:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Estar en su <strong>empaque original</strong>, sin abrir ni alterar.</li>
              <li>Conservar todas las <strong>etiquetas, manuales y accesorios</strong> incluidos.</li>
              <li>No presentar señales de uso, daño o desgaste.</li>
              <li>Incluir la <strong>factura de compra</strong> o comprobante de pedido.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proceso de Devolución</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <strong>Contacta con nosotros:</strong> Envía un correo a{' '}
                <a href="mailto:ventas@ccs724.com" className="text-primary hover:underline">
                  ventas@ccs724.com
                </a>{' '}
                indicando tu número de pedido y el motivo de la devolución.
              </li>
              <li>
                <strong>Autorización:</strong> Nuestro equipo revisará tu solicitud y te enviará las instrucciones 
                para el envío de devolución en un plazo máximo de 48 horas hábiles.
              </li>
              <li>
                <strong>Envío del producto:</strong> Empaca el producto de forma segura y envíalo a la dirección 
                que te proporcionaremos. Los costos de envío de devolución corren por cuenta del cliente, salvo 
                que el producto presente defectos de fábrica o errores en el envío.
              </li>
              <li>
                <strong>Inspección:</strong> Una vez recibamos el producto, verificaremos que cumple con las 
                condiciones establecidas.
              </li>
              <li>
                <strong>Reembolso:</strong> Si la devolución es aprobada, procesaremos el reembolso del valor 
                del producto dentro de los <strong>5 a 10 días hábiles</strong> siguientes, mediante el mismo 
                método de pago utilizado en la compra original.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Excluidos de Devolución</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Los siguientes productos <strong>no son elegibles para devolución</strong>:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Productos en <strong>oferta o promoción especial</strong> (salvo defecto de fábrica).</li>
              <li>Productos personalizados o hechos a medida.</li>
              <li>Productos con empaques abiertos o dañados por el cliente.</li>
              <li>Productos adquiridos hace más de 30 días.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garantía del Fabricante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Todos nuestros productos cuentan con la <strong>garantía del fabricante</strong> según las 
              especificaciones de cada marca. En caso de defectos de fábrica o mal funcionamiento durante 
              el período de garantía, gestionaremos la reparación o reemplazo del producto sin costo adicional.
            </p>
            <p className="text-muted-foreground mt-4">
              Para hacer válida la garantía, conserva tu factura de compra y comunícate con nosotros para iniciar el proceso.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambios por Producto Diferente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si deseas cambiar un producto por otro diferente, puedes solicitarlo dentro del plazo de devolución. 
              El proceso es el mismo que para una devolución estándar. Una vez aprobado el cambio y recibido el 
              producto original, procederemos con el envío del nuevo artículo.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Nota:</strong> Si el nuevo producto tiene un valor mayor, deberás cubrir la diferencia. 
              Si es menor, te reembolsaremos la diferencia.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contacto para Devoluciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <strong>Email:</strong>{' '}
              <a href="mailto:ventas@ccs724.com" className="text-primary hover:underline">
                ventas@ccs724.com
              </a>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
            </p>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-6 rounded-lg mt-8">
          <p className="text-sm text-muted-foreground">
            <strong>Nota importante:</strong> Esta política de devoluciones aplica únicamente para compras 
            realizadas a través de nuestro sitio web <strong>ccs724.com</strong>. Para compras realizadas en 
            otros canales, consulta las condiciones específicas en el punto de venta.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}