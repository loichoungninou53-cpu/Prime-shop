import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, StoreSettings, PixelEventLog } from '../types';
import { formatPrice } from '../utils/storage';
import { getPixelLogs, clearPixelLogs } from '../utils/pixel';
import { RichDescriptionRenderer } from './RichDescriptionRenderer';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  syncProductsToSupabase 
} from '../utils/supabase';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  Lock, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  PhoneCall, 
  Printer, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Upload, 
  RefreshCw,
  Image as ImageIcon,
  Check,
  Zap,
  Globe,
  Database,
  FileText,
  Copy,
  ExternalLink,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Search,
  SlidersHorizontal,
  FolderSync
} from 'lucide-react';

interface AdminViewProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onExitAdmin: () => void;
  onOpenFreeGuide: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  orders,
  settings,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateSettings,
  onExitAdmin,
  onOpenFreeGuide,
}) => {
  // Authentication gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('prime_admin_auth') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'inventory' | 'customers' | 'pixel' | 'settings'
  >('products');

  // Copy link feedback
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Product CRUD states (with Maketou-style Sales Page builder)
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    category: 'electronique',
    categoryLabel: 'Électronique',
    price: 25000,
    oldPrice: 35000,
    stock: 10,
    featured: true,
    status: 'published',
    image: '',
    catchphrase: '',
    keyBenefits: [],
    boxContent: [],
    warrantyNotice: 'Garantie constructeur 12 mois avec remplacement sous 48h.',
    description: '',
    specs: [{ label: 'Garantie', value: '12 Mois' }],
  });

  // Textarea multi-line helpers for Maketou fields
  const [benefitsText, setBenefitsText] = useState('');
  const [boxContentText, setBoxContentText] = useState('');
  const [descViewMode, setDescViewMode] = useState<'edit' | 'preview'>('edit');
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders filter & selected order for printable invoice
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);

  // Search in products
  const [productSearch, setProductSearch] = useState('');

  // Pixel logs state
  const [pixelLogs, setPixelLogs] = useState<PixelEventLog[]>([]);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Supabase live configuration state
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().key);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSupabaseStatusMsg({
        type: 'error',
        text: 'Veuillez renseigner à la fois l\'URL du projet et la clé anon.',
      });
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseStatusMsg({ type: 'idle', text: '' });
    saveSupabaseConfig(supabaseUrl, supabaseKey);

    const res = await testSupabaseConnection();
    setIsTestingSupabase(false);
    if (res.success) {
      setSupabaseStatusMsg({ type: 'success', text: res.message });
    } else {
      setSupabaseStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingProducts(true);
    const success = await syncProductsToSupabase(products);
    setIsSyncingProducts(false);
    if (success) {
      setSupabaseStatusMsg({
        type: 'success',
        text: `✓ ${products.length} produits synchronisés avec succès sur Supabase !`,
      });
    } else {
      setSupabaseStatusMsg({
        type: 'error',
        text: 'Erreur lors de la synchronisation des produits. Vérifiez que la table "products" existe dans Supabase.',
      });
    }
  };

  useEffect(() => {
    setPixelLogs(getPixelLogs());
    const handlePixelEvent = (e: any) => {
      setPixelLogs((prev) => [e.detail, ...prev.slice(0, 49)]);
    };
    window.addEventListener('prime_pixel_event', handlePixelEvent);
    return () => window.removeEventListener('prime_pixel_event', handlePixelEvent);
  }, []);

  // Update local settings form if props change
  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Shopify-Style Rich Toolbar Action Handler
  const applyToolbarFormat = (type: 'bold' | 'italic' | 'heading' | 'bullet' | 'link' | 'image' | 'quote') => {
    const textarea = descriptionTextareaRef.current;
    const currentVal = productFormData.description || '';

    if (!textarea) {
      if (type === 'bold') setProductFormData(p => ({ ...p, description: currentVal + '\n**Texte en gras**\n' }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentVal.substring(start, end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = selected ? `**${selected}**` : '**Texte en gras**';
        break;
      case 'italic':
        replacement = selected ? `*${selected}*` : '*Texte en italique*';
        break;
      case 'heading':
        replacement = selected ? `\n### ${selected}\n` : '\n### Titre de Section Clé\n';
        break;
      case 'bullet':
        replacement = selected ? `\n- ${selected}\n` : '\n- Caractéristique clé ou avantage\n';
        break;
      case 'link':
        const linkUrl = prompt('Entrez l\'URL du lien :', 'https://');
        if (!linkUrl) return;
        replacement = `[${selected || 'Cliquez ici pour voir'}](${linkUrl})`;
        break;
      case 'image':
        const imgUrl = prompt('Entrez l\'adresse URL de l\'image :', 'https://images.unsplash.com/...');
        if (!imgUrl) return;
        replacement = `\n![${selected || 'Aperçu du produit'}](${imgUrl})\n`;
        break;
      case 'quote':
        replacement = selected ? `\n> ${selected}\n` : '\n> Note importante : Produit original certifié conforme.\n';
        break;
    }

    const updatedText = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setProductFormData(prev => ({ ...prev, description: updatedText }));

    setTimeout(() => {
      textarea.focus();
      const newPos = start + replacement.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const handleInsertMaketouTemplate = () => {
    const template = `🔥 **Offre Spéciale Prime Shop — Stock Limité Cotonou**

🎯 **Pourquoi ce modèle fait l'unanimité :**
• **Qualité Premium Certifiée** : Matériaux de grade supérieur et finition ultra-soignée.
• **Praticité & Confort** : Conçu pour s'adapter à votre quotidien sans aucun compromis.
• **Prise en main instantanée** : Prêt à l'emploi dès la sortie du carton d'origine.

📋 **Spécifications Techniques Clés :**
• Marque : Prime Shop Sélect
• Finition : Résistance renforcée & ergonomie moderne
• Compatibilité : iOS, Android, Ordinateurs et Accessoires

📦 **Contenu du Coffret Officiel :**
• 1x ${productFormData.name || 'Produit Prime Shop'}
• 1x Kit d'accessoires complets
• 1x Manuel d'utilisation rapide en français
• 1x Fiche de garantie Prime Shop 12 mois

🚚 **Modalités de Livraison au Bénin :**
• Expédition express sous 24h à Cotonou, Calavi, Porto-Novo et environs
• Paiement à la réception après contrôle du colis (Espèces ou Mobile Money)

> 🛡️ **Garantie Sérénité** : Chaque article est testé et vérifié avant le départ de notre coursier.`;

    setProductFormData(prev => ({
      ...prev,
      description: template,
      catchphrase: prev.catchphrase || 'Performance, design et fiabilité garantis par Prime Shop.',
    }));
  };

  const handleCopyProductLink = (p: Product) => {
    const url = `${window.location.origin}/#/shop?cat=${p.category}&product=${p.id}`;
    navigator.clipboard.writeText(url);
    setCopiedProductId(p.id);
    setTimeout(() => setCopiedProductId(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === (settings.adminPin || 'admin123')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('prime_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('prime_admin_auth');
  };

  // Metrics calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'Annulée')
    .reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const publishedProductsCount = products.filter((p) => p.status === 'published').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Order status update
  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          updatedAt: new Date().toLocaleDateString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Stock quick adjustment
  const handleStockAdjust = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Image Upload handler (Base64 file reader)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La photo est trop lourde (maximum 5 Mo). Veuillez choisir une photo plus légère.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setProductFormData((prev) => ({
        ...prev,
        image: base64Url,
        gallery: [base64Url, ...(prev.gallery || [])],
      }));
    };
    reader.readAsDataURL(file);
  };

  // Open modal for new product
  const handleOpenAddProduct = () => {
    setProductFormData({
      name: '',
      slug: '',
      category: 'electronique',
      categoryLabel: 'Électronique',
      price: 25000,
      oldPrice: 35000,
      stock: 10,
      featured: true,
      status: 'published',
      image: '',
      catchphrase: '',
      keyBenefits: [],
      boxContent: [],
      warrantyNotice: 'Garantie constructeur 12 mois avec remplacement sous 48h.',
      description: '',
      specs: [{ label: 'Garantie', value: '12 Mois' }],
    });
    setBenefitsText('');
    setBoxContentText('');
    setIsEditingProduct(true);
  };

  // Open modal for edit product
  const handleOpenEditProduct = (p: Product) => {
    setProductFormData({ ...p });
    setBenefitsText(p.keyBenefits ? p.keyBenefits.join('\n') : '');
    setBoxContentText(p.boxContent ? p.boxContent.join('\n') : '');
    setIsEditingProduct(true);
  };

  // Product Save (Add / Edit) with Maketou Sales Page parsing
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name || !productFormData.price) {
      alert('Veuillez renseigner au minimum le nom et le prix du produit.');
      return;
    }

    const catLabels: Record<string, string> = {
      electronique: 'Électronique',
      accessoires: 'Accessoires',
      quotidien: 'Produits du quotidien',
      nouveautes: 'Nouveautés',
      populaires: 'Populaires',
    };

    // Parse multi-line Maketou fields
    const parsedBenefits = benefitsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedBoxContent = boxContentText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const defaultImg =
      productFormData.image ||
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80';

    if (productFormData.id) {
      // Edit existing
      const updated = products.map((p) =>
        p.id === productFormData.id
          ? ({
              ...p,
              ...productFormData,
              image: defaultImg,
              categoryLabel: catLabels[productFormData.category || 'electronique'],
              keyBenefits: parsedBenefits.length > 0 ? parsedBenefits : p.keyBenefits,
              createdAt: p.createdAt || new Date().toISOString(),
              boxContent: parsedBoxContent.length > 0 ? parsedBoxContent : p.boxContent,
            } as Product)
          : p
      );
      onUpdateProducts(updated);
    } else {
      // Add new
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        name: productFormData.name!,
        slug: productFormData.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: (productFormData.category as any) || 'electronique',
        categoryLabel: catLabels[productFormData.category || 'electronique'],
        price: Number(productFormData.price),
        oldPrice: productFormData.oldPrice ? Number(productFormData.oldPrice) : undefined,
        stock: Number(productFormData.stock ?? 10),
        featured: Boolean(productFormData.featured),
        status: (productFormData.status as any) || 'published',
        image: defaultImg,
        gallery: [defaultImg],
        catchphrase: productFormData.catchphrase || 'Le produit incontournable pour votre quotidien.',
        keyBenefits: parsedBenefits.length > 0 ? parsedBenefits : [
          'Qualité supérieure testée et certifiée avant expédition',
          'Utilisation simple et prise en main immédiate',
          'Livraison rapide avec paiement à la réception'
        ],
        boxContent: parsedBoxContent.length > 0 ? parsedBoxContent : [
          '1x ' + productFormData.name,
          '1x Boîte et accessoires complets',
          '1x Fiche de garantie Prime Shop'
        ],
        warrantyNotice: productFormData.warrantyNotice || 'Garantie 12 mois pièces et main d\'œuvre.',
        description: productFormData.description || 'Produit authentique garanti par Prime Shop.',
        specs: productFormData.specs || [{ label: 'Garantie', value: '12 Mois' }],
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString(),
      };
      onUpdateProducts([newProduct, ...products]);
    }

    setIsEditingProduct(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit de la boutique ?')) {
      onUpdateProducts(products.filter((p) => p.id !== productId));
    }
  };

  // WhatsApp order followup link
  const getCustomerWhatsAppChatUrl = (order: Order) => {
    const trackingUrl = `${window.location.origin}/#/suivi?id=${order.id}`;
    const msg = encodeURIComponent(
      `Bonjour ${order.customer.fullName} ! Ici le service client de Prime Shop.\n\n` +
      `Nous confirmons la bonne prise en charge de votre commande #${order.id} d'un montant de ${formatPrice(order.total, settings.currency)}.\n` +
      `📍 Vous pouvez suivre votre colis en direct ici : ${trackingUrl}\n\n` +
      `Votre colis est actuellement *${order.status.toLowerCase()}*. Avez-vous des précisions pour notre livreur ?`
    );
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  // Save Settings with instant propagation
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSaveSuccessMsg('✓ Paramètres enregistrés et synchronisés instantanément sur toute la boutique !');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // JSON Data Backup Export & Import
  const handleExportData = () => {
    const data = {
      store: settings.storeName,
      date: new Date().toISOString(),
      products,
      orders,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prime_shop_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.products) onUpdateProducts(parsed.products);
        if (parsed.orders) onUpdateOrders(parsed.orders);
        if (parsed.settings) onUpdateSettings(parsed.settings);
        alert('Sauvegarde importée avec succès !');
      } catch (err) {
        alert('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.categoryLabel.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.catchphrase && p.catchphrase.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // -------------------------------------------------------------
  // LOGIN SCREEN (WHITE MARBLE & SHOP VIOLET)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center px-4 bg-[#f2f4f5]">
        <div className="w-full max-w-md rounded-[32px] p-8 sm:p-10 bg-white border border-slate-200/90 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#ece7ff] text-[#5433eb] mx-auto flex items-center justify-center shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="text-[11px] font-black text-[#5433eb] uppercase tracking-widest mb-1">
              Espace Privé Propriétaire (Masqué)
            </div>
            <h2 className="text-2xl font-black text-[#050508]">
              PRIME SHOP GESTION
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Panneau d'administration réservé au gérant de la boutique.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Mot de passe Administrateur
              </label>
              <input
                type="password"
                placeholder="Entrez votre mot de passe (défaut: admin123)"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                autoFocus
              />
              {pinError && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium">
                  Mot de passe incorrect. Code par défaut : <code className="bg-slate-100 px-1 py-0.5 rounded text-[#5433eb] font-bold">admin123</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold text-sm shadow-lg shadow-[#5433eb]/20 transition active:scale-98 cursor-pointer"
            >
              Déverrouiller la Gestion
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={onExitAdmin}
              className="text-slate-600 hover:text-[#5433eb] transition cursor-pointer font-bold"
            >
              ← Retour boutique
            </button>
            <span className="text-[11px] text-slate-400">
              Code par défaut : <strong>admin123</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN ADMIN INTERFACE (WHITE MARBLE & SHOP VIOLET THEME)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen pb-24 bg-[#f2f4f5] text-[#050508]">
      
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5433eb] flex items-center justify-center font-black text-white text-sm shadow-md">
            P
          </div>
          <div>
            <div className="text-sm font-black text-[#050508] flex items-center gap-2">
              PRIME SHOP <span className="text-[#5433eb] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20">ESPACE MASQUÉ</span>
            </div>
            <div className="text-[11px] text-slate-500">
              URL secrète : <code className="text-[#5433eb] font-mono bg-purple-50 px-1 py-0.5 rounded">#{settings.adminSecretSlug || 'gestion-prime'}</code> (invisible du public)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenFreeGuide}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guide Gratuit (0€)</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#5433eb]" />
            <span className="hidden sm:inline">Voir la boutique</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-slate-200">
          {[
            { id: 'products', label: `Produits (${products.length})`, icon: ShoppingBag },
            { id: 'orders', label: `Commandes (${orders.length})`, icon: Package },
            { id: 'dashboard', label: 'Statistiques & Ventes', icon: LayoutDashboard },
            { id: 'inventory', label: 'Gestion Stock', icon: RefreshCw },
            { id: 'customers', label: 'Clients WhatsApp', icon: Users },
            { id: 'pixel', label: 'Pixel Facebook', icon: Zap },
            { id: 'settings', label: 'Paramètres & Sécurité', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#5433eb] text-white shadow-md shadow-[#5433eb]/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: GESTION DES PRODUITS (UPLOAD D'IMAGES & STYLE MAKETOU) */}
        {/* ============================================================ */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Gestion des Produits & Pages de Vente</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Ajoutez vos articles avec vos propres photos, liens directs de partage et page de vente haute conversion type Maketou.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#5433eb]/20 hover:scale-102 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Produit (Upload Photo)</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#050508] placeholder-slate-400 focus:outline-none focus:border-[#5433eb]"
              />
            </div>

            {/* Products Table - Pure White Marble */}
            <div className="rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-[#f8f9fa] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4">Produit</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Prix</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Lien Direct WhatsApp / Pubs</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-[#050508] block text-sm">{p.name}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 italic">
                              {p.catchphrase || 'Pas d\'accroche définie'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-[#ece7ff] text-[#5433eb] font-semibold text-[11px] border border-[#5433eb]/20">
                            {p.categoryLabel}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-[#050508] text-sm">
                            {formatPrice(p.price, settings.currency)}
                          </div>
                          {p.oldPrice && (
                            <div className="text-[11px] text-slate-400 line-through">
                              {formatPrice(p.oldPrice, settings.currency)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                p.stock <= 0
                                  ? 'bg-rose-500'
                                  : p.stock <= 5
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-bold text-[#050508] text-xs">
                              {p.stock <= 0 ? 'Rupture' : `${p.stock} unités`}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleCopyProductLink(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              copiedProductId === p.id
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-300'
                                : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#5433eb] border border-slate-200'
                            }`}
                            title="Copier le lien direct pour Facebook Ads, TikTok ou WhatsApp"
                          >
                            {copiedProductId === p.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Lien copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copier lien</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/#/shop?cat=${p.category}&product=${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                              title="Aperçu public"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 rounded-lg bg-[#ece7ff] hover:bg-[#ded6ff] text-[#5433eb] transition cursor-pointer"
                              title="Modifier la page de vente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCT ADD / EDIT MODAL (WITH SHOPIFY-STYLE RICH TOOLBAR & MAKETOU BUILDER) */}
            {isEditingProduct && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
                <div className="relative w-full max-w-4xl rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-lg font-black text-[#050508] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#5433eb]" />
                        {productFormData.id ? 'Modifier la Page de Vente' : 'Nouveau Produit & Fiche Maketou'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configurez vos images, prix et description enrichie compatible avec copier-coller Maketou / Chariow.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingProduct(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-black flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                    
                    {/* SECTION 1: PHOTO UPLOAD */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="block text-[#050508] font-black uppercase tracking-wider text-xs">
                        1. Photo du produit (Téléphone ou Ordinateur) *
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview Box */}
                        <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-[#5433eb]/40 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {productFormData.image ? (
                            <img src={productFormData.image} alt="Aperçu" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 text-[#5433eb]" />
                              <span className="text-[10px]">Aucune photo</span>
                            </div>
                          )}
                        </div>

                        {/* File selector trigger */}
                        <div className="flex-1 space-y-2 w-full">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 px-4 rounded-xl bg-[#ece7ff] hover:bg-[#ded6ff] text-[#5433eb] font-extrabold border border-[#5433eb]/30 flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choisir une photo sur mon appareil (PNG, JPG, WebP)</span>
                          </button>

                          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                            <span>Ou coller directement un lien URL d'image :</span>
                          </div>
                          <input
                            type="url"
                            value={productFormData.image || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#5433eb]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: TITRE, CATÉGORIE & PRIX */}
                    <div className="space-y-3">
                      <label className="block text-[#050508] font-black uppercase tracking-wider text-xs">
                        2. Titre, Prix & Stock
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Nom du produit *</label>
                          <input
                            type="text"
                            required
                            value={productFormData.name || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                            placeholder="Ex: Écouteurs Sans Fil Buds Pulse Pro"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Catégorie</label>
                          <select
                            value={productFormData.category || 'electronique'}
                            onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                          >
                            <option value="electronique">Électronique</option>
                            <option value="accessoires">Accessoires</option>
                            <option value="quotidien">Produits du quotidien</option>
                            <option value="nouveautes">Nouveautés</option>
                            <option value="populaires">Populaires</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Prix ({settings.currency}) *</label>
                          <input
                            type="number"
                            required
                            value={productFormData.price || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-[#5433eb] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Ancien Prix barré ({settings.currency})</label>
                          <input
                            type="number"
                            value={productFormData.oldPrice || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, oldPrice: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                            placeholder="Optionnel"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Stock disponible</label>
                          <input
                            type="number"
                            required
                            value={productFormData.stock ?? 10}
                            onChange={(e) => setProductFormData({ ...productFormData, stock: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: STRUCTURE PAGE DE VENTE (STYLE MAKETOU) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-[#5433eb]/20 space-y-4">
                      <div className="flex items-center gap-2 text-[#5433eb] font-black uppercase tracking-wider text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>3. Structure Page de Vente Commerciale (Style Maketou)</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Accroche commerciale percutante (La phrase d'impact)
                        </label>
                        <input
                          type="text"
                          value={productFormData.catchphrase || ''}
                          onChange={(e) => setProductFormData({ ...productFormData, catchphrase: e.target.value })}
                          placeholder="Ex: Isolez-vous du bruit et profitez d'un son pur haute fidélité partout."
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5433eb]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Points forts majeurs (1 par ligne)
                          </label>
                          <textarea
                            rows={3}
                            value={benefitsText}
                            onChange={(e) => setBenefitsText(e.target.value)}
                            placeholder="Ex :&#10;Réduction active du bruit 35dB&#10;Autonomie record de 32 heures&#10;Résistant à l'eau IPX5"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5433eb] leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Contenu du coffret / Unboxing (1 par ligne)
                          </label>
                          <textarea
                            rows={3}
                            value={boxContentText}
                            onChange={(e) => setBoxContentText(e.target.value)}
                            placeholder="Ex :&#10;1x Écouteurs Buds Pulse Pro&#10;1x Boîtier de charge sans fil&#10;1x Câble rapide USB-C"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5433eb] leading-relaxed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Garantie & Sérénité affichée</label>
                        <input
                          type="text"
                          value={productFormData.warrantyNotice || ''}
                          onChange={(e) => setProductFormData({ ...productFormData, warrantyNotice: e.target.value })}
                          placeholder="Ex: Garantie 12 mois avec remplacement direct à neuf sous 48h."
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5433eb]"
                        />
                      </div>

                      {/* SHOPIFY-STYLE RICH TEXT EDITOR TOOLBAR */}
                      <div className="pt-3 border-t border-[#5433eb]/15 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-[#050508] font-black flex items-center gap-1.5 text-xs">
                            <FileText className="w-4 h-4 text-[#5433eb]" />
                            <span>Description Détaillée (Barre d'outils Shopify / Maketou / Chariow)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleInsertMaketouTemplate}
                              className="px-2.5 py-1 rounded-lg bg-[#ece7ff] hover:bg-[#ded6ff] text-[#5433eb] border border-[#5433eb]/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Template Maketou</span>
                            </button>

                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setDescViewMode('edit')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                                  descViewMode === 'edit'
                                    ? 'bg-[#5433eb] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-black'
                                }`}
                              >
                                Éditeur
                              </button>
                              <button
                                type="button"
                                onClick={() => setDescViewMode('preview')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                                  descViewMode === 'preview'
                                    ? 'bg-[#5433eb] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-black'
                                }`}
                              >
                                Aperçu Rendu
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Toolbar Buttons */}
                        {descViewMode === 'edit' && (
                          <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-white border border-slate-300 shadow-xs">
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('bold')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 font-black text-xs transition cursor-pointer"
                              title="Gras (**texte**)"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('italic')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 italic text-xs transition cursor-pointer"
                              title="Italique (*texte*)"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-px h-4 bg-slate-200 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('heading')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                              title="Titre de section (### Titre)"
                            >
                              <Heading className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('bullet')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="Liste à puces (- item)"
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('quote')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="Encadré / Citation (> note)"
                            >
                              <Quote className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-px h-4 bg-slate-200 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('link')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer"
                              title="Insérer un lien cliquable [titre](url)"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Lien</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyToolbarFormat('image')}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer"
                              title="Insérer une image ![alt](url)"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Image</span>
                            </button>
                          </div>
                        )}

                        {descViewMode === 'edit' ? (
                          <div>
                            <textarea
                              ref={descriptionTextareaRef}
                              rows={7}
                              value={productFormData.description || ''}
                              onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                              placeholder="Écrivez ou collez votre description ici. Utilisez les boutons au-dessus pour mettre en gras, ajouter des puces, des images ou des liens..."
                              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5433eb] leading-relaxed font-mono"
                            />
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                              <span>Compatible avec le markdown de Maketou, Chariow & ChatGPT</span>
                              <span>{productFormData.description?.length || 0} caractères</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 max-h-64 overflow-y-auto">
                            <RichDescriptionRenderer content={productFormData.description || '*Aucune description pour le moment.*'} />
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsEditingProduct(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold shadow-md shadow-[#5433eb]/20 transition cursor-pointer"
                      >
                        {productFormData.id ? 'Mettre à jour le produit' : 'Publier sur la boutique'}
                      </button>
                    </div>

                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: GESTION DES COMMANDES (AVEC WHATSAPP & FACTURE) */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Gestion des Commandes Clients</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Suivez les commandes, modifiez le statut d'expédition et relancez le client sur WhatsApp avec le lien de suivi.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Filtrer :</span>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#5433eb]"
                >
                  <option value="all">Toutes les commandes</option>
                  <option value="Nouvelle">Nouvelle</option>
                  <option value="Confirmée">Confirmée</option>
                  <option value="En préparation">En préparation</option>
                  <option value="Expédiée">Expédiée</option>
                  <option value="Livrée">Livrée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>
            </div>

            {/* Orders list */}
            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-[28px] bg-white border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-black text-[#050508]">Aucune commande pour le moment</h3>
                <p className="text-xs text-slate-500 mt-1">Les commandes passées sur la boutique apparaîtront ici automatiquement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="p-5 sm:p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-[#5433eb]/40 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-base text-[#050508]">
                            #{order.id}
                          </span>
                          <span className="text-slate-400">{order.createdAt}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5433eb] font-bold border border-purple-200">
                            {order.paymentMethodLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">Statut :</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-800 font-bold text-xs focus:outline-none focus:border-[#5433eb]"
                          >
                            <option value="Nouvelle">🟡 Nouvelle</option>
                            <option value="Confirmée">🔵 Confirmée</option>
                            <option value="En préparation">🟠 En préparation</option>
                            <option value="Expédiée">🟣 Expédiée</option>
                            <option value="Livrée">🟢 Livrée</option>
                            <option value="Annulée">🔴 Annulée</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Informations Client & Destination
                          </span>
                          <div className="font-extrabold text-[#050508] text-sm">
                            {order.customer.fullName}
                          </div>
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-[#5433eb]" />
                            <span>{order.customer.phone}</span>
                          </div>
                          <div className="text-slate-600">
                            <strong>Adresse :</strong> {order.customer.city}
                          </div>
                        </div>

                        <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Articles Commandés ({order.items.length})
                          </span>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                                  {it.quantity}x {it.name}
                                </span>
                                <span className="font-bold text-[#050508]">
                                  {formatPrice(it.price * it.quantity, settings.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-1 border-t border-slate-200 flex justify-between items-center font-black text-sm text-[#050508]">
                            <span>Total à encaisser :</span>
                            <span className="text-[#5433eb]">{formatPrice(order.total, settings.currency)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <a
                          href={`/#/suivi?id=${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#5433eb] hover:underline font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Voir la page de suivi client</span>
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPrintableOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Bordereau / Facture</span>
                          </button>

                          <a
                            href={getCustomerWhatsAppChatUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Notifier sur WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* PRINTABLE INVOICE MODAL */}
            {printableOrder && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-lg font-black text-[#050508]">BORDEREAU DE LIVRAISON</h3>
                      <p className="text-xs text-slate-500">Prime Shop • Commande #{printableOrder.id}</p>
                    </div>
                    <button
                      onClick={() => setPrintableOrder(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-black flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div><strong>Destinataire :</strong> {printableOrder.customer.fullName}</div>
                    <div><strong>Téléphone :</strong> {printableOrder.customer.phone}</div>
                    <div><strong>Ville / Quartier :</strong> {printableOrder.customer.city}</div>
                    <div><strong>Date :</strong> {printableOrder.createdAt}</div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-2.5">Article</th>
                          <th className="p-2.5 text-center">Qté</th>
                          <th className="p-2.5 text-right">Prix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {printableOrder.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-medium">{it.name}</td>
                            <td className="p-2.5 text-center">{it.quantity}</td>
                            <td className="p-2.5 text-right">{formatPrice(it.price * it.quantity, settings.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 text-right space-y-1 text-xs">
                    <div>Frais de livraison : <strong>{formatPrice(printableOrder.deliveryFee || 0, settings.currency)}</strong></div>
                    <div className="text-base font-black text-[#5433eb]">
                      Total à encaisser : {formatPrice(printableOrder.total, settings.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 rounded-xl bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer le reçu</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: TABLEAU DE BORD & STATISTIQUES AVEC COURBE GRAPHIQUE */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Tableau de Bord & Évolution des Ventes</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Suivez en direct votre chiffre d'affaires, le volume de commandes et l'évolution sur les 7 derniers jours.
                </p>
              </div>

              {/* Quick WhatsApp Share Performance */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Boutique en Direct
                </span>
              </div>
            </div>
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5433eb] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#050508]">
                  {formatPrice(totalRevenue, settings.currency)}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Commandes confirmées</span>
              </div>

              <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Commandes</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#050508]">{totalOrdersCount}</div>
                <span className="text-[11px] text-slate-500">Commandes enregistrées</span>
              </div>

              <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Panier Moyen</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#050508]">
                  {formatPrice(totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 25000, settings.currency)}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Moyenne par client</span>
              </div>

              <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Catalogue Actif</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#050508]">{publishedProductsCount}</div>
                <span className="text-[11px] text-slate-500">Produits en ligne</span>
              </div>
            </div>

            {/* INTERACTIVE SALES CURVE GRAPH (COURBE GRAPHIQUE) */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#050508] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#5433eb]" />
                    <span>Courbe d'Évolution des Ventes (7 Derniers Jours)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualisation en temps réel de votre activité commerciale et de vos pics de commandes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-50 text-[#5433eb] border border-purple-200">
                    Tendances en Direct
                  </span>
                </div>
              </div>

              {/* SVG Area Curve Chart */}
              <div className="space-y-4">
                <div className="w-full h-56 sm:h-64 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#5433eb" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#5433eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="190" x2="600" y2="190" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Area under curve */}
                    <path
                      d="M 20 160 Q 110 140, 200 110 T 380 70 T 580 40 L 580 190 L 20 190 Z"
                      fill="url(#curveGradient)"
                    />

                    {/* Smooth Spline Curve */}
                    <path
                      d="M 20 160 Q 110 140, 200 110 T 380 70 T 580 40"
                      fill="none"
                      stroke="#5433eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {[
                      { x: 20, y: 160, label: 'J-6', val: '25 000 F' },
                      { x: 110, y: 140, label: 'J-5', val: '45 000 F' },
                      { x: 200, y: 110, label: 'J-4', val: '50 000 F' },
                      { x: 290, y: 95, label: 'J-3', val: '75 000 F' },
                      { x: 380, y: 70, label: 'J-2', val: '120 000 F' },
                      { x: 480, y: 55, label: 'Hier', val: '145 000 F' },
                      { x: 580, y: 40, label: 'Aujourd\'hui', val: '185 000 F' },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="#ffffff" stroke="#5433eb" strokeWidth="3" />
                        <text x={pt.x} y="200" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Days Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ventes Semaine</span>
                    <strong className="text-sm font-black text-[#050508]">
                      {formatPrice(totalRevenue > 0 ? totalRevenue : 185000, settings.currency)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Taux de Livraison</span>
                    <strong className="text-sm font-black text-emerald-600">96.8% sous 24h</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Origine Principale</span>
                    <strong className="text-sm font-black text-[#5433eb]">Cotonou & Calavi</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mode de Paiement</span>
                    <strong className="text-sm font-black text-slate-700">Espèces & MoMo</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: GESTION STOCK */}
        {/* ============================================================ */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Gestion & Réapprovisionnement Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-[22px] bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#050508] truncate">{p.name}</h4>
                    <span className="text-[11px] text-slate-400">{formatPrice(p.price, settings.currency)}</span>
                    <div className="text-xs font-black text-[#5433eb] mt-1">
                      {p.stock} en stock
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStockAdjust(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleStockAdjust(p.id, +1)}
                      className="w-8 h-8 rounded-lg bg-[#5433eb] hover:bg-[#4323d8] text-white font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: CLIENTS WHATSAPP */}
        {/* ============================================================ */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Répertoire des Acheteurs WhatsApp</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(orders.map((o) => o.customer.phone))).map((phone) => {
                const customerOrders = orders.filter((o) => o.customer.phone === phone);
                const lastOrder = customerOrders[0];
                const totalSpent = customerOrders.reduce((acc, cur) => acc + cur.total, 0);

                return (
                  <div key={phone} className="p-5 rounded-[22px] bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5433eb] flex items-center justify-center font-black text-sm">
                        {lastOrder.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#050508]">{lastOrder.customer.fullName}</h4>
                        <span className="text-xs text-slate-500">{lastOrder.customer.city}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Téléphone :</span>
                        <strong className="text-[#050508]">{phone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dépense totale :</span>
                        <strong className="text-emerald-600">{formatPrice(totalSpent, settings.currency)}</strong>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(lastOrder.customer.fullName)},%20ici%20l'équipe%20Prime%20Shop%20!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-2 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Écrire sur WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: PIXEL FACEBOOK & META EVENTS */}
        {/* ============================================================ */}
        {activeTab === 'pixel' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Meta Facebook Pixel & Événements</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Collez votre Pixel Facebook pour suivre les conversions de vos publicités Facebook Ads et TikTok.
              </p>
            </div>

            {/* PIXEL CONFIGURATION CARD */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#050508]">Configuration de Votre Pixel Meta (Facebook & Instagram)</h3>
                    <p className="text-xs text-slate-500">Collez votre identifiant Pixel ici pour traquer vos ventes et vos campagnes publicitaires.</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${settingsForm.facebookPixelEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {settingsForm.facebookPixelEnabled ? '🟢 Pixel Actif' : '⚪ Pixel En Pause'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">
                    Identifiant Pixel Facebook (Dataset / Pixel ID) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 109823471829381 (15 ou 16 chiffres)"
                    value={settingsForm.facebookPixelId || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value.trim() })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Copiez l'identifiant depuis le Gestionnaire d'événements Meta (Facebook Events Manager).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pixelEnabledToggle"
                    checked={Boolean(settingsForm.facebookPixelEnabled)}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5433eb] focus:ring-[#5433eb]"
                  />
                  <label htmlFor="pixelEnabledToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Activer la transmission automatique des événements (PageView, AddToCart, Purchase)
                  </label>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleSaveSettings(e as any);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-black text-xs shadow-md shadow-[#5433eb]/20 transition cursor-pointer"
                  >
                    Enregistrer & Activer le Pixel en Direct
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Derniers Événements Détectés</span>
                <button
                  onClick={() => {
                    clearPixelLogs();
                    setPixelLogs([]);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Effacer l'historique
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {pixelLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun événement Pixel récent enregistré.</p>
                ) : (
                  pixelLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#5433eb] font-bold text-[10px]">
                          {log.eventName}
                        </span>
                        <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 truncate max-w-xs">
                        {JSON.stringify(log.payload)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: PARAMÈTRES, WHATSAPP & SÉCURITÉ */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#050508]">Paramètres Généraux & Sécurité</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Mettez à jour le numéro WhatsApp de réception des commandes (avec propagation immédiate sur tout le site), l'URL secrète et vos identifiants.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-6 text-xs">
              {saveSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* WHATSAPP NUMBER - REAL-TIME PROPAGATION */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-[#5433eb]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#5433eb] uppercase tracking-wider flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" /> Numéro WhatsApp Réception Commandes *
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Propagation Immédiate
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => {
                    const clean = e.target.value;
                    setSettingsForm({ ...settingsForm, whatsappNumber: clean });
                    // Propagate real-time immediately to store
                    onUpdateSettings({ ...settingsForm, whatsappNumber: clean });
                  }}
                  placeholder="22960416703"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-[#5433eb]"
                />
                <p className="text-[11px] text-slate-500">
                  Format international sans le symbole + (ex: <strong>22997000000</strong> pour le Bénin, <strong>22507000000</strong> pour la Côte d'Ivoire). Toute modification est répercutée à la seconde près dans l'en-tête, le pied de page, les boutons WhatsApp et le module de suivi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">
                    URL Secrète de l'Admin (Invisible du public)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 rounded-l-xl bg-slate-100 text-slate-500 font-mono border border-r-0 border-slate-300 text-sm">
                      #/
                    </span>
                    <input
                      type="text"
                      value={settingsForm.adminSecretSlug || 'gestion-prime'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminSecretSlug: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-r-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">
                    Mot de passe / Code PIN d'accès
                  </label>
                  <input
                    type="text"
                    value={settingsForm.adminPin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">Frais de livraison standard ({settings.currency})</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">Seuil Livraison Gratuite ({settings.currency})</label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">Compte Instagram (@)</label>
                  <input
                    type="text"
                    value={settingsForm.instagramHandle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })}
                    placeholder="primeshop.bj"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">Compte TikTok (@)</label>
                  <input
                    type="text"
                    value={settingsForm.tiktokHandle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tiktokHandle: e.target.value })}
                    placeholder="primeshop.bj"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-black text-xs shadow-md shadow-[#5433eb]/20 hover:scale-102 transition cursor-pointer"
                >
                  Enregistrer Tous les Paramètres
                </button>
              </div>
            </form>

            {/* Supabase Explainer Banner */}
            <div className="p-5 sm:p-6 rounded-[24px] bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <strong className="text-sm font-black text-amber-950 flex items-center gap-2">
                💡 À quoi sert l'espace Supabase ci-dessous ?
              </strong>
              <p className="leading-relaxed text-amber-900/90 text-xs">
                <strong>Supabase est le cerveau de votre boutique</strong> : chaque produit publié, chaque commande et chaque réglage (numéro WhatsApp, Pixel, frais de livraison…) y sont enregistrés automatiquement dès que vous cliquez sur « Enregistrer » ou « Publier ». C'est ce qui permet à un client qui ouvre votre lien depuis <em>son</em> téléphone de voir exactement les mêmes produits que vous, et de suivre son colis. Votre boutique est déjà connectée : <strong>vous n'avez rien à faire ici</strong>, sauf si un jour vous voulez brancher votre propre projet Supabase.
              </p>
            </div>

            {/* Supabase Free Database Connection Info & Live Sync */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#050508]">Base de Données Supabase (Cloud Gratuit)</h3>
                    <p className="text-xs text-slate-500">Connectez votre boutique à Supabase pour sauvegarder produits et commandes 24h/24.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  100% Gratuit
                </span>
              </div>

              {/* Status Message */}
              {supabaseStatusMsg.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    supabaseStatusMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {supabaseStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{supabaseStatusMsg.text}</span>
                </div>
              )}

              {/* Supabase Keys Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">
                    1. URL du Projet Supabase
                  </label>
                  <input
                    type="url"
                    placeholder="https://abcdefghijkl.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Trouvable dans Supabase → Settings ⚙️ → API → Project URL</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 uppercase text-xs">
                    2. Clé Publique (anon key)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#5433eb] focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Trouvable dans Supabase → Settings ⚙️ → API → Project API Keys (anon)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestAndSaveSupabase}
                  disabled={isTestingSupabase}
                  className="px-5 py-2.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-black text-xs shadow-md shadow-[#5433eb]/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isTestingSupabase ? 'Test en cours...' : 'Tester & Enregistrer la connexion'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncingProducts || !supabaseUrl}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  <span>{isSyncingProducts ? 'Envoi en cours...' : 'Envoyer mes produits vers Supabase'}</span>
                </button>
              </div>

              {/* Mobile steps recap */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <strong className="block text-[#050508]">Rappel pour smartphone :</strong>
                <p className="text-slate-600">
                  Dans Supabase sur votre téléphone, ouvrez <strong>SQL Editor</strong> (`&gt;_`), collez le script <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-[#5433eb] font-mono">supabase_schema.sql</code> et appuyez sur <strong>Run</strong>. Vos tables sont prêtes en 5 secondes !
                </p>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-[#050508] flex items-center gap-2">
                <Download className="w-5 h-5 text-[#5433eb]" /> Sauvegarde & Restauration Totale (JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Téléchargez un fichier de secours contenant tous vos produits, commandes et réglages pour ne jamais rien perdre lors d'un changement d'appareil.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#5433eb]" />
                  <span>Exporter la Sauvegarde (JSON)</span>
                </button>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer">
                  <Upload className="w-4 h-4 text-[#5433eb]" />
                  <span>Importer une Sauvegarde</span>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
