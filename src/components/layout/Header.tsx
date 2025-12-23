'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, ShoppingCart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './UserNav';
import { ThemeToggle } from './ThemeToggle';
import SearchBar from './SearchBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === 'dark'
      ? '/images/AVALOGO/ccs724_logo_yellow_transparent.png'
      : '/images/AVALOGO/ccs724_logo_transparent.png';

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 max-w-screen-2xl items-center justify-between gap-2 md:gap-4">
          {/* Logo izquierda */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 pr-0">
                  <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                </SheetContent>
              </Sheet>
            </div>
            <Link href="/" className="flex items-center">
              <div className="h-8 w-24 md:h-10 md:w-40 bg-muted animate-pulse rounded" />
            </Link>
          </div>

          {/* Buscador centro */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="w-full h-9 md:h-10 bg-muted animate-pulse rounded-full" />
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1 md:gap-2">
            <div className="h-8 w-8 md:h-9 md:w-9 bg-muted animate-pulse rounded-full" />
            <div className="h-8 w-8 md:h-9 md:w-9 bg-muted animate-pulse rounded-full" />
            <div className="h-8 w-8 md:h-9 md:w-9 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 max-w-screen-2xl items-center justify-between gap-2 md:gap-4">
        {/* Logo y menú - Izquierda */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Menú móvil */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 pr-0 overflow-y-auto">
                <nav className="grid gap-6 text-lg font-medium mt-8 pl-6">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold -ml-2">
                    <Image
                      src={logoSrc}
                      alt="CCS724 Logo"
                      width={160}
                      height={160}
                      className="object-contain"
                      priority
                    />
                  </Link>
                  
                  {/* Buscador en menú móvil */}
                  <div className="px-2">
                    <SearchBar />
                  </div>

                  {/* Enlaces principales */}
                  <Link href="/landing" className="text-base hover:underline">
                    Combo Pro
                  </Link>
                  <Link href="/landing/kit-esencial" className="text-base hover:underline">
                    Kit Esencial
                  </Link>
                  <Link href="/landing/combo-navideno" className="text-base hover:underline">
                    Combo Navideño
                  </Link>
                  <Link href="/landing/creatina" className="text-base hover:underline">
                    Creatina
                  </Link>

                  {/* Información Legal - Móvil */}
                  <div className="border-t pt-4 mt-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                      Información Legal
                    </p>
                    <div className="grid gap-3 pl-2">
                      <Link href="/sobre-nosotros" className="text-sm hover:underline">
                        Sobre Nosotros
                      </Link>
                      <Link href="/terminos-y-condiciones" className="text-sm hover:underline">
                        Términos y Condiciones
                      </Link>
                      <Link href="/politica-de-privacidad" className="text-sm hover:underline">
                        Política de Privacidad
                      </Link>
                      <Link href="/politica-de-envios" className="text-sm hover:underline">
                        Política de Envíos
                      </Link>
                      <Link href="/politica-de-devoluciones" className="text-sm hover:underline">
                        Política de Devoluciones
                      </Link>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="CCS724 Logo"
              width={250}
              height={250}
              className="object-contain h-12 w-auto md:h-18"
              priority
            />
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium">
            <Link href="/landing" className="hover:underline whitespace-nowrap">
              Combo Pro
            </Link>
            <Link href="/landing/kit-esencial" className="hover:underline whitespace-nowrap">
              Kit Esencial
            </Link>
            <Link href="/landing/combo-navideno" className="hover:underline whitespace-nowrap">
              Combo Navideño
            </Link>
            <Link href="/landing/creatina" className="hover:underline whitespace-nowrap">
              Creatina
            </Link>

            {/* Menú desplegable Legal - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto py-0 px-2 hover:bg-transparent">
                  <span className="whitespace-nowrap">Info Legal</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/sobre-nosotros" className="cursor-pointer">
                    Sobre Nosotros
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/terminos-y-condiciones" className="cursor-pointer">
                    Términos y Condiciones
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/politica-de-privacidad" className="cursor-pointer">
                    Política de Privacidad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/politica-de-envios" className="cursor-pointer">
                    Política de Envíos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/politica-de-devoluciones" className="cursor-pointer">
                    Política de Devoluciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Buscador - Centro (Desktop) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2 lg:mx-4">
          <SearchBar />
        </div>

        {/* Acciones - Derecha */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" asChild>
            <Link href="/cart" aria-label="Carrito de Compras">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}