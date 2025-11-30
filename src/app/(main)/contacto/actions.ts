'use server';

import { sendEmail } from '@/lib/email';

export async function contactFormAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #000;">Nuevo Mensaje de Contacto Web</h2>
      <p>Has recibido una nueva consulta a través del formulario de contacto:</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <br />
      <h3 style="margin-bottom: 10px;">Mensaje:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: 'ventas@ccs724.com',
      subject: `[Contacto Web] ${subject} - ${name}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Error al enviar el correo' };
  }
}