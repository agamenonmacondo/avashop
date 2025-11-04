import nodemailer from 'nodemailer';

export async function sendOrderEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'ventas@ccs724.com',
      pass: process.env.EMAIL_PASS || '', // usa .env.local para esto
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"CCS724" <${process.env.EMAIL_USER || 'ventas@ccs724.com'}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    console.error('Error sending mail:', err);
    throw err;
  }
}