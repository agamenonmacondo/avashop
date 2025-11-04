// Script de prueba: node scripts/test-email.js destinatario@ejemplo.com
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function main() {
  const toArg = process.argv[2];
  const to = toArg || process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;
  if (!to) {
    console.error('Falta destinatario. Pasa uno por argumento o define EMAIL_TEST_TO en .env.local');
    process.exit(1);
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    console.error('Faltan EMAIL_USER o EMAIL_PASS en .env.local');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  const html = `
    <h2>Prueba de correo — CCS724</h2>
    <p>Si recibes este correo, la configuración SMTP funciona.</p>
    <p>Fecha: ${new Date().toISOString()}</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"CCS724" <${user}>`,
      to,
      subject: 'Prueba SMTP — CCS724',
      html,
    });
    console.log('Correo enviado, messageId:', info.messageId || info.response || info);
    process.exit(0);
  } catch (err) {
    console.error('Error enviando correo:', err);
    process.exit(2);
  }
}

main();