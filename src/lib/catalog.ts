import { getSupabase } from './supabaseClient';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type Subcategory = {
  id: string;
  name: string;
  products: Product[];
};

export type Category = {
  id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
};

/**
 * Carga el catálogo completo desde Supabase
 */
export async function fetchCatalogFromSupabase(): Promise<Category[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      image,
      subcategories:subcategories (
        id,
        name,
        products:products (
          id,
          name,
          price,
          image
        )
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }

  return (data || []) as Category[];
}

/**
 * Guarda el carrito del usuario en Supabase
 */
export async function saveCartToSupabase(
  userEmail: string,
  cart: { [prodId: string]: number }
) {
  const supabase = getSupabase();
  if (!supabase) return;

  // Eliminar carrito anterior
  await supabase.from('user_carts').delete().eq('profile_id', userEmail);

  // Insertar nuevos items
  const items = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([product_id, quantity]) => ({
      profile_id: userEmail,
      product_id,
      quantity,
    }));

  if (items.length > 0) {
    const { error } = await supabase.from('user_carts').insert(items);
    if (error) console.error('Error saving cart:', error);
  }
}

/**
 * Carga el carrito del usuario desde Supabase
 */
export async function loadCartFromSupabase(
  userEmail: string
): Promise<{ [prodId: string]: number }> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('user_carts')
    .select('product_id, quantity')
    .eq('profile_id', userEmail);

  if (error) {
    console.error('Error loading cart:', error);
    return {};
  }

  return (data || []).reduce(
    (acc, item) => ({
      ...acc,
      [item.product_id]: item.quantity,
    }),
    {}
  );
}

/**
 * Crea una orden en Supabase
 */
export async function createOrder(
  userEmail: string,
  items: { id: string; name: string; price: number; quantity: number }[],
  total: number,
  shippingData: any
) {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const orderId = `UTI-${Date.now()}`;

  const { error } = await supabase.from('orders').insert({
    id: orderId,
    profile_id: userEmail,
    total_amount: total,
    items: JSON.stringify(items),
    shipping_address: JSON.stringify(shippingData),
    status: 'pending',
    payment_method: 'pending',
  });

  if (!error) {
    // Limpiar carrito después de crear orden
    await supabase.from('user_carts').delete().eq('profile_id', userEmail);
  }

  return { orderId, error };
}