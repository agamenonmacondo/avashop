
'use server';

import { z } from 'zod';
import { products as allProducts } from '@/lib/placeholder-data';
import { createHash } from 'crypto';

// --- Schemas ---

const ShippingDetailsSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido (mín. 2 caracteres)."),
  address: z.string().min(5, "La dirección es requerida (mín. 5 caracteres)."),
  city: z.string().min(2, "La ciudad es requerida (mín. 2 caracteres)."),
  state: z.string().min(2, "El departamento es requerido (mín. 2 caracteres)."),
  zipCode: z.string().optional(),
  country: z.string().min(2, "El país es requerido (mín. 2 caracteres)."),
  email: z.string().email("Debe ser un correo electrónico válido."),
});

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
  stock: z.number(),
  imageUrls: z.array(z.string()).optional(),
});

const BaseOrderInputSchema = z.object({
    shippingDetails: ShippingDetailsSchema,
    cartItems: z.array(CartItemSchema).min(1, "El carrito no puede estar vacío."),
    totalAmount: z.number().positive("El monto total debe ser positivo."),
});

type BaseOrderInput = z.infer<typeof BaseOrderInputSchema>;


// --- Helper for Stock Check ---
function checkStock(cartItems: BaseOrderInput['cartItems']): { success: boolean; message?: string } {
    for (const item of cartItems) {
        const productInDb = allProducts.find(p => p.id === item.id);
        if (!productInDb) {
          return { success: false, message: `El producto "${item.name}" ya no está disponible.` };
        }
        if (productInDb.stock < item.quantity) {
          return {
            success: false,
            message: `No hay suficiente stock para "${item.name}". Disponible: ${productInDb.stock}, Solicitado: ${item.quantity}.`,
          };
        }
      }
    return { success: true };
}


// --- Action for Bold Payments ---

export async function createBoldPaymentData(
    input: BaseOrderInput
): Promise<{ success: boolean; message?: string; data?: any }> {
    console.log("--- Iniciando createBoldPaymentData Action ---");
    
    const validationResult = BaseOrderInputSchema.safeParse(input);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        console.error("Validación de entrada fallida en createBoldPaymentData:", errorMessage);
        return { success: false, message: `Error de validación: ${errorMessage}` };
    }
    
    const { shippingDetails, cartItems, totalAmount } = validationResult.data;

    const stockCheck = checkStock(cartItems);
    if (!stockCheck.success) {
        return { success: false, message: stockCheck.message };
    }

    const boldApiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY;
    const boldSecretKey = process.env.BOLD_SECRET_KEY;

    if (!boldApiKey || !boldSecretKey || boldApiKey.includes('YOUR_') || boldSecretKey.includes('YOUR_')) {
        console.error("Las claves de Bold no están configuradas en .env. Por favor, añada NEXT_PUBLIC_BOLD_API_KEY y BOLD_SECRET_KEY.");
        return { success: false, message: "La integración de pago con Bold no está configurada correctamente por el administrador." };
    }
    
    const orderId = `AVA-BOLD-${Date.now()}`;
    const amount = Math.round(totalAmount);
    const currency = 'COP';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9004';
    const redirectionUrl = `${appUrl}/order/success`;

    const concatenation = `${orderId}${amount}${currency}${boldSecretKey}`;
    const signature = createHash('sha256').update(concatenation).digest('hex');

    const customerData = JSON.stringify({
        email: shippingDetails.email,
        fullName: shippingDetails.fullName,
        phone: "", // Campo opcional no recolectado en el formulario actual
        dialCode: "", // Campo opcional
        documentNumber: "", // Campo opcional
        documentType: "", // Campo opcional
    });

    const billingAddress = JSON.stringify({
        address: shippingDetails.address,
        zipCode: shippingDetails.zipCode || "",
        city: shippingDetails.city,
        state: shippingDetails.state,
        country: "CO",
    });

    return {
        success: true,
        data: {
            apiKey: boldApiKey,
            orderId,
            amount,
            currency,
            signature,
            redirectionUrl,
            description: `Pedido ${orderId} - AVA Shop`,
            customerData,
            billingAddress,
        },
    };
}


// --- Action for Coinbase Payments ---

export async function createCoinbaseCharge(
  input: BaseOrderInput
): Promise<{ success: boolean; message?: string; redirectUrl?: string; }> {
    console.log("--- Iniciando createCoinbaseCharge Action ---");

    const validationResult = BaseOrderInputSchema.safeParse(input);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        console.error("Validación de entrada fallida en createCoinbaseCharge:", errorMessage);
        return { success: false, message: `Error de validación: ${errorMessage}` };
    }

    const { shippingDetails, cartItems, totalAmount } = validationResult.data;

    const stockCheck = checkStock(cartItems);
    if (!stockCheck.success) {
        return { success: false, message: stockCheck.message };
    }

    const orderId = `AVA-CB-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9004';

    const coinbaseApiKey = process.env.COINBASE_API_KEY;
    if (!coinbaseApiKey || coinbaseApiKey.includes('YOUR_') || coinbaseApiKey.trim() === '') {
        console.error("La API Key de Coinbase no está configurada en .env. Por favor, añada COINBASE_API_KEY.");
        return { success: false, message: "La integración de pago con criptomonedas no está configurada correctamente por el administrador." };
    }

    try {
        const chargeData = {
            name: `Pedido ${orderId} - AVA Shop`,
            description: `Compra de ${cartItems.length} tipos de productos.`,
            local_price: {
                amount: totalAmount.toFixed(2),
                currency: 'COP',
            },
            pricing_type: 'fixed_price',
            metadata: { order_id: orderId, customer_name: shippingDetails.fullName },
            redirect_url: `${appUrl}/order/success?order_id=${orderId}`,
            cancel_url: `${appUrl}/order/cancel?order_id=${orderId}`,
        };
        
        const response = await fetch('https://api.commerce.coinbase.com/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': coinbaseApiKey,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify(chargeData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("Error de la API de Coinbase:", responseData);
            throw new Error(responseData.error?.message || 'Error al crear el cargo en Coinbase.');
        }

        return { success: true, redirectUrl: responseData.data.hosted_url };

    } catch (error: any) {
        console.error("Fallo al procesar con Coinbase:", error);
        return { success: false, message: `Error al contactar a Coinbase: ${error.message}` };
    }
}
