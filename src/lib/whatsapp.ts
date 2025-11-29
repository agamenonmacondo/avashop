interface WhatsAppOrderData {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export function sendWhatsAppMessage(orderData: WhatsAppOrderData) {
  const phoneNumber = '573504017710'; // Número sin + ni espacios
  const { orderId, customerName, items, total } = orderData;

  // Crear listado de productos
  const productList = items
    .map((item, index) => 
      `${index + 1}. ${item.name}\n   Cantidad: ${item.quantity}\n   Precio: $${item.price.toLocaleString('es-CO')}`
    )
    .join('\n\n');

  const message = `¡Hola! Soy ${customerName}

Acabo de realizar una compra en CCS724 y quisiera hacer seguimiento del envío.

📦 *DETALLES DEL PEDIDO*
━━━━━━━━━━━━━━━━━━━━━━

*Número de Pedido:* #${orderId}

*Productos comprados:*

${productList}

━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL:* $${total.toLocaleString('es-CO')} COP

¿Podrían confirmarme el estado de mi pedido y la fecha estimada de entrega?

Gracias.`;

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Crear la URL de WhatsApp
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Abrir WhatsApp en una nueva pestaña
  window.open(whatsappUrl, '_blank');
}