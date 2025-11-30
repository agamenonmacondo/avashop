import Link from 'next/link';

export function PolicyLinks() {
  return (
    <div className="border-t border-border/40 pt-4 mt-8">
      <p className="text-xs text-muted-foreground mb-2 font-semibold">Información Legal:</p>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Link href="/politica-de-envios" className="hover:text-primary underline">
          Política de Envíos
        </Link>
        <span>•</span>
        <Link href="/politica-de-devoluciones" className="hover:text-primary underline">
          Devoluciones
        </Link>
        <span>•</span>
        <Link href="/terminos-y-condiciones" className="hover:text-primary underline">
          Términos y Condiciones
        </Link>
        <span>•</span>
        <Link href="/politica-de-privacidad" className="hover:text-primary underline">
          Privacidad
        </Link>
      </div>
    </div>
  );
}