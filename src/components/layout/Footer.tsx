import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-2xl font-headline">CCS 724</span>
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
            <h3 className="text-lg font-semibold mb-3 font-headline">Información Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/politica-de-devoluciones" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:ccs724productos@gmail.com" className="hover:text-primary transition-colors">
                  ccs724productos@gmail.com
                </a>
              </li>
              <li>Lunes a Viernes</li>
              <li>9:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CCS 724. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
