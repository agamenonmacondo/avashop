
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronsLeft, ChevronsRight, Package, AlertTriangle, Filter } from 'lucide-react';
import { products as allProducts, categories as allCategories } from '@/lib/placeholder-data';
import type { Product, Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LowStockProduct extends Product {
  // currentStock is already part of Product.stock, but explicit for clarity if needed
}

const ITEMS_PER_PAGE = 10;

export default function LowStockReportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof LowStockProduct | 'stock' | null>('stock');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    // Simulate fetching and preparing low stock products
    const preparedProducts = allProducts
      .filter(p => (p.stock ?? 0) < 10)
      .map(p => ({ ...p })); // Create a new array of product objects
    setLowStockProducts(preparedProducts);
  }, []);


  const filteredAndSortedProducts = useMemo(() => {
    return lowStockProducts
      .filter(product => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm =
          product.name.toLowerCase().includes(lowerSearchTerm);
        const matchesCategory = filterCategory ? product.category.id === filterCategory : true;
        return matchesSearchTerm && matchesCategory;
      })
      .sort((a, b) => {
        if (!sortColumn) return 0;
        
        let valA, valB;
        if (sortColumn === 'stock') {
            valA = a.stock;
            valB = b.stock;
        } else {
            valA = a[sortColumn as keyof Product]; // Ensure sortColumn is a valid key of Product
            valB = b[sortColumn as keyof Product];
        }


        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
           comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'object' && typeof valB === 'object' && valA !== null && valB !== null && 'name' in valA && 'name' in valB) { // For category sorting
            comparison = (valA as Category).name.localeCompare((valB as Category).name);
        }

        return sortDirection === 'asc' ? comparison : comparison * -1;
      });
  }, [lowStockProducts, searchTerm, filterCategory, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const summary = useMemo(() => {
    return { totalLowStockItems: filteredAndSortedProducts.length };
  }, [filteredAndSortedProducts]);

  const handleSort = (column: keyof LowStockProduct | 'stock') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8 text-destructive" />
          Reporte de Productos con Bajo Stock
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Resumen (Resultados Filtrados)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-1">
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <Package className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Ítems Bajos en Stock</p>
              <p className="text-2xl font-bold text-destructive">{summary.totalLowStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtrar y Buscar Productos
          </CardTitle>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="md:col-span-1"
            />
            <Select value={filterCategory} onValueChange={(value) => { setFilterCategory(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {allCategories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-primary">Producto {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:text-primary">Categoría {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('stock')} className="text-right cursor-pointer hover:text-primary">Stock Actual {sortColumn === 'stock' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                 <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        {/* In a real app, this could link to a product edit page or open a stock adjustment modal */}
                        <Link href={`/admin/dashboard#product-${product.id}`}>Ajustar Stock</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {paginatedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    ¡Excelente! No hay productos bajos en stock con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} (Total: {filteredAndSortedProducts.length} productos)
                </span>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
}

