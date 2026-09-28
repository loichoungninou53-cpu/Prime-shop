import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, StoreSettings } from '../types';

const STORAGE_KEY_URL = 'prime_supabase_url';
const STORAGE_KEY_KEY = 'prime_supabase_key';

export const DEFAULT_SUPABASE_URL = 'https://vicnstaqozxctyjlhxlz.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY25zdGFxb3p4Y3R5amxoeGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzYwNzEsImV4cCI6MjEwNjExMjA3MX0.2YD3ul2o1BYU3PPywTsdylRWK1Po8iSxFuQgE1j9cR0';

let cachedClient: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL,
    key: localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_KEY,
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  cachedClient = null; // Reset cached client
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    cachedClient = createClient(url, key);
    return cachedClient;
  } catch (err) {
    console.error('Erreur initialisation Supabase:', err);
    return null;
  }
};

/**
 * Test la connexion à Supabase
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'URL ou Clé API Supabase manquante.' };
  }

  try {
    const { error } = await client.from('products').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { success: false, message: 'La table "products" n\'existe pas encore. Avez-vous exécuté le script SQL ?' };
      }
      return { success: false, message: `Erreur Supabase: ${error.message}` };
    }
    return { success: true, message: 'Connexion réussie à Supabase ! Votre base de données est active.' };
  } catch (err: any) {
    return { success: false, message: `Impossible de contacter Supabase: ${err.message}` };
  }
};

/**
 * Synchronise les produits vers Supabase
 */
export const syncProductsToSupabase = async (products: Product[]): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const rows = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug || p.id,
      category: p.category,
      category_label: p.categoryLabel,
      price: p.price,
      old_price: p.oldPrice || null,
      stock: p.stock,
      featured: p.featured ?? true,
      status: p.status || 'published',
      image: p.image,
      gallery: p.gallery || [p.image],
      catchphrase: p.catchphrase || '',
      key_benefits: p.keyBenefits || [],
      box_content: p.boxContent || [],
      warranty_notice: p.warrantyNotice || '',
      description: p.description || '',
      specs: p.specs || [],
      rating: p.rating || 5.0,
      reviews_count: p.reviewsCount || 1,
    }));

    const { error } = await client.from('products').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Erreur sync produits Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception sync produits:', err);
    return false;
  }
};

/**
 * Enregistre une commande client sur Supabase
 */
export const saveOrderToSupabase = async (order: Order): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('orders').upsert({
      id: order.id,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee || 0,
      discount: order.discount || 0,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_method_label: order.paymentMethodLabel,
      status: order.status,
      created_at: order.createdAt,
      updated_at: order.updatedAt || order.createdAt,
    });

    if (error) {
      console.error('Erreur sauvegarde commande Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception commande Supabase:', err);
    return false;
  }
};
