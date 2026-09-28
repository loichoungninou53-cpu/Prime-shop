import { Product, Order, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Écouteurs Sans Fil Buds Pulse Pro (Réduction Active)',
    slug: 'ecouteurs-sans-fil-buds-pulse-pro',
    category: 'electronique',
    categoryLabel: 'Électronique',
    price: 25000,
    oldPrice: 35000,
    stock: 14,
    featured: true,
    isPopular: true,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'
    ],
    catchphrase: 'Isolez-vous du bruit et profitez d\'un son pur haute fidélité où que vous soyez.',
    keyBenefits: [
      'Réduction active du bruit ambiant ANC 35dB pour les appels et la musique',
      'Autonomie exceptionnelle de 32 heures avec le boîtier de recharge sans fil',
      'Connexion Bluetooth 5.3 instantanée avec portée de 15 mètres sans coupure',
      'Résistance IPX5 contre la sueur, la pluie et les éclaboussures'
    ],
    boxContent: [
      '1x Paire d\'écouteurs Buds Pulse Pro',
      '1x Boîtier de charge rapide USB-C',
      '3x Paires d\'embouts silicone à mémoire de forme (S, M, L)',
      '1x Câble de charge tressé renforcé',
      '1x Guide d\'utilisation en français'
    ],
    warrantyNotice: 'Garantie 12 mois avec remplacement direct à neuf sous 48h en cas de défaut.',
    description: 'Conçus pour les mélomanes et les professionnels exigeants, les Buds Pulse Pro combinent transducteurs haute résolution et réduction de bruit hybride pour un confort d\'écoute inégalé.',
    specs: [
      { label: 'Autonomie', value: '32h totale (8h en continu)' },
      { label: 'Réduction', value: 'Active ANC 35dB' },
      { label: 'Connectivité', value: 'Bluetooth 5.3' },
      { label: 'Étanchéité', value: 'Norme IPX5' }
    ],
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-09-10'
  },
  {
    id: 'prod-02',
    name: 'Montre Connectée Watch Pro X (Appels & Santé)',
    slug: 'montre-connectee-watch-pro-x',
    category: 'electronique',
    categoryLabel: 'Électronique',
    price: 45000,
    oldPrice: 60000,
    stock: 9,
    featured: true,
    isPopular: true,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    catchphrase: 'Passez vos appels et surveillez votre forme d\'un simple geste au poignet.',
    keyBenefits: [
      'Écran AMOLED 1.95" ultra-lumineux lisible en plein soleil',
      'Haut-parleur & micro HD intégrés pour passer et recevoir des appels Bluetooth',
      'Capteurs santé de précision : Fréquence cardiaque, SpO2 et suivi de sommeil',
      'Batterie longue durée offrant 7 à 10 jours d\'utilisation continue'
    ],
    boxContent: [
      '1x Montre connectée Watch Pro X',
      '1x Bracelet silicone sport confort',
      '1x Bracelet cuir offert dans le coffret',
      '1x Câble de charge magnétique rapide',
      '1x Notice en français'
    ],
    warrantyNotice: 'Garantie constructeur 12 mois + SAV réactif sur WhatsApp 7j/7.',
    description: 'La montre connectée la plus polyvalente pour suivre vos journées de travail, vos séances de sport et vos notifications WhatsApp sans sortir votre téléphone.',
    specs: [
      { label: 'Écran', value: '1.95" AMOLED HD' },
      { label: 'Autonomie', value: '7 à 10 jours' },
      { label: 'Appels', value: 'Micro & Haut-parleur HD' },
      { label: 'Compatibilité', value: 'Android & iOS' }
    ],
    rating: 4.8,
    reviewsCount: 52,
    createdAt: '2026-09-12'
  },
  {
    id: 'prod-03',
    name: 'Chargeur Ultra Rapide GaN 65W Multi-Ports',
    slug: 'chargeur-ultra-rapide-gan-65w',
    category: 'accessoires',
    categoryLabel: 'Accessoires',
    price: 18000,
    oldPrice: 24000,
    stock: 22,
    featured: true,
    isPopular: true,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    catchphrase: 'Un seul chargeur compact pour alimenter votre PC, tablette et smartphone en vitesse Turbo.',
    keyBenefits: [
      'Technologie GaN (Nitrure de Gallium) : 50% plus compact et ne chauffe pas',
      'Charge 65W Power Delivery : 0 à 60% en seulement 25 minutes',
      '3 ports de charge simultanée (2x USB-C + 1x USB-A)',
      'Puce intelligente anti-surtension pour protéger la batterie de vos appareils'
    ],
    boxContent: [
      '1x Bloc chargeur GaN 65W Power Pro',
      '1x Câble USB-C vers USB-C 100W tressé renforcé (1.5m)',
      '1x Fiche de garantie'
    ],
    warrantyNotice: 'Garantie de 12 mois pièces et main d\'œuvre.',
    description: 'Fini d\'emporter 3 chargeurs différents en déplacement. Ce boîtier GaN 65W gère votre ordinateur portable et tous vos téléphones en sécurité.',
    specs: [
      { label: 'Puissance', value: '65W Max Power Delivery' },
      { label: 'Ports', value: '2x Type-C + 1x Type-A' },
      { label: 'Sécurité', value: 'MultiProtect 8 couches' }
    ],
    rating: 4.9,
    reviewsCount: 41,
    createdAt: '2026-09-05'
  },
  {
    id: 'prod-04',
    name: 'Bouteille Thermos Smart Température LED 500ml',
    slug: 'bouteille-thermos-smart-temperature-led',
    category: 'quotidien',
    categoryLabel: 'Produits du quotidien',
    price: 14000,
    oldPrice: 19000,
    stock: 12,
    featured: true,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
    ],
    catchphrase: 'Gardez vos boissons glacées 24h ou chaudes 12h avec lecture digitale de la température.',
    keyBenefits: [
      'Écran tactile LED sur le bouchon indiquant la température exacte du liquide',
      'Double paroi sous vide en acier inoxydable 304 qualité médicale',
      'Zéro fuite : joint torique hermétique silicone étanche à 360°',
      'Pile intégrée à ultra-faible consommation (plus de 2 ans sans recharge)'
    ],
    boxContent: [
      '1x Bouteille isotherme Smart LED 500ml',
      '1x Filtre à thé / infusion en acier inox amovible',
      '1x Boîte cadeau protectrice'
    ],
    warrantyNotice: 'Garantie isotherme 100% satisfait ou remboursé sous 7 jours.',
    description: 'L\'accessoire indispensable au bureau, en voiture ou au sport pour s\'hydrater à la température idéale tout au long de la journée.',
    specs: [
      { label: 'Capacité', value: '500 ml' },
      { label: 'Matériau', value: 'Acier Inox 304 alimentaire' },
      { label: 'Affichage', value: 'Écran tactile LED étanche' }
    ],
    rating: 4.7,
    reviewsCount: 22,
    createdAt: '2026-09-02'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'PS-1024',
    customer: {
      fullName: 'Amina Dossou',
      phone: '+229 97 12 34 56',
      city: 'Cotonou, Haie Vive',
      address: 'Haie Vive, Rue 310, Immeuble Horizon',
      note: 'Livraison vers 17h'
    },
    items: [
      {
        productId: 'prod-01',
        name: 'Écouteurs Sans Fil Buds Pulse Pro',
        price: 25000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 25000,
    deliveryFee: 1500,
    discount: 0,
    total: 26500,
    paymentMethod: 'cod',
    paymentMethodLabel: 'Paiement à la livraison',
    status: 'En préparation',
    createdAt: '2026-09-22 14:32',
    updatedAt: '2026-09-22 15:10'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Prime Shop',
  tagline: 'Tout ce qu’il vous faut. Au même endroit.',
  currency: 'FCFA',
  deliveryFee: 1500,
  freeDeliveryThreshold: 35000,
  whatsappNumber: '22960416703',
  whatsappGreeting: 'Bonjour Prime Shop, je souhaite passer une commande.',
  facebookPixelId: '109823471829381',
  facebookPixelEnabled: true,
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

export function saveStoredProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
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
    if (!parsed.whatsappNumber || parsed.whatsappNumber === '22997000000') {
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
