import Link from 'next/link';
import { Mail, MapPin, Phone, CreditCard, Bitcoin, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-2xl font-headline">CCS 724</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Tu tienda única para lo último en tecnología y accesorios.
            </p>
            
            {/* REDES SOCIALES - ACTUALIZADO */}
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/ccs_724/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61583956663615" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@ccs_724" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Síguenos en TikTok"
              >
                {/* Icono de TikTok personalizado estilo Lucide */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Productos</Link></li>
              <li><Link href="/sobre-nosotros" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors">Contáctenos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Información Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/politica-de-envios" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Envíos
                </Link>
              </li>
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
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Cra 23 # 149-59<br />Bogotá, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+573504017710" className="hover:text-primary transition-colors">
                  +57 350 401 7710
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:ventas@ccs724.com" className="hover:text-primary transition-colors">
                  ventas@ccs724.com
                </a>
              </li>
              <li className="pt-2 border-t border-border/40 mt-2">
                <p className="text-xs">Lunes a Viernes</p>
                <p className="text-xs font-medium">9:00 AM - 6:00 PM</p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* SECCIÓN DE MÉTODOS DE PAGO */}
        <div className="mt-8 pt-8 border-t border-border/40">
          <h3 className="text-center text-sm font-semibold mb-4">Métodos de Pago Aceptados</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            
            {/* Tarjetas de Crédito/Débito con Bold */}
            <div className="flex flex-col items-center gap-2 px-4 py-3 bg-secondary/20 rounded-lg">
              <CreditCard className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-xs font-semibold">Tarjetas</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                <p className="text-xs text-muted-foreground">Procesado por Bold</p>
              </div>
            </div>

            {/* Criptomonedas */}
            <div className="flex flex-col items-center gap-2 px-4 py-3 bg-secondary/20 rounded-lg">
              <Bitcoin className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-xs font-semibold">Criptomonedas</p>
                <p className="text-xs text-muted-foreground">Bitcoin, USDT</p>
                <p className="text-xs text-muted-foreground">Pago seguro</p>
              </div>
            </div>

            {/* Pago Contra Entrega */}
            <div className="flex flex-col items-center gap-2 px-4 py-3 bg-secondary/20 rounded-lg">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-xs font-semibold">Pago Contra Entrega</p>
                <p className="text-xs text-muted-foreground">WhatsApp directo</p>
                <p className="text-xs text-muted-foreground">Efectivo o transferencia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground border-t border-border/40 pt-6">
          <p>&copy; {new Date().getFullYear()} CCS 724. Todos los derechos reservados.</p>
          <p className="text-xs mt-2">Tienda online de tecnología en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
