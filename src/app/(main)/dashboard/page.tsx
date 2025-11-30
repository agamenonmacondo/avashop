'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingBag, ShoppingCart as StoreIcon, ArrowRight } from 'lucide-react';
import { mockUser } from '@/lib/placeholder-data';
import DashboardSync from '@/components/auth/DashboardSync';

export default function DashboardPage() {
  const user = mockUser;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <DashboardSync />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          Panel de Control
        </h1>
        <p className="text-muted-foreground">
          ¡Bienvenido de nuevo, {user?.name || 'Usuario'}! Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium font-headline">Mi Perfil</CardTitle>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona tu información personal y direcciones.
            </p>
            <Button asChild className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
              <Link href="/account">
                Ir a Mi Cuenta <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium font-headline">Mis Pedidos</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Revisa el historial y el estado de tus compras.
            </p>
            <Button asChild className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
              <Link href="/account/orders">
                Ver Mis Pedidos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Continue Shopping Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium font-headline">Seguir Comprando</CardTitle>
            <StoreIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explora nuestros últimos productos y ofertas.
            </p>
            <Button asChild className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
              <Link href="/">
                Explorar Productos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
