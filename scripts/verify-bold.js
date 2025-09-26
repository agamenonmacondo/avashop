require('dotenv').config({ path: './.env.local' });

(async () => {
  const { NEXT_PUBLIC_BOLD_API_KEY, BOLD_SECRET_KEY } = process.env;

  if (!NEXT_PUBLIC_BOLD_API_KEY || !BOLD_SECRET_KEY) {
    console.error('Faltan variables de entorno NEXT_PUBLIC_BOLD_API_KEY o BOLD_SECRET_KEY en .env.local');
    process.exit(1);
  }

  // Reemplaza esta URL por el endpoint real de Bold para verificación/uso
  const endpoint = 'https://api.boldcommerce.com/example/verify';

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NEXT_PUBLIC_BOLD_API_KEY}`,
        'X-Bold-Secret': BOLD_SECRET_KEY
      }
    });

    console.log('HTTP', res.status);
    const body = await res.text();
    console.log('Respuesta:', body);
  } catch (err) {
    console.error('Error al conectar con Bold:', err.message || err);
    process.exit(1);
  }
})();