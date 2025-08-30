
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/placeholder-data';
import { PackagePlus, ChevronLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { addProduct } from '@/lib/actions/product.actions'; // Import the server action
import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const addProductFormSchema = z.object({
  name: z.string().min(3, "El nombre del producto es requerido (mín. 3 caracteres)."),
  description: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)."),
  price: z.coerce.number().positive("El precio debe ser un número positivo."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  categoryId: z.string({ required_error: "Debes seleccionar una categoría." }),
  imageUrl1: z.any()
    .refine((files: FileList | undefined) => files && files.length > 0, { message: "La imagen principal es requerida." })
    .refine((files: FileList | undefined) => files && files[0]?.size <= MAX_FILE_SIZE, { message: `La imagen principal no debe exceder ${MAX_FILE_SIZE / (1024*1024)}MB.`})
    .refine((files: FileList | undefined) => files && ACCEPTED_IMAGE_TYPES.includes(files[0]?.type), { message: "Tipo de archivo no soportado para la imagen principal."}),
  imageUrl2: z.any()
    .optional()
    .refine((files: FileList | undefined) => !files || files.length === 0 || (files && files[0]?.size <= MAX_FILE_SIZE), { message: `La imagen secundaria no debe exceder ${MAX_FILE_SIZE / (1024*1024)}MB.`})
    .refine((files: FileList | undefined) => !files || files.length === 0 || (files && ACCEPTED_IMAGE_TYPES.includes(files[0]?.type)), { message: "Tipo de archivo no soportado para la imagen secundaria."}),
});

type AddProductFormValues = z.infer<typeof addProductFormSchema>;

export default function AddProductPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: undefined,
      imageUrl1: undefined,
      imageUrl2: undefined,
    },
  });

  async function onSubmit(data: AddProductFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId);

    if (data.imageUrl1 && data.imageUrl1.length > 0) {
      formData.append('imageUrl1', data.imageUrl1[0]);
    }
    if (data.imageUrl2 && data.imageUrl2.length > 0) {
      formData.append('imageUrl2', data.imageUrl2[0]);
    }

    const result = await addProduct(formData);

    if (result.success) {
      toast({
        title: "Producto Añadido",
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        title: "Error al Añadir Producto",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
         <Button variant="outline" size="sm" asChild className="mb-0 md:mb-0">
            <Link href="/admin/dashboard">
                <ChevronLeft className="mr-1 h-4 w-4" /> Volver al Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-right flex items-center">
          <PackagePlus className="mr-3 h-8 w-8 text-primary" />
          Añadir Nuevo Producto
        </h1>
      </div>

      <Card className="shadow-xl max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Producto</CardTitle>
          <CardDescription>Completa la información para añadir un nuevo producto al catálogo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl><Input placeholder="Ej: iPhone 15 Pro Max" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea placeholder="Describe las características principales del producto..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (COP)</FormLabel>
                      <FormControl><Input type="number" placeholder="Ej: 4500000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Inicial</FormLabel>
                      <FormControl><Input type="number" placeholder="Ej: 50" {...field} min="0" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl1"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <UploadCloud className="mr-2 h-4 w-4 text-muted-foreground" />
                      Imagen Principal
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(event) => onChange(event.target.files)} 
                        {...rest} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl2"
                render={({ field: { onChange, value, ...rest } }) => ( 
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <UploadCloud className="mr-2 h-4 w-4 text-muted-foreground" />
                      Imagen Secundaria (Opcional)
                    </FormLabel>
                     <FormControl>
                      <Input 
                        type="file" 
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(event) => onChange(event.target.files)}
                        {...rest} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={isSubmitting}>
                {isSubmitting ? 'Añadiendo Producto...' : (
                  <>
                    <PackagePlus className="mr-2 h-5 w-5" /> Añadir Producto
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
