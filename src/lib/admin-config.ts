// Lista de correos autorizados para el dashboard de administración
export const AUTHORIZED_ADMIN_EMAILS = [
  'agamenonmacondo@gmail.com',
  // Agrega más correos aquí si necesitas
];

export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}