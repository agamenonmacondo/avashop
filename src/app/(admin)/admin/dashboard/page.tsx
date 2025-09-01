
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { products as initialProducts } from '@/lib/placeholder-data';
import type { Product } from '@/types';
import { DollarSign, ShoppingBag, Package, Users, BarChart3, Save, PlusCircle, FileText, Trash2, Store } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface AdminProduct extends Product {
  currentStock: number;
  newStockInput: string;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    setProducts(
      initialProducts.map(p => {
        const stock = p.stock ?? 0;
        return {
          ...p,
          currentStock: stock,
          newStockInput: stock.toString(),
        };
      })
    );
  }, []);

  const handleStockInputChange = (productId: string, value: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, newStockInput: value } : p
      )
    );
  };

  const handleUpdateStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = parseInt(product.newStockInput, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: 'Error de Stock',
        description: 'Por favor, introduce un número válido para el stock.',
        variant: 'destructive',
      });
      return;
    }

    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, currentStock: newStock, stock: newStock } : p
      )
    );

    toast({
      title: 'Inventario Actualizado (Simulación)',
      description: `El stock para ${product.name} ha sido ajustado a ${newStock}. (Esto es una simulación y no persistirá).`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast({
      title: 'Producto Eliminado (Simulación)',
      description: `El producto "${productToDelete.name}" ha sido eliminado de la lista. (Esto es una simulación y no persistirá).`,
      variant: 'destructive' 
    });
  };

  const totalSalesDisplay = 125800000;
  const totalOrdersDisplay = 342;
  const newCustomersDisplay = 58;
  
  const lowStockItemsCount = products.filter(p => p.currentStock < 10).length;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona tu tienda AVA Shop.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <Store className="mr-2 h-4 w-4" />
            Ver Tienda
          </Link>
        </Button>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold font-headline mb-6">Estadísticas Clave</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/sales-report')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales (Mes)</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatColombianCurrency(totalSalesDisplay)}</div>
                <p className="text-xs text-muted-foreground">Ver reporte detallado</p>
              </CardContent>
            </Card>
          
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/orders-report')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Totales (Mes)</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{totalOrdersDisplay}</div>
                <p className="text-xs text-muted-foreground">+8.1% desde el mes pasado</p>
              </CardContent>
            </Card>
          
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/customers-report')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos Clientes (Mes)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{newCustomersDisplay}</div>
                <p className="text-xs text-muted-foreground">Registrados este mes</p>
              </CardContent>
            </Card>
          
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/low-stock-report')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Bajos en Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${lowStockItemsCount > 0 ? 'text-destructive' : ''}`}>{lowStockItemsCount}</div>
                <p className="text-xs text-muted-foreground">Menos de 10 unidades</p>
              </CardContent>
            </Card>
          
        </div>
      </section>

      <section>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-headline flex items-center">
                <Package className="mr-3 h-6 w-6 text-primary" />
                Ajustar Stock de Productos Existentes (Simulación)
              </CardTitle>
              <Button asChild>
                <Link href="/admin/products/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Nuevo Producto
                </Link>
              </Button>
            </div>
            <CardDescription>
              Visualiza y ajusta el stock de tus productos. Los cambios aquí son solo para demostración y no persistirán.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-32 text-center">Stock Actual</TableHead>
                  <TableHead className="w-48 text-center">Ajustar Stock</TableHead>
                  <TableHead className="w-48 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category.name}</div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{product.currentStock}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={product.newStockInput}
                        onChange={e => handleStockInputChange(product.id, e.target.value)}
                        className="h-9 text-center"
                        min="0"
                        aria-label={`Nuevo stock para ${product.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(product.id)}
                          className="transition-transform hover:scale-105 active:scale-95"
                        >
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                          Guardar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="transition-transform hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {products.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No hay productos para mostrar.</p>
              )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
