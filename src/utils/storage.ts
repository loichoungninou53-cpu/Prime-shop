import { Product, Order, StoreSettings } from '../types';

// Aucune donnée fictive : le catalogue réel vit dans Supabase (source de vérité)
// et se charge automatiquement au démarrage de la boutique.
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Prime Shop',
  tagline: 'Tout ce qu’il vous faut. Au même endroit.',
  currency: 'FCFA',
  deliveryFee: 1500,
  freeDeliveryThreshold: 35000,
  whatsappNumber: '22960416703',
  whatsappGreeting: 'Bonjour Prime Shop, je souhaite passer une commande.',
  facebookPixelId: '',
  facebookPixelEnabled: false,
  adminPin: 'admin123',
  adminSecretSlug: 'gestion-prime', // Secret route only known to the owner
  bannerNotice: '⚡ Livraison offerte dès 35 000 FCFA d\'achats ! Paiement à la réception à Cotonou & Calavi.',
  bannerEnabled: true,
  instagramHandle: 'primeshop.bj',
  tiktokHandle: 'primeshop.bj',
};

const PRODUCTS_KEY = 'prime_shop_products';
const ORDERS_KEY = 'prime_shop_orders';
const SETTINGS_KEY = 'prime_shop_settings';
const WISHLIST_KEY = 'prime_shop_wishlist';

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

/**
 * Cache local des produits. Supabase est la source de vérité : si le quota
 * localStorage (~5 Mo) est dépassé (photos en base64), on stocke une version
 * allégée sans les images embarquées au lieu de lever une exception.
 */
export function saveStoredProducts(products: Product[]) {
  const persist = (list: Product[]) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  try {
    persist(products);
  } catch (err) {
    console.warn('Cache produits : quota localStorage dépassé, version allégée conservée.', err);
    try {
      const light = products.map((p) => ({
        ...p,
        image: p.image?.startsWith('data:') ? '' : p.image,
        gallery: (p.gallery || []).filter((g) => !g.startsWith('data:')),
      }));
      persist(light);
    } catch {
      localStorage.removeItem(PRODUCTS_KEY);
    }
  }
  window.dispatchEvent(new CustomEvent('prime_products_updated', { detail: products }));
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('prime_orders_updated', { detail: orders }));
}

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (parsed.facebookPixelId === '109823471829381') {
      parsed.facebookPixelId = '';
      parsed.facebookPixelEnabled = false;
    }
    if (!parsed.whatsappNumber || parsed.whatsappNumber === '22997000000' || parsed.whatsappNumber === '22990000000') {
      parsed.whatsappNumber = '22960416703';
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...INITIAL_SETTINGS, ...parsed }));
    }
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('prime_settings_updated', { detail: settings }));
}

export function getWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlist(productId: string): string[] {
  const list = getWishlist();
  const index = list.indexOf(productId);
  let updated: string[];
  if (index > -1) {
    updated = list.filter((id) => id !== productId);
  } else {
    updated = [...list, productId];
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prime_wishlist_updated', { detail: updated }));
  return updated;
}

export function formatPrice(amount: number, currency: string = 'FCFA'): string {
  return amount.toLocaleString('fr-FR') + ' ' + currency;
}
