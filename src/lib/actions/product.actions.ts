'use server';

import { z } from 'zod';
import { storage, db } from '@/lib/firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Product } from '@/types';

// Schema for validating product data from the form
const productFormSchema = z.object({
  name: z.string().min(3, "El nombre del producto es requerido (mín. 3 caracteres)."),
  description: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)."),
  price: z.coerce.number().positive("El precio debe ser un número positivo."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  categoryId: z.string({ required_error: "Debes seleccionar una categoría." }),
});

async function uploadFile(file: File): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage no está inicializado');
  }

  const fileBuffer = await file.arrayBuffer();
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const storageRef = ref(storage, `product_images/${fileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => {
        console.error("Upload error:", error);
        reject(new Error(`Error al subir el archivo ${file.name}: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          console.error("Error getting download URL:", error);
          reject(new Error(`Error al obtener URL de descarga para ${file.name}: ${message}`));
        }
      }
    );
  });
}

export async function addProduct(
  formData: FormData
): Promise<{ success: boolean; message: string; productId?: string }> {
  try {
    if (!db) {
      return { success: false, message: 'Firestore no está inicializado' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string, 10);
    const categoryId = formData.get('categoryId') as string;

    const imageFile1 = formData.get('imageUrl1') as File | null;
    const imageFile2 = formData.get('imageUrl2') as File | null;
    
    const validation = productFormSchema.safeParse({ name, description, price, stock, categoryId });
    if (!validation.success) {
      return { success: false, message: `Error de validación: ${validation.error.errors.map(e => e.message).join(', ')}` };
    }

    if (!imageFile1 || imageFile1.size === 0) {
      return { success: false, message: 'La imagen principal es requerida.' };
    }
    
    const uploadedImageUrls: string[] = [];

    try {
      const imageUrl1 = await uploadFile(imageFile1);
      uploadedImageUrls.push(imageUrl1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen principal.';
      return { success: false, message };
    }

    if (imageFile2 && imageFile2.size > 0) {
      try {
        const imageUrl2 = await uploadFile(imageFile2);
        uploadedImageUrls.push(imageUrl2);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al subir la imagen secundaria.';
        console.warn("Error al subir la imagen secundaria, la imagen principal ya fue subida.");
        return { success: false, message };
      }
    }

    const newProductData = {
      name: validation.data.name,
      description: validation.data.description,
      price: validation.data.price,
      stock: validation.data.stock,
      categoryId: validation.data.categoryId,
      imageUrls: uploadedImageUrls,
      details: {},
      rating: 0,
      reviewsCount: 0,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const productsCollection = collection(db, 'products');
    const docRef = await addDoc(productsCollection, newProductData);

    return { success: true, message: 'Producto añadido exitosamente.', productId: docRef.id };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error del servidor';
    console.error('Error al añadir producto:', error);
    return { success: false, message: `Error del servidor: ${message}` };
  }
}

// ✅ Usar storage directamente en lugar de getFirebaseStorage()
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage no está inicializado');
  }
  
  const storageRef = ref(storage, `products/${productId}/${file.name}`);
  const fileBuffer = await file.arrayBuffer();
  
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => {
        console.error("Upload error:", error);
        reject(new Error(`Error al subir el archivo ${file.name}: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          console.error("Error getting download URL:", error);
          reject(new Error(`Error al obtener URL de descarga para ${file.name}: ${message}`));
        }
      }
    );
  });
}

// ✅ Usar db directamente en lugar de getFirebaseFirestore()
export async function getProducts(): Promise<Product[]> {
  if (!db) {
    throw new Error('Firestore no está inicializado');
  }
  
  const productsCollection = collection(db, 'products');
  // Agrega aquí la lógica para obtener productos
  return [];
}
