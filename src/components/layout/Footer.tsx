import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-2xl font-headline">AVA Shop</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Tu tienda única para lo último en tecnología y accesorios.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Productos</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Conéctate Con Nosotros</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Mantente actualizado con nuestras últimas ofertas y productos.
            </p>
            {/* Placeholder for social media icons or newsletter signup */}
            <div className="flex space-x-3">
              {/* Example: <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link> */}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AVA Shop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
