import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ccs724.com';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de categorías para referencia rápida
const CATEGORIES: Record<string, string> = {
  'colores-arte': 'Colores y arte',
  'correccion-apoyo': 'Corrección y apoyo',
  'corte-pegado': 'Corte y pegado',
  'cuadernos': 'Cuadernos',
  'escritura': 'Escritura',
  'geometria': 'Geometría y medición',
  'organizacion': 'Organización',
  'otros': 'Otros',
  'papeleria': 'Papelería'
};

// Mapeo de subcategorías a categorías
const SUBCATEGORY_TO_CATEGORY: Record<string, string> = {
  'accesorios': 'otros',
  'argollado-105': 'cuadernos',
  'argollado-85': 'cuadernos',
  'borrador': 'correccion-apoyo',
  'carpetas': 'organizacion',
  'cartuchera': 'organizacion',
  'cartulina': 'papeleria',
  'cinco-materias-105': 'cuadernos',
  'cinco-materias-85': 'cuadernos',
  'cinta': 'corte-pegado',
  'colores': 'colores-arte',
  'compas': 'geometria',
  'corrector': 'correccion-apoyo',
  'cosido-100-cuadriculado': 'cuadernos',
  'cosido-100-ferrocarril': 'cuadernos',
  'cosido-100-rayado': 'cuadernos',
  'cosido-50-cuadriculado': 'cuadernos',
  'crayones': 'colores-arte',
  'escuadras': 'geometria',
  'esferos': 'escritura',
  'foamy': 'papeleria',
  'forros': 'organizacion',
  'lapiz': 'escritura',
  'marcadores': 'escritura',
  'papel-bond': 'papeleria',
  'papel-construccion': 'papeleria',
  'papel-crepe': 'papeleria',
  'pegantes': 'corte-pegado',
  'pinceles': 'colores-arte',
  'plastilina': 'colores-arte',
  'plumas': 'escritura',
  'reglas': 'geometria',
  'resaltadores': 'escritura',
  'sacapuntas': 'correccion-apoyo',
  'siete-materias-105': 'cuadernos',
  'siete-materias-85': 'cuadernos',
  'temperas': 'colores-arte',
  'tijeras': 'corte-pegado'
};

const SUBCATEGORY_NAMES: Record<string, string> = {
  'accesorios': 'Accesorios',
  'argollado-105': 'Argollado 105 hojas',
  'argollado-85': 'Argollado 85 hojas',
  'borrador': 'Borrador',
  'carpetas': 'Carpetas',
  'cartuchera': 'Cartuchera',
  'cartulina': 'Cartulina',
  'cinco-materias-105': 'Cinco materias 105 hojas',
  'cinco-materias-85': 'Cinco materias 85 hojas',
  'cinta': 'Cinta',
  'colores': 'Colores',
  'compas': 'Compás',
  'corrector': 'Corrector',
  'cosido-100-cuadriculado': 'Cosido 100 hojas cuadriculado',
  'cosido-100-ferrocarril': 'Cosido 100 hojas ferrocarril',
  'cosido-100-rayado': 'Cosido 100 hojas rayado',
  'cosido-50-cuadriculado': 'Cosido 50 hojas cuadriculado',
  'crayones': 'Crayones',
  'escuadras': 'Escuadras',
  'esferos': 'Esferos',
  'foamy': 'Foamy',
  'forros': 'Forros',
  'lapiz': 'Lápiz',
  'marcadores': 'Marcadores',
  'papel-bond': 'Papel bond',
  'papel-construccion': 'Papel construcción',
  'papel-crepe': 'Papel crepé',
  'pegantes': 'Pegantes',
  'pinceles': 'Pinceles',
  'plastilina': 'Plastilina y masas',
  'plumas': 'Plumas',
  'reglas': 'Reglas',
  'resaltadores': 'Resaltadores',
  'sacapuntas': 'Sacapuntas',
  'siete-materias-105': 'Siete materias 105 hojas',
  'siete-materias-85': 'Siete materias 85 hojas',
  'temperas': 'Témperas y acuarelas',
  'tijeras': 'Tijeras'
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');
  const list = searchParams.get('list');

  try {
    // Listar categorías y subcategorías disponibles
    if (list === 'categories') {
      return NextResponse.json({
        categories: Object.entries(CATEGORIES).map(([id, name]) => ({ id, name })),
        subcategories: Object.entries(SUBCATEGORY_NAMES).map(([id, name]) => ({
          id,
          name,
          category_id: SUBCATEGORY_TO_CATEGORY[id],
          category_name: CATEGORIES[SUBCATEGORY_TO_CATEGORY[id]]
        }))
      });
    }

    let query = supabase
      .from('products')
      .select('*')
      .not('price', 'is', null);

    // Filtrar por subcategoría directamente
    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Filtrar por categoría
    let filteredProducts = products || [];
    if (categoryId && !subcategoryId) {
      filteredProducts = filteredProducts.filter(p => {
        const productCategoryId = SUBCATEGORY_TO_CATEGORY[p.subcategory_id];
        return productCategoryId === categoryId;
      });
    }

    // Agregar nombres de categoría y subcategoría
    const enrichedProducts = filteredProducts.map(product => {
      const subcatId = product.subcategory_id || '';
      const catId = SUBCATEGORY_TO_CATEGORY[subcatId] || '';
      return {
        ...product,
        category_id: catId,
        category_name: CATEGORIES[catId] || 'General',
        subcategory_name: SUBCATEGORY_NAMES[subcatId] || 'General'
      };
    });

    if (format === 'xml') {
      return generateXMLFeed(enrichedProducts);
    }

    if (format === 'json') {
      return NextResponse.json({
        total: enrichedProducts.length,
        products: enrichedProducts
      });
    }

    // Default: CSV format
    return generateCSVFeed(enrichedProducts);

  } catch (error) {
    console.error('Error generating Facebook catalog:', error);
    return NextResponse.json({ error: 'Error generating catalog' }, { status: 500 });
  }
}

function generateCSVFeed(products: any[]) {
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'product_type',
    'custom_label_0',
    'custom_label_1'
  ].join(',');

  const rows = products.map(product => {
    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : `${siteUrl}${product.image}`;

    const categoryName = product.category_name || 'General';
    const subcategoryName = product.subcategory_name || 'General';

    const escapeCsv = (value: string) => {
      if (!value) return '';
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    };

    return [
      escapeCsv(product.id),
      escapeCsv(product.name),
      escapeCsv(product.name),
      'in stock',
      'new',
      `${product.price} COP`,
      `${siteUrl}/products/${product.id}`,
      imageUrl,
      'CCS724',
      escapeCsv(categoryName),
      escapeCsv(`${categoryName} > ${subcategoryName}`),
      escapeCsv(categoryName),
      escapeCsv(subcategoryName)
    ].join(',');
  });

  const csv = [headers, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="facebook-catalog.csv"',
    },
  });
}

function generateXMLFeed(products: any[]) {
  const escapeXml = (value: string) => {
    if (!value) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const items = products.map(product => {
    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : `${siteUrl}${product.image}`;

    const categoryName = product.category_name || 'General';
    const subcategoryName = product.subcategory_name || 'General';

    return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.name}]]></g:description>
      <g:link>${siteUrl}/products/${product.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:price>${product.price} COP</g:price>
      <g:brand>CCS724</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${escapeXml(categoryName)}</g:google_product_category>
      <g:product_type>${escapeXml(categoryName)} &gt; ${escapeXml(subcategoryName)}</g:product_type>
      <g:custom_label_0>${escapeXml(categoryName)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(subcategoryName)}</g:custom_label_1>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CCS724 Catalog</title>
    <link>${siteUrl}</link>
    <description>Catálogo de productos CCS724</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}