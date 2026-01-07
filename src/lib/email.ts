import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    cid?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  const mailOptions = {
    from: options.from || process.env.SMTP_FROM || 'noreply@ccs724.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string; // ✅ Agregado
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: { // ✅ Agregado como opcional
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export function getOrderConfirmationEmail(data: OrderConfirmationData): string {
  const PRODUCTION_URL = 'https://www.ccs724.com';
  
  const itemsHtml = data.items
    .map((item) => {
      const imageUrl = item.image?.startsWith('http') 
        ? item.image 
        : `${PRODUCTION_URL}${item.image}`;
      
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="80" style="padding-right: 15px; vertical-align: top;">
                  ${item.image ? `
                    <img 
                      src="${imageUrl}" 
                      alt="${item.name}" 
                      width="80" 
                      height="100" 
                      style="border-radius: 8px; object-fit: cover; border: 1px solid #e5e7eb; display: block;"
                    />
                  ` : `
                    <div style="width: 80px; height: 100px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #9ca3af;">
                      Sin imagen
                    </div>
                  `}
                </td>
                <td style="vertical-align: top;">
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 14px;">
                    ${item.name}
                  </div>
                  <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
                    Cantidad: ${item.quantity}
                  </div>
                  <div style="color: #059669; font-weight: 700; font-size: 15px;">
                    ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.price)}
                  </div>
                </td>
                <td width="120" align="right" style="vertical-align: top;">
                  <div style="font-weight: 700; color: #1f2937; font-size: 16px;">
                    ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  const shippingHtml = data.shippingAddress ? `
    <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 30px;">
      <h3 style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0 0 15px 0;">
        📍 Dirección de Envío
      </h3>
      <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
        <div><strong>Cliente:</strong> ${data.customerName}</div>
        <div><strong>Dirección:</strong> ${data.shippingAddress.street}</div>
        <div><strong>Ciudad:</strong> ${data.shippingAddress.city}</div>
        <div><strong>Departamento:</strong> ${data.shippingAddress.state}</div>
        <div><strong>País:</strong> ${data.shippingAddress.country}</div>
        ${data.shippingAddress.zipCode ? `<div><strong>Código Postal:</strong> ${data.shippingAddress.zipCode}</div>` : ''}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - CCS724</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    CCS724
                  </h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Útiles Escolares
                  </p>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background: #dcfce7; color: #059669; padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 14px;">
                      ✅ Pedido Confirmado
                    </div>
                  </div>
                  
                  <h2 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">
                    ¡Gracias por tu pedido, ${data.customerName}!
                  </h2>
                  
                  <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                    Hemos recibido tu pedido <strong>#${data.orderId}</strong> y lo procesaremos pronto. 
                    Te mantendremos informado sobre el estado de tu compra.
                  </p>

                  <!-- Productos -->
                  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 20px 0;">
                      📦 Productos Ordenados
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
                      ${itemsHtml}
                    </table>
                  </div>

                  ${shippingHtml}

                  <!-- Total -->
                  <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); border-radius: 12px; padding: 25px; margin-top: 30px; text-align: center;">
                    <div style="color: #d1d5db; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Total a Pagar
                    </div>
                    <div style="color: #EAB308; font-size: 36px; font-weight: 800;">
                      ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(data.total)}
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin-top: 40px;">
                    <a href="${PRODUCTION_URL}" style="display: inline-block; background: #EAB308; color: #1f2937; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 179, 8, 0.3);">
                      Ver Mi Pedido
                    </a>
                  </div>

                  <!-- Soporte -->
                  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                      ¿Necesitas ayuda? Contáctanos:
                    </p>
                    <div style="color: #4b5563; font-size: 14px;">
                      <div style="margin-bottom: 8px;">
                        📧 <a href="mailto:ventas@ccs724.com" style="color: #EAB308; text-decoration: none;">ventas@ccs724.com</a>
                      </div>
                      <div style="margin-bottom: 8px;">
                        📱 <a href="https://wa.me/573504017710" style="color: #EAB308; text-decoration: none;">+57 350 401 7710</a>
                      </div>
                      <div>
                        🌐 <a href="${PRODUCTION_URL}" style="color: #EAB308; text-decoration: none;">www.ccs724.com</a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                    © 2025 CCS724. Todos los derechos reservados.
                  </p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    Este es un email automático, por favor no respondas a este mensaje.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ✅ Template de email para solicitud de reseña
export function getReviewRequestEmail(data: {
  customerName: string;
  orderId: string;
  reviewLink: string;
  products: Array<{ name: string; imageUrl?: string }>;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Cuéntanos tu experiencia!</title>
    </head>
    <body>
      <h2>Hola ${data.customerName},</h2>
      <p>Gracias por tu compra (Pedido #${data.orderId}). Nos encantaría conocer tu opinión.</p>
      <a href="${data.reviewLink}">Dejar una reseña</a>
    </body>
    </html>
  `;
}