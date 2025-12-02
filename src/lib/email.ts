interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  try {
    // Email corporativo principal como remitente
    const fromEmail = from || 'ventas@ccs724.com';
    
    // Asegurar que el destinatario sea un array
    const toEmails = Array.isArray(to) ? to : [to];
    
    // Siempre incluir ccs724productos@gmail.com en copia (CC)
    const cc = ['ccs724productos@gmail.com'];

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        from: fromEmail,
        to: toEmails,
        cc: cc,
        subject, 
        html 
      }),
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

// ✅ NUEVO: Template de email para solicitud de reseña
export function getReviewRequestEmail(data: {
  customerName: string;
  orderId: string;
  reviewLink: string;
  products: Array<{ name: string; imageUrl?: string }>;
}) {
  const { customerName, orderId, reviewLink, products } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">⭐ ¡Tu opinión nos importa!</h1>
          <p style="font-size: 18px; color: #666;">Cuéntanos qué te pareció tu compra</p>
        </div>
        
        <p>Hola ${customerName},</p>
        
        <p>Esperamos que estés disfrutando de tu compra. Tu opinión es muy valiosa para nosotros y para otros clientes que están considerando estos productos.</p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Productos de tu pedido #${orderId}:</h3>
          ${products.map(product => `
            <div style="display: flex; align-items: center; margin: 10px 0; padding: 10px; background: white; border-radius: 6px;">
              ${product.imageUrl ? `
                <img src="${product.imageUrl}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
              ` : ''}
              <p style="margin: 0; font-weight: 500;">${product.name}</p>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${reviewLink}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ⭐ Dejar mi Reseña
          </a>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>💡 ¿Por qué es importante tu reseña?</strong><br>
            • Ayudas a otros clientes a tomar mejores decisiones<br>
            • Nos ayudas a mejorar nuestros productos y servicios<br>
            • Tu opinión tiene un badge de "✓ Compra Verificada"
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          El proceso solo toma 2 minutos y puedes calificar con estrellas y dejar un comentario sobre tu experiencia.
        </p>
        
        <p>¡Gracias por confiar en nosotros!</p>
        
        <p>Saludos cordiales,<br>
        <strong>CCS724</strong><br>
        Compra Confianza Seguridad</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          Este es un correo automático. Si tienes alguna pregunta, contáctanos en 
          <a href="mailto:ventas@ccs724.com" style="color: #2563eb;">ventas@ccs724.com</a>
        </p>
        
        <p style="font-size: 11px; color: #999; text-align: center;">
          Este link es personal y expira en 30 días.
        </p>
      </body>
    </html>
  `;
}