import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Productos — CCS 724'
};

export default async function Page() {
  return (
    <main>
      <h1>Productos</h1>
      <p>Catálogo — si quieres redirigir, reemplaza por redirect()</p>
      {/* opcional: lista mínima o link al sitemap */}
      <a href="/sitemap.xml">Ver sitemap</a>
    </main>
  );
}