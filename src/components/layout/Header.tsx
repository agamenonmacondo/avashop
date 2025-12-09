'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './UserNav';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';

export default function Header() {
  const { resolvedTheme } = useTheme();

  // Selecciona el logo según el modo
  const logoSrc =
    resolvedTheme === 'dark'
      ? '/images/AVALOGO/ccs724_logo_yellow_transparent.png'
      : '/images/AVALOGO/ccs724_logo_transparent.png';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Left container for logo and nav */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 pr-0">
                <nav className="grid gap-6 text-lg font-medium mt-8 pl-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold -ml-2"
                  >
                    <Image
                      src={logoSrc}
                      alt="CCS724 Logo"
                      width={56}
                      height={56}
                      priority
                    />
                  </Link>
                  <Link href="/landing" className="text-base hover:underline">Combo Pro</Link>
                  <Link href="/landing/kit-esencial" className="text-base hover:underline">Kit Esencial</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo & Nav */}
          <Link
            href="/"
            className="mr-6 hidden md:flex items-center gap-3"
          >
            <Image
              src={logoSrc}
              alt="CCS724 Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/landing" className="hover:underline">Combo Pro</Link>
            <Link href="/landing/kit-esencial" className="hover:underline">Kit Esencial</Link>
          </nav>
        </div>

        {/* Right container for actions */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Carrito de Compras">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}