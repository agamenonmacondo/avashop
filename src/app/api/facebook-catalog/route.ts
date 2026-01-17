import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ccs724.com';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        subcategories:subcategory_id (
          id,
          name,
          categories:category_id (
            id,
            name
          )
        )
      `)
      .not('price', 'is', null);

    // Filtrar por subcategoría
    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Filtrar por categoría (después de obtener los datos)
    let filteredProducts = products || [];
    if (categoryId && !subcategoryId) {
      filteredProducts = filteredProducts.filter(
        p => p.subcategories?.categories?.id === categoryId
      );
    }

    if (format === 'xml') {
      return generateXMLFeed(filteredProducts);
    }

    // Default: CSV format
    return generateCSVFeed(filteredProducts);

  } catch (error) {
    console.error('Error generating Facebook catalog:', error);
    return NextResponse.json({ error: 'Error generating catalog' }, { status: 500 });
  }
}

function generateCSVFeed(products: any[]) {
  // Cabeceras con campos adicionales para categorización
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

    const categoryName = product.subcategories?.categories?.name || 'General';
    const subcategoryName = product.subcategories?.name || 'General';

    const escapeCsv = (value: string) => {
      if (!value) return '';
      const escaped = value.replace(/"/g, '""');
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
      escapeCsv(`${categoryName} > ${subcategoryName}`), // product_type con jerarquía
      escapeCsv(categoryName),      // custom_label_0 = categoría
      escapeCsv(subcategoryName)    // custom_label_1 = subcategoría
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
  const items = products.map(product => {
    const imageUrl = product.image?.startsWith('http') 
      ? product.image 
      : `${siteUrl}${product.image}`;

    const categoryName = product.subcategories?.categories?.name || 'General';
    const subcategoryName = product.subcategories?.name || 'General';

    const escapeXml = (value: string) => {
      if (!value) return '';
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

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