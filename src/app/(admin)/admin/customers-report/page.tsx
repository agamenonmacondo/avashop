
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronsLeft, ChevronsRight, Users, Filter, UserPlus, ShoppingCart, DollarSign } from 'lucide-react';
import { formatColombianCurrency } from '@/lib/utils';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // If needed for filters

interface MockCustomer {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  totalOrders: number; // Simulated
  totalSpent: number; // Simulated
}

const generateRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const generateRandomPastDate = (daysAgoMax: number): string => {
  const today = new Date();
  const pastDate = subDays(today, Math.floor(Math.random() * daysAgoMax));
  return pastDate.toISOString();
};


const allMockCustomers: MockCustomer[] = [
  { id: 'CUST001', name: 'Carlos Villa', email: 'carlos.villa@example.com', registrationDate: generateRandomPastDate(90), totalOrders: 5, totalSpent: 1250000 },
  { id: 'CUST002', name: 'Lucia Mora', email: 'lucia.mora@example.com', registrationDate: generateRandomPastDate(30), totalOrders: 2, totalSpent: 4800000 },
  { id: 'CUST003', name: 'Pedro Gómez', email: 'pedro.gomez@example.com', registrationDate: generateRandomPastDate(180), totalOrders: 10, totalSpent: 3200000 },
  { id: 'CUST004', name: 'Ana Méndez', email: 'ana.mendez@example.com', registrationDate: generateRandomPastDate(15), totalOrders: 1, totalSpent: 150000 },
  { id: 'CUST005', name: 'Sofia Vargas', email: 'sofia.vargas@example.com', registrationDate: generateRandomPastDate(60), totalOrders: 3, totalSpent: 7500000 },
  { id: 'CUST006', name: 'Luis Torres', email: 'luis.torres@example.com', registrationDate: generateRandomPastDate(5), totalOrders: 1, totalSpent: 200000 },
  { id: 'CUST007', name: 'Laura Bermudez', email: 'laura.bermudez@example.com', registrationDate: generateRandomPastDate(300), totalOrders: 15, totalSpent: 6500000 },
  { id: 'CUST008', name: 'Jorge Parra', email: 'jorge.parra@example.com', registrationDate: generateRandomPastDate(25), totalOrders: 2, totalSpent: 900000 },
  { id: 'CUST009', name: 'Elena Rios', email: 'elena.rios@example.com', registrationDate: generateRandomPastDate(120), totalOrders: 7, totalSpent: 2800000 },
  { id: 'CUST010', name: 'Andres Cruz', email: 'andres.cruz@example.com', registrationDate: generateRandomPastDate(10), totalOrders: 1, totalSpent: 500000 },
  { id: 'CUST011', name: 'Gabriela Solis', email: 'gabriela.solis@example.com', registrationDate: generateRandomPastDate(200), totalOrders: 8, totalSpent: 4100000 },
  { id: 'CUST012', name: 'Miguel Angel', email: 'miguel.angel@example.com', registrationDate: generateRandomPastDate(45), totalOrders: 4, totalSpent: 1900000 },
];

const ITEMS_PER_PAGE = 10;
// const registrationPeriods = ['Últimos 7 días', 'Últimos 30 días', 'Últimos 90 días']; // Example filter

export default function CustomersReportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof MockCustomer | null>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  // const [filterRegistrationPeriod, setFilterRegistrationPeriod] = useState<string>('');

  const filteredAndSortedCustomers = useMemo(() => {
    return allMockCustomers
      .filter(customer => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm =
          customer.id.toLowerCase().includes(lowerSearchTerm) ||
          customer.name.toLowerCase().includes(lowerSearchTerm) ||
          customer.email.toLowerCase().includes(lowerSearchTerm);
        // Add period filter logic here if implemented
        return matchesSearchTerm;
      })
      .sort((a, b) => {
        if (!sortColumn) return 0;
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortColumn === 'registrationDate') {
            comparison = new Date(valA).getTime() - new Date(valB).getTime();
          } else {
            comparison = valA.localeCompare(valB);
          }
        }
        return sortDirection === 'asc' ? comparison : comparison * -1;
      });
  }, [searchTerm, /*filterRegistrationPeriod,*/ sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const summary = useMemo(() => {
    const totalCustomers = filteredAndSortedCustomers.length;
    const newCustomersThisMonth = filteredAndSortedCustomers.filter(c => {
      const regDate = parseISO(c.registrationDate);
      const today = new Date();
      return regDate.getMonth() === today.getMonth() && regDate.getFullYear() === today.getFullYear();
    }).length;
    const averageSpent = totalCustomers > 0 ? filteredAndSortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers : 0;
    return { totalCustomers, newCustomersThisMonth, averageSpent };
  }, [filteredAndSortedCustomers]);

  const handleSort = (column: keyof MockCustomer) => {
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
          <Users className="mr-3 h-8 w-8 text-primary" />
          Reporte Detallado de Clientes
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Resumen de Clientes (Resultados Filtrados)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
              <p className="text-2xl font-bold">{summary.totalCustomers}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <UserPlus className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nuevos Clientes (Este Mes)</p>
              <p className="text-2xl font-bold">{summary.newCustomersThisMonth}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4 bg-card">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gasto Promedio</p>
              <p className="text-2xl font-bold">{formatColombianCurrency(summary.averageSpent)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtrar y Buscar Clientes
          </CardTitle>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input
              placeholder="Buscar ID, Nombre, Email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="md:col-span-1"
            />
            {/* 
            <Select value={filterRegistrationPeriod} onValueChange={(value) => { setFilterRegistrationPeriod(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Periodo de Registro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Periodos</SelectItem>
                {registrationPeriods.map(period => <SelectItem key={period} value={period}>{period}</SelectItem>)}
              </SelectContent>
            </Select>
            */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:text-primary">ID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-primary">Nombre {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:text-primary">Email {sortColumn === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('registrationDate')} className="cursor-pointer hover:text-primary">Fecha Registro {sortColumn === 'registrationDate' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('totalOrders')} className="text-right cursor-pointer hover:text-primary">Total Pedidos {sortColumn === 'totalOrders' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
                <TableHead onClick={() => handleSort('totalSpent')} className="text-right cursor-pointer hover:text-primary">Total Gastado {sortColumn === 'totalSpent' && (sortDirection === 'asc' ? '▲' : '▼')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-xs">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{format(parseISO(customer.registrationDate), "dd MMM yyyy", { locale: es })}</TableCell>
                  <TableCell className="text-right">{customer.totalOrders}</TableCell>
                  <TableCell className="text-right">{formatColombianCurrency(customer.totalSpent)}</TableCell>
                </TableRow>
              ))}
               {paginatedCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron clientes con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} (Total: {filteredAndSortedCustomers.length} clientes)
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
