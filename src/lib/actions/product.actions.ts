
'use server';

import { z } from 'zod';
import { storage, db } from '@/lib/firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Product } from '@/types'; // Ensure Category is also exported or available if needed separately

// Schema for validating product data from the form (excluding files initially)
const productFormSchema = z.object({
  name: z.string().min(3, "El nombre del producto es requerido (mín. 3 caracteres)."),
  description: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)."),
  price: z.coerce.number().positive("El precio debe ser un número positivo."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  categoryId: z.string({ required_error: "Debes seleccionar una categoría." }),
  // Details will be added dynamically if necessary, or kept simple for now
});

async function uploadFile(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Create a unique file name
  const storageRef = ref(storage, `product_images/${fileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, fileBuffer, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: handle progress (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      },
      (error) => {
        console.error("Upload error:", error);
        reject(new Error(`Error al subir el archivo ${file.name}: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error: any) {
          console.error("Error getting download URL:", error);
          reject(new Error(`Error al obtener URL de descarga para ${file.name}: ${error.message}`));
        }
      }
    );
  });
}

export async function addProduct(
  formData: FormData
): Promise<{ success: boolean; message: string; productId?: string }> {
  try {
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

    // Upload image 1
    try {
      const imageUrl1 = await uploadFile(imageFile1);
      uploadedImageUrls.push(imageUrl1);
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al subir la imagen principal.' };
    }

    // Upload image 2 if it exists
    if (imageFile2 && imageFile2.size > 0) {
      try {
        const imageUrl2 = await uploadFile(imageFile2);
        uploadedImageUrls.push(imageUrl2);
      } catch (error: any) {
        // If primary image uploaded but secondary failed, we might want to decide if we proceed or rollback.
        // For now, we'll return an error. A more robust solution might delete the first image or allow saving with one image.
        console.warn("Error al subir la imagen secundaria, la imagen principal ya fue subida. Considere la limpieza manual o una lógica de rollback.");
        return { success: false, message: error.message || 'Error al subir la imagen secundaria.' };
      }
    }
    
    // TODO: Fetch category details from Firestore if needed, or store only categoryId
    // For now, we assume categoryId is sufficient and we can reconstruct category object on client or use it as a foreign key
    // const categoryDoc = await getDoc(doc(db, "categories", categoryId));
    // if (!categoryDoc.exists()) {
    //   return { success: false, message: "Categoría no válida." };
    // }
    // const categoryData = categoryDoc.data() as { name: string; slug: string; };


    const newProductData = {
      name: validation.data.name,
      description: validation.data.description,
      price: validation.data.price,
      stock: validation.data.stock,
      categoryId: validation.data.categoryId, // Store category ID
      // category: { id: categoryId, name: categoryData.name, slug: categoryData.slug }, // Or store full category object
      imageUrls: uploadedImageUrls,
      details: {}, // Add logic for details if form includes them
      rating: 0, // Default rating
      reviewsCount: 0, // Default reviews count
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const productsCollection = collection(db, 'products');
    const docRef = await addDoc(productsCollection, newProductData);

    return { success: true, message: 'Producto añadido exitosamente.', productId: docRef.id };

  } catch (error: any) {
    console.error('Error al añadir producto:', error);
    return { success: false, message: `Error del servidor: ${error.message}` };
  }
}
