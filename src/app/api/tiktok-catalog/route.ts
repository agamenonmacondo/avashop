import { NextResponse } from 'next/server';
import { products } from '@/lib/placeholder-data';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ccs724.com';

  // Encabezados CSV para TikTok
  let csv = 'Product ID,Product Name,Description,Price,Currency,Image URL,Availability,Category,Link\n';

  products.forEach((product) => {
    if (!product.id || !product.name || !product.price) return;

    const safeName = product.name.replace(/"/g, '""'); // Escapar comillas
    const safeDesc = (product.description || product.name).replace(/"/g, '""');
    const imageUrl = product.imageUrls?.[0] ? `${baseUrl}${product.imageUrls[0]}` : '';
    const availability = (product.stock || 0) > 0 ? 'in_stock' : 'out_of_stock';
    const category = product.category?.name || 'General';
    const link = `${baseUrl}/products/${product.id}`;

    csv += `"${product.id}","${safeName}","${safeDesc}","${product.price}","COP","${imageUrl}","${availability}","${category}","${link}"\n`;
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tiktok-catalog.csv"',
    },
  });
}