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
      is_new: !!p.isNew,
      is_popular: !!p.isPopular,
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

/* ------------------------------------------------------------------ */
/* CLOUD = SOURCE DE VÉRITÉ : lecture au démarrage, écriture à chaque */
/* enregistrement admin. Tout appareil voit la même boutique.          */
/* ------------------------------------------------------------------ */

const rowToProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  slug: r.slug || r.id,
  category: r.category,
  categoryLabel: r.category_label,
  price: Number(r.price) || 0,
  oldPrice: r.old_price != null ? Number(r.old_price) : undefined,
  stock: Number(r.stock) || 0,
  featured: r.featured ?? true,
  isNew: r.is_new ?? false,
  isPopular: r.is_popular ?? false,
  status: r.status || 'published',
  image: r.image,
  gallery: Array.isArray(r.gallery) && r.gallery.length ? r.gallery : [r.image],
  catchphrase: r.catchphrase || '',
  keyBenefits: r.key_benefits || [],
  boxContent: r.box_content || [],
  warrantyNotice: r.warranty_notice || '',
  description: r.description || '',
  specs: r.specs || [],
  rating: Number(r.rating) || 5,
  reviewsCount: Number(r.reviews_count) || 1,
  createdAt: r.created_at || new Date().toISOString(),
} as Product);

const rowToOrder = (r: any): Order => ({
  id: r.id,
  customer: r.customer,
  items: r.items,
  subtotal: Number(r.subtotal) || 0,
  deliveryFee: Number(r.delivery_fee) || 0,
  discount: Number(r.discount) || 0,
  total: Number(r.total) || 0,
  paymentMethod: r.payment_method,
  paymentMethodLabel: r.payment_method_label,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at || r.created_at,
} as Order);

export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return (data || []).map(rowToProduct);
  } catch {
    return null;
  }
};

export const fetchOrdersFromSupabase = async (): Promise<Order[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return (data || []).map(rowToOrder);
  } catch {
    return null;
  }
};

export const fetchSettingsFromSupabase = async (): Promise<Partial<StoreSettings> | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('store_settings').select('*').eq('id', 'primary').maybeSingle();
    if (error || !data) return null;
    const r: any = data;
    const s: Partial<StoreSettings> = {
      storeName: r.store_name,
      tagline: r.tagline,
      currency: r.currency,
      deliveryFee: Number(r.delivery_fee) || 0,
      freeDeliveryThreshold: Number(r.free_delivery_threshold) || 0,
      whatsappNumber: r.whatsapp_number,
      whatsappGreeting: r.whatsapp_greeting,
      facebookPixelId: r.facebook_pixel_id || '',
      facebookPixelEnabled: !!r.facebook_pixel_enabled,
      adminPin: r.admin_pin,
      adminSecretSlug: r.admin_secret_slug,
      bannerNotice: r.banner_notice,
      bannerEnabled: !!r.banner_enabled,
      instagramHandle: r.instagram_handle || '',
      tiktokHandle: r.tiktok_handle || '',
    } as Partial<StoreSettings>;
    // Ne jamais écraser une valeur locale par null/undefined
    Object.keys(s).forEach((k) => {
      if ((s as any)[k] === null || (s as any)[k] === undefined) delete (s as any)[k];
    });
    return s;
  } catch {
    return null;
  }
};

export const syncSettingsToSupabase = async (s: StoreSettings): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('store_settings').upsert({
      id: 'primary',
      store_name: s.storeName,
      tagline: s.tagline,
      currency: s.currency,
      delivery_fee: s.deliveryFee,
      free_delivery_threshold: s.freeDeliveryThreshold,
      whatsapp_number: s.whatsappNumber,
      whatsapp_greeting: s.whatsappGreeting,
      facebook_pixel_id: s.facebookPixelId || '',
      facebook_pixel_enabled: !!s.facebookPixelEnabled,
      admin_pin: s.adminPin,
      admin_secret_slug: s.adminSecretSlug,
      banner_notice: s.bannerNotice,
      banner_enabled: !!s.bannerEnabled,
      instagram_handle: s.instagramHandle || '',
      tiktok_handle: s.tiktokHandle || '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) {
      console.error('Erreur sync paramètres Supabase:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/** Upsert tous les produits ET supprime du cloud ceux retirés dans l'admin */
export const replaceProductsInSupabase = async (products: Product[]): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const ok = products.length ? await syncProductsToSupabase(products) : true;
    const { data } = await client.from('products').select('id');
    const keep = new Set(products.map((p) => p.id));
    const toDelete = (data || []).map((r: any) => r.id).filter((id: string) => !keep.has(id));
    if (toDelete.length) {
      await client.from('products').delete().in('id', toDelete);
    }
    return ok;
  } catch {
    return false;
  }
};

export const syncOrdersToSupabase = async (orders: Order[]): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    if (orders.length) {
      const rows = orders.map((o) => ({
        id: o.id,
        customer: o.customer,
        items: o.items,
        subtotal: o.subtotal,
        delivery_fee: o.deliveryFee || 0,
        discount: o.discount || 0,
        total: o.total,
        payment_method: o.paymentMethod,
        payment_method_label: o.paymentMethodLabel,
        status: o.status,
        created_at: o.createdAt,
        updated_at: o.updatedAt || o.createdAt,
      }));
      const { error } = await client.from('orders').upsert(rows, { onConflict: 'id' });
      if (error) return false;
    }
    const { data } = await client.from('orders').select('id');
    const keep = new Set(orders.map((o) => o.id));
    const toDelete = (data || []).map((r: any) => r.id).filter((id: string) => !keep.has(id));
    if (toDelete.length) await client.from('orders').delete().in('id', toDelete);
    return true;
  } catch {
    return false;
  }
};

export const fetchProductByIdFromSupabase = async (idOrSlug: string): Promise<Product | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.from('products').select('*').or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).limit(1);
    if (data && data.length) return rowToProduct(data[0]);
    return null;
  } catch {
    return null;
  }
};

/** Recherche d'une commande par numéro (ou fragment) ou téléphone pour le suivi colis */
export const fetchOrderFromSupabase = async (query: string): Promise<Order | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const q = query.trim();
  if (!q) return null;
  try {
    const { data } = await client.from('orders').select('*').ilike('id', `%${q}%`).limit(1);
    if (data && data.length) return rowToOrder(data[0]);
    const digits = q.replace(/[^0-9]/g, '');
    if (digits.length >= 8) {
      const { data: byPhone } = await client
        .from('orders')
        .select('*')
        .ilike('customer->>phone', `%${digits.slice(-8)}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      if (byPhone && byPhone.length) return rowToOrder(byPhone[0]);
    }
    return null;
  } catch {
    return null;
  }
};
