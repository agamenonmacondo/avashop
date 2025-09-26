
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronsLeft, ChevronsRight, ListChecks, ShoppingBag, Filter } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';

interface MockOrder {
  id: string;
  date: string;
  customerName: string;
  itemsSummary: string; // Simplified for display
  paymentMethod: 'Tarjeta de Crédito' | 'PSE' | 'Efectivo' | 'Cripto';
  amount: number;
  status: OrderStatus;
}

const allMockOrders: MockOrder[] = [
  { id: 'ORD001', date: '2024-06-25T10:30:00Z', customerName: 'Carlos Villa', itemsSummary: 'iPhone 15 Pro', paymentMethod: 'Tarjeta de Crédito', amount: 4500000, status: 'Entregado' },
  { id: 'ORD002', date: '2024-06-25T11:15:00Z', customerName: 'Lucia Mora', itemsSummary: 'Cargador MagSafe x2', paymentMethod: 'PSE', amount: 360000, status: 'Enviado' },
  { id: 'ORD003', date: '2024-06-24T16:45:00Z', customerName: 'Pedro Gómez', itemsSummary: 'AirPods Pro, Cable USB-C', paymentMethod: 'Tarjeta de Crédito', amount: 1035000, status: 'Procesando' },
  { id: 'ORD004', date: '2024-06-24T14:20:00Z', customerName: 'Ana Méndez', itemsSummary: 'Pixel 8 Pro', paymentMethod: 'Efectivo', amount: 4200000, status: 'Entregado' },
  { id: 'ORD005', date: '2024-06-23T09:05:00Z', customerName: 'Sofia Vargas', itemsSummary: 'Galaxy S24 Ultra', paymentMethod: 'Cripto', amount: 5500000, status: 'Pendiente' },
  { id: 'ORD006', date: '2024-06-23T17:30:00Z', customerName: 'Luis Torres', itemsSummary: 'iPhone 15', paymentMethod: 'PSE', amount: 3800000, status: 'Cancelado' },
  { id: 'ORD007', date: '2024-06-22T12:00:00Z', customerName: 'Laura Bermudez', itemsSummary: 'Lámpara LED, Cable Anker', paymentMethod: 'Tarjeta de Crédito', amount: 335000, status: 'Entregado' },
  // Add more mock orders to make pagination useful
  { id: 'ORD008', date: '2024-06-22T08:50:00Z', customerName: 'Jorge Parra', itemsSummary: 'iPhone 15 Pro Max', paymentMethod: 'PSE', amount: 4800000, status: 'Enviado' },
  { id: 'ORD009', date: '2024-06-21T19:10:00Z', customerName: 'Elena Rios', itemsSummary: 'AirPods (3rd Gen)', paymentMethod: 'Efectivo', amount: 850000, status: 'Entregado' },
  { id: 'ORD010', date: '2024-06-21T10:00:00Z', customerName: 'Andres Cruz', itemsSummary: 'Pixel Watch 2', paymentMethod: 'Cripto', amount: 1200000, status: 'Procesando' },
  { id: 'ORD011', date: '2024-06-20T15:00:00Z', customerName: 'Gabriela Solis', itemsSummary: 'Samsung Galaxy Buds', paymentMethod: 'Tarjeta de Crédito', amount: 600000, status: 'Pendiente' },
  { id: 'ORD012', date: '2024-06-20T13:30:00Z', customerName: 'Miguel Angel', itemsSummary: 'iPhone 15, Cargador 20W', paymentMethod: 'PSE', amount: 3950000, status: 'Entregado' },
];

const ITEMS_PER_PAGE = 10;
const paymentMethods = Array.from(new Set(allMockOrders.map(o => o.paymentMethod)));
const statuses: OrderStatus[] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];


export default function OrdersReportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof MockOrder | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  const filteredAndSortedOrders = useMemo(() => {
    return allMockOrders
      .filter(order => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm =
          order.id.toLowerCase().includes(lowerSearchTerm) ||
          order.customerName.toLowerCase().includes(lowerSearchTerm) ||
          order.itemsSummary.toLowerCase().includes(lowerSearchTerm);
        const matchesPaymentMethod = filterPaymentMethod ? order.paymentMethod === filterPaymentMethod : true;
        const matchesStatus = filterStatus ? order.status === filterStatus : true;
        return matchesSearchTerm && matchesPaymentMethod && matchesStatus;
      })
      .sort((a, b) => {
        if (!sortColumn) return 0;
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortColumn === 'date') {
            comparison = new Date(valA).getTime() - new Date(valB).getTime();
          } else {
            comparison = valA.localeCompare(valB);
          }
        }
        return sortDirection === 'asc' ? comparison : comparison * -1;
      });
  }, [searchTerm, filterPaymentMethod, filterStatus, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const summary = useMemo(() => {
    const totalOrders = filteredAndSortedOrders.length;
    const ordersByStatus = statuses.reduce((acc, status) => {
      acc[status] = filteredAndSortedOrders.filter(o => o.status === status).length;
      return acc;
    }, {} as Record<OrderStatus, number>);
    return { totalOrders, ordersByStatus };
  }, [filteredAndSortedOrders]);

  const handleSort = (column: keyof MockOrder) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const getStatusBadgeVariant = (status: MockOrder['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Entregado': return 'default'; 
      case 'Enviado': return 'outline'; 
      case 'Procesando': return 'secondary';
      case 'Pendiente': return 'secondary';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary" />
          Reporte Detallado de Pedidos
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Resumen de Pedidos (Resultados Filtrados)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
              <p className="text-2xl font-bold">{summary.totalOrders}</p>
            </div>
          </div>
          {statuses.map(status => (
            summary.ordersByStatus[status] > 0 && (
            <div key={status} className="flex items-center space-x-4 rounded-md border p-4 bg-card">
                 <Badge variant={getStatusBadgeVariant(status)} className="mr-2">{status}</Badge>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pedidos {status.toLowerCase()}</p>
                <p className="text-2xl font-bold">{summary.ordersByStatus[status]}</p>
              </div>
            </div>
            )
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtrar y Buscar Pedidos
          </CardTitle>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              placeholder="Buscar ID, Cliente, Items..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="md:col-span-1"
            />
            <Select value={filterPaymentMethod} onValueChange={(value) => { setFilterPaymentMethod(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Método de Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Métodos</SelectItem>
                {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value === 'all' ? '' : value as OrderStatus | ''); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado del Pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:text-primary">ID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:text-primary">Fecha {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('customerName')} className="cursor-pointer hover:text-primary">Cliente {sortColumn === 'customerName' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead>Items</TableHead>
                <TableHead onClick={() => handleSort('paymentMethod')} className="cursor-pointer hover:text-primary">Método Pago {sortColumn === 'paymentMethod' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:text-primary">Estado {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('amount')} className="text-right cursor-pointer hover:text-primary">Valor {sortColumn === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{format(parseISO(order.date), "dd MMM yyyy, HH:mm", { locale: es })}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate" title={order.itemsSummary}>{order.itemsSummary}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(order.status)}>
                       {order.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatColombianCurrency(order.amount)}</TableCell>
                </TableRow>
              ))}
               {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron pedidos con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} (Total: {filteredAndSortedOrders.length} pedidos)
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
