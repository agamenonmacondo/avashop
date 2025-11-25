interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // Siempre incluir ccs724productos@gmail.com en copia
    const recipients = Array.isArray(to)
      ? [...to, 'ccs724productos@gmail.com']
      : [to, 'ccs724productos@gmail.com'];

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: recipients, subject, html }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Error al enviar correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
}

export function getOrderConfirmationEmail(orderData: {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  const { orderId, customerName, items, total } = orderData;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Confirmación de Pedido #${orderId}</h2>
        
        <p>Hola ${customerName},</p>
        
        <p>Gracias por tu compra. A continuación encontrarás los detalles de tu pedido:</p>
        
        <h3>Productos comprados:</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #ddd;">
              <th style="text-align: left; padding: 8px;">Producto</th>
              <th style="text-align: center; padding: 8px;">Cantidad</th>
              <th style="text-align: right; padding: 8px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${item.name}</td>
                <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px;">$${item.price.toLocaleString('es-CO')}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #333;">
              <td colspan="2" style="text-align: right; padding: 12px 8px; font-weight: bold;">Total:</td>
              <td style="text-align: right; padding: 12px 8px; font-weight: bold;">$${total.toLocaleString('es-CO')}</td>
            </tr>
          </tfoot>
        </table>
        
        <p>Tu pedido está siendo procesado y te informaremos sobre su estado.</p>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos a ventas@ccs724.com</p>
        
        <p>Saludos cordiales,<br>
        <strong>CCS724</strong><br>
        Compra Confianza Seguridad</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </body>
    </html>
  `;
}