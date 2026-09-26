export type CategoryId = 'all' | 'electronique' | 'accessoires' | 'quotidien' | 'nouveautes' | 'populaires';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'electronique' | 'accessoires' | 'quotidien' | 'nouveautes' | 'populaires';
  categoryLabel: string;
  price: number; // in FCFA
  oldPrice?: number; // in FCFA
  stock: number;
  featured: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  status: 'published' | 'draft';
  image: string;
  gallery: string[];
  description: string;
  // Maketou-style Sales Page structured fields
  catchphrase?: string; // Accroche commerciale percutante
  keyBenefits?: string[]; // 3 à 5 points forts majeurs
  boxContent?: string[]; // Ce qui est inclus dans le colis (Unboxing)
  warrantyNotice?: string; // Garantie & SAV
  specs: { label: string; value: string }[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Expédiée' | 'Livrée' | 'Annulée';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. PS-1024
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    note?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'wave' | 'momo' | 'card';
  paymentMethodLabel: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  whatsappNumber: string; // international format without + e.g. 22997000000
  whatsappGreeting: string;
  facebookPixelId: string;
  facebookPixelEnabled: boolean;
  adminPin: string;
  adminSecretSlug: string; // Secret URL slug e.g. "gestion-prime"
  bannerNotice: string;
  bannerEnabled: boolean;
  instagramHandle?: string;
  tiktokHandle?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface PixelEventLog {
  id: string;
  timestamp: string;
  eventName: string;
  payload: Record<string, any>;
}
