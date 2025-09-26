
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronsLeft, ChevronsRight, FileText, TrendingUp, DollarSign, Filter } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MockTransaction {
  id: string;
  date: string;
  customerName: string;
  itemsSummary: string;
  paymentMethod: 'Tarjeta de Crédito' | 'PSE' | 'Efectivo' | 'Cripto';
  amount: number;
  status: 'Completado' | 'Pendiente' | 'Fallido';
}

// Expanded mock transactions for the report page
const allMockTransactions: MockTransaction[] = [
  { id: 'TRX001', date: '2024-06-15T10:30:00Z', customerName: 'Laura Valenzuela', itemsSummary: 'iPhone 15 Pro', paymentMethod: 'Tarjeta de Crédito', amount: 4500000, status: 'Completado' },
  { id: 'TRX002', date: '2024-06-15T11:15:00Z', customerName: 'Juan Morales', itemsSummary: 'Cargador MagSafe', paymentMethod: 'PSE', amount: 180000, status: 'Completado' },
  { id: 'TRX003', date: '2024-06-14T16:45:00Z', customerName: 'Sofia Rodriguez', itemsSummary: 'AirPods Pro (2da Gen)', paymentMethod: 'Tarjeta de Crédito', amount: 950000, status: 'Completado' },
  { id: 'TRX004', date: '2024-06-14T14:20:00Z', customerName: 'Carlos Gómez', itemsSummary: 'Pixel 8 Pro, Cable USB-C', paymentMethod: 'Efectivo', amount: 4285000, status: 'Completado' },
  { id: 'TRX005', date: '2024-06-13T09:05:00Z', customerName: 'Ana Pérez', itemsSummary: 'Galaxy S24 Ultra', paymentMethod: 'Tarjeta de Crédito', amount: 5500000, status: 'Completado' },
  { id: 'TRX006', date: '2024-06-13T17:30:00Z', customerName: 'Luis Fernández', itemsSummary: 'iPhone 15', paymentMethod: 'PSE', amount: 3800000, status: 'Pendiente' },
  { id: 'TRX007', date: '2024-06-12T12:00:00Z', customerName: 'Maria Castillo', itemsSummary: 'Lámpara LED Inteligente', paymentMethod: 'Tarjeta de Crédito', amount: 250000, status: 'Completado' },
  { id: 'TRX008', date: '2024-06-12T08:50:00Z', customerName: 'Pedro Sanchez', itemsSummary: 'Cable USB-C Anker x2', paymentMethod: 'Efectivo', amount: 170000, status: 'Completado' },
  { id: 'TRX009', date: '2024-06-11T19:10:00Z', customerName: 'Elena Diaz', itemsSummary: 'iPhone 15 Pro, Cargador MagSafe', paymentMethod: 'PSE', amount: 4680000, status: 'Completado' },
  { id: 'TRX010', date: '2024-06-11T10:00:00Z', customerName: 'Jorge Acosta', itemsSummary: 'AirPods Pro', paymentMethod: 'Tarjeta de Crédito', amount: 950000, status: 'Fallido' },
  { id: 'TRX011', date: '2024-06-10T15:00:00Z', customerName: 'Lucia Méndez', itemsSummary: 'Pixel 8 Pro', paymentMethod: 'Cripto', amount: 4200000, status: 'Completado' },
  { id: 'TRX012', date: '2024-06-10T13:30:00Z', customerName: 'Andrés Benitez', itemsSummary: 'Galaxy S24 Ultra, Cable USB-C', paymentMethod: 'PSE', amount: 5585000, status: 'Completado' },
  { id: 'TRX013', date: '2024-06-09T11:45:00Z', customerName: 'Carolina Herrera', itemsSummary: 'iPhone 15 x2', paymentMethod: 'Efectivo', amount: 7600000, status: 'Pendiente' },
  { id: 'TRX014', date: '2024-06-09T09:20:00Z', customerName: 'Ricardo Pinto', itemsSummary: 'Cargador MagSafe, AirPods Pro', paymentMethod: 'Tarjeta de Crédito', amount: 1130000, status: 'Completado' },
  { id: 'TRX015', date: '2024-06-08T18:00:00Z', customerName: 'Valeria Torres', itemsSummary: 'Lámpara LED Inteligente, Cable USB-C', paymentMethod: 'Cripto', amount: 335000, status: 'Completado' },
];


const ITEMS_PER_PAGE = 10;
const paymentMethods = Array.from(new Set(allMockTransactions.map(t => t.paymentMethod)));
const statuses = Array.from(new Set(allMockTransactions.map(t => t.status)));


export default function SalesReportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof MockTransaction | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');


  const filteredAndSortedTransactions = useMemo(() => {
    return allMockTransactions
    .filter(transaction => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearchTerm =
        transaction.id.toLowerCase().includes(lowerSearchTerm) ||
        transaction.customerName.toLowerCase().includes(lowerSearchTerm) ||
        transaction.itemsSummary.toLowerCase().includes(lowerSearchTerm);
      const matchesPaymentMethod = filterPaymentMethod ? transaction.paymentMethod === filterPaymentMethod : true;
      const matchesStatus = filterStatus ? transaction.status === filterStatus : true;
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
        if (sortColumn === 'date') { // Special handling for date strings
             comparison = new Date(valA).getTime() - new Date(valB).getTime();
        } else {
            comparison = valA.localeCompare(valB);
        }
      }
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });
  }, [searchTerm, filterPaymentMethod, filterStatus, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const summary = useMemo(() => {
    const completedTransactions = filteredAndSortedTransactions.filter(t => t.status === 'Completado');
    const totalSales = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCompletedTransactions = completedTransactions.length;
    const averageTransactionValue = totalCompletedTransactions > 0 ? totalSales / totalCompletedTransactions : 0;
    return { totalSales, totalCompletedTransactions, averageTransactionValue };
  }, [filteredAndSortedTransactions]);


  const handleSort = (column: keyof MockTransaction) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const getStatusBadgeVariant = (status: MockTransaction['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Completado': return 'default';
      case 'Pendiente': return 'secondary';
      case 'Fallido': return 'destructive';
      default: return 'outline';
    }
  };


  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          Reporte de Ventas Detallado
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Resumen de Ventas (Resultados Filtrados)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ventas Totales (Completadas)</p>
              <p className="text-2xl font-bold">{formatColombianCurrency(summary.totalSales)}</p>
            </div>
          </div>
           <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transacciones (Completadas)</p>
              <p className="text-2xl font-bold">{summary.totalCompletedTransactions}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <DollarSign className="h-8 w-8 text-primary" /> {/* Re-using DollarSign, consider if another icon is better */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Promedio Transacción</p>
              <p className="text-2xl font-bold">{formatColombianCurrency(summary.averageTransactionValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtrar y Buscar Transacciones
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
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Transacción" />
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
              {paginatedTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                  <TableCell>{format(parseISO(transaction.date), "dd MMM yyyy, HH:mm", { locale: es })}</TableCell>
                  <TableCell>{transaction.customerName}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate" title={transaction.itemsSummary}>{transaction.itemsSummary}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(transaction.status)}>
                       {transaction.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatColombianCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
               {paginatedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron transacciones con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} (Total: {filteredAndSortedTransactions.length} transacciones)
                </span>
                <div className="flex items-center space-x-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    >
                    <ChevronsLeft className="h-4 w-4" /> 
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    >
                    Anterior
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    >
                    Siguiente
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    >
                    <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
}
