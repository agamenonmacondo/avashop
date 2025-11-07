interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: hsl(220, 16%, 12%);">
        <div style="background: linear-gradient(135deg, hsl(45, 90%, 60%) 0%, hsl(45, 85%, 50%) 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: hsl(220, 16%, 12%); margin: 0; font-size: 32px; font-weight: 700;">
            ¡Gracias por tu pedido!
          </h1>
          <p style="color: hsl(220, 16%, 12%); margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            CCS724 - Compra Confianza Seguridad
          </p>
        </div>
        
        <div style="max-width: 600px; margin: 0 auto; background-color: hsl(220, 16%, 16%); padding: 40px 30px;">
          <h2 style="color: hsl(210, 40%, 98%); font-size: 24px; margin: 0 0 10px 0;">
            Hola ${customerName},
          </h2>
          <p style="color: hsl(220, 10%, 65%); line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>
          
          <div style="background-color: hsl(220, 16%, 20%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid hsl(220, 16%, 24%);">
            <h3 style="margin: 0 0 20px 0; color: hsl(45, 90%, 60%); font-size: 20px;">
              📦 Pedido #${orderId}
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid hsl(220, 16%, 24%);">
                  <th style="text-align: left; padding: 12px 8px; color: hsl(220, 10%, 65%); font-size: 14px;">Producto</th>
                  <th style="text-align: center; padding: 12px 8px; color: hsl(220, 10%, 65%); font-size: 14px;">Cant.</th>
                  <th style="text-align: right; padding: 12px 8px; color: hsl(220, 10%, 65%); font-size: 14px;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr style="border-bottom: 1px solid hsl(220, 16%, 24%);">
                    <td style="padding: 16px 8px; color: hsl(210, 40%, 98%); font-size: 15px;">${item.name}</td>
                    <td style="text-align: center; padding: 16px 8px;">
                      <span style="background: hsl(220, 16%, 24%); color: hsl(210, 40%, 98%); padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 15px;">
                        ${item.quantity}
                      </span>
                    </td>
                    <td style="text-align: right; padding: 16px 8px; color: hsl(210, 40%, 98%); font-size: 15px; font-weight: 500;">
                      $${item.price.toLocaleString('es-CO')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid hsl(45, 90%, 60%);">
                  <td colspan="2" style="padding: 20px 8px; text-align: right; font-weight: 600; color: hsl(220, 10%, 65%);">Total:</td>
                  <td style="text-align: right; padding: 20px 8px; font-weight: 700; color: hsl(45, 90%, 60%); font-size: 24px;">
                    $${total.toLocaleString('es-CO')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 71%, 45%) 100%); padding: 20px; border-radius: 12px;">
            <p style="margin: 0; color: white; font-size: 15px; line-height: 1.8;">
              <strong style="display: block; margin-bottom: 8px;">✅ Estado del pedido</strong>
              <span style="display: block; opacity: 0.95;">📍 En proceso</span>
              <span style="display: block; opacity: 0.95;">📧 ventas@ccs724.com</span>
            </p>
          </div>
        </div>
        
        <div style="background-color: hsl(220, 16%, 12%); padding: 40px 20px; text-align: center; border-top: 2px solid hsl(45, 90%, 60%);">
          <h3 style="margin: 0 0 8px 0; font-size: 24px; color: hsl(45, 90%, 60%); font-weight: 700;">CCS724</h3>
          <p style="margin: 0; color: hsl(220, 10%, 65%);">Compra Confianza Seguridad</p>
        </div>
      </body>
    </html>
  `;
}