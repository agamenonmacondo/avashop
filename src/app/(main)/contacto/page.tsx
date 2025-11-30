'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Phone, Mail, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactFormAction } from './actions';

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget; 

    try {
      const result = await contactFormAction(formData);
      
      if (result.success) {
        setSuccess(true);
        form.reset();
      } else {
        setErrorMessage(result.error || 'Hubo un problema al enviar el mensaje.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-headline">Contáctenos</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          ¿Tienes alguna pregunta sobre nuestros productos o tu pedido? 
          Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información de Contacto */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Canales directos de atención</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Ubicación</h3>
                  <p className="text-sm text-muted-foreground">Cra 23 # 149-59</p>
                  <p className="text-sm text-muted-foreground">Bogotá, Colombia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Teléfono</h3>
                  <p className="text-sm text-muted-foreground">Llámanos o escríbenos</p>
                  <a href="tel:+573504017710" className="text-sm font-medium hover:text-primary transition-colors">
                    +57 350 401 7710
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Corporativo</h3>
                  <p className="text-sm text-muted-foreground">Para consultas generales</p>
                  <a href="mailto:ventas@ccs724.com" className="text-sm font-medium hover:text-primary transition-colors">
                    ventas@ccs724.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Horario de Atención</h3>
                  <p className="text-sm text-muted-foreground">Lunes a Viernes</p>
                  <p className="text-sm font-medium">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nuestro equipo te responderá a la brevedad posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 animate-in fade-in duration-500">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold">¡Mensaje Enviado!</h3>
                  <p className="text-muted-foreground max-w-md">
                    Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos al correo proporcionado lo antes posible.
                  </p>
                  <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4">
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <span className="block sm:inline text-sm">{errorMessage}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Nombre Completo
                      </label>
                      <Input id="name" name="name" placeholder="Ej: Juan Pérez" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Correo Electrónico
                      </label>
                      <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Teléfono (Opcional)
                    </label>
                    <Input id="phone" name="phone" type="tel" placeholder="+57 300 000 0000" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Asunto
                    </label>
                    <Input id="subject" name="subject" placeholder="Ej: Consulta sobre garantía" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Mensaje
                    </label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Escribe tu mensaje aquí..." 
                      className="min-h-[150px]" 
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                    {loading ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}