import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, StoreSettings, PixelEventLog } from '../types';
import { formatPrice } from '../utils/storage';
import { getPixelLogs, clearPixelLogs } from '../utils/pixel';
import { RichDescriptionRenderer } from './RichDescriptionRenderer';
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
  FileText
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
• 1x Kit d'accessoires officiels complets
• 1x Manuel d'utilisation en français
• 1x Fiche de garantie Prime Shop 12 mois

🚚 **Modalités de Livraison au Bénin :**
• Expédition express sous 24h à Cotonou, Calavi, Porto-Novo et environs
• Paiement à la réception après contrôle du colis (Espèces ou Mobile Money)`;

    setProductFormData(prev => ({
      ...prev,
      description: template,
      catchphrase: prev.catchphrase || 'Performance, design et fiabilité garantis par Prime Shop.',
    }));
  };

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders filter & selected order for printable invoice
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);

  // Pixel logs state
  const [pixelLogs, setPixelLogs] = useState<PixelEventLog[]>([]);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    setPixelLogs(getPixelLogs());
    const handlePixelEvent = (e: any) => {
      setPixelLogs((prev) => [e.detail, ...prev.slice(0, 49)]);
    };
    window.addEventListener('prime_pixel_event', handlePixelEvent);
    return () => window.removeEventListener('prime_pixel_event', handlePixelEvent);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === settings.adminPin || enteredPin === 'admin123') {
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
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdateProducts([newProduct, ...products]);
    }

    setIsEditingProduct(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit ?')) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleStockAdjust = (id: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // WhatsApp client contact direct message
  const getWhatsAppClientLink = (order: Order) => {
    const msg = encodeURIComponent(
      `Bonjour ${order.customer.fullName} ! Ici le service client de Prime Shop.\n` +
      `Nous confirmons la bonne prise en charge de votre commande #${order.id} d'un montant de ${formatPrice(order.total, settings.currency)}.\n` +
      `Votre colis est actuellement ${order.status.toLowerCase()}. Notre livreur vous contactera sous peu. Avez-vous des précisions sur votre adresse ?`
    );
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSaveSuccessMsg('Paramètres enregistrés avec succès !');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
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

  // -------------------------------------------------------------
  // LOGIN SCREEN (SECRET ACCESS GATE)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center px-4 bg-[#020617]">
        <div className="w-full max-w-md rounded-[32px] p-8 sm:p-10 bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[2px] mx-auto shadow-lg shadow-blue-500/25">
            <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-sky-400">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-1">
              Espace Privé Propriétaire (Masqué)
            </div>
            <h2 className="text-2xl font-black text-white">
              PRIME SHOP GESTION
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cette page n'est visible que par vous.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
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
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400"
                autoFocus
              />
              {pinError && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">
                  Mot de passe incorrect. Code par défaut : <code className="bg-slate-800 px-1 py-0.5 rounded text-sky-300">admin123</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition active:scale-98 cursor-pointer"
            >
              Déverrouiller la Gestion
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onExitAdmin}
              className="text-slate-400 hover:text-white transition"
            >
              ← Retour boutique
            </button>
            <span className="text-[11px] text-slate-500">
              Code par défaut : <strong>admin123</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen pb-24 bg-[#020617] text-slate-100">
      
      {/* Top Secret Admin Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-black text-white text-sm shadow-md">
            P
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              PRIME SHOP <span className="text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-400/20">ESPACE MASQUÉ</span>
            </div>
            <div className="text-[10px] text-slate-400">
              URL secrète : <code className="text-sky-300 font-mono">#{settings.adminSecretSlug || 'gestion-prime'}</code> (inconnue du public)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenFreeGuide}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guide Gratuit (0€)</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold border border-white/10 transition"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Voir la boutique</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-white/10">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10'
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
                <h2 className="text-xl font-black text-white">Gestion des Produits & Pages de Vente</h2>
                <p className="text-xs text-slate-400">
                  Ajoutez vos articles avec vos propres photos (téléphone/PC) et une page de vente structurée type Maketou.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-black shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit (Upload Photo)</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-4">Produit</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Prix</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Page de Vente</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-white/10"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{p.name}</span>
                            <span className="text-[10px] text-sky-400 line-clamp-1 italic">
                              {p.catchphrase || 'Pas d\'accroche définie'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 font-semibold text-[10px] border border-white/10">
                            {p.categoryLabel}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-white text-sm">
                            {formatPrice(p.price, settings.currency)}
                          </div>
                          {p.oldPrice && (
                            <div className="text-[11px] text-slate-500 line-through">
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
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-bold text-white">{p.stock} unités</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] text-slate-400">
                            <div>✓ {p.keyBenefits?.length || 0} points forts</div>
                            <div>📦 {p.boxContent?.length || 0} éléments du colis</div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition"
                              title="Modifier la page de vente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition"
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

            {/* PRODUCT ADD / EDIT MODAL (WITH FILE UPLOAD & MAKETOU SALES PAGE BUILDER) */}
            {isEditingProduct && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
                <div className="relative w-full max-w-3xl rounded-[28px] bg-[#0b1329] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-sky-400" />
                        {productFormData.id ? 'Modifier la Page de Vente' : 'Nouveau Produit & Page de Vente (Style Maketou)'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Remplissez ces sections pour créer une fiche produit ultra-convaincante orientée conversion WhatsApp.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingProduct(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                    
                    {/* SECTION 1: PHOTO UPLOAD */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                      <label className="block text-slate-200 font-extrabold uppercase tracking-wider">
                        1. Photo du produit (Télécharger depuis Téléphone ou Ordinateur) *
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview Box */}
                        <div className="w-28 h-28 rounded-2xl bg-slate-950 border-2 border-dashed border-sky-400/40 flex items-center justify-center overflow-hidden shrink-0">
                          {productFormData.image ? (
                            <img src={productFormData.image} alt="Aperçu" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-slate-500">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 text-sky-400" />
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
                            className="w-full py-3 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-sky-300 font-bold border border-sky-400/40 flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choisir une photo sur mon appareil (PNG, JPG, WebP)</span>
                          </button>

                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span>Ou coller un lien URL d'image :</span>
                          </div>
                          <input
                            type="url"
                            value={productFormData.image || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: INFOS & PRIX */}
                    <div className="space-y-3">
                      <label className="block text-slate-200 font-extrabold uppercase tracking-wider">
                        2. Titre, Prix & Stock
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Nom du produit *</label>
                          <input
                            type="text"
                            required
                            value={productFormData.name || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                            placeholder="Ex: Écouteurs Sans Fil Buds Pulse Pro"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Catégorie</label>
                          <select
                            value={productFormData.category || 'electronique'}
                            onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
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
                          <label className="block text-slate-400 font-semibold mb-1">Prix ({settings.currency}) *</label>
                          <input
                            type="number"
                            required
                            value={productFormData.price || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-sky-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Ancien Prix barré ({settings.currency})</label>
                          <input
                            type="number"
                            value={productFormData.oldPrice || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, oldPrice: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                            placeholder="Optionnel"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Stock disponible</label>
                          <input
                            type="number"
                            required
                            value={productFormData.stock ?? 10}
                            onChange={(e) => setProductFormData({ ...productFormData, stock: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: STRUCTURE PAGE DE VENTE (STYLE MAKETOU) */}
                    <div className="p-4 rounded-2xl bg-blue-950/20 border border-sky-400/20 space-y-4">
                      <div className="flex items-center gap-2 text-sky-400 font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>3. Composition Page de Vente Commerciale (Style Maketou)</span>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Accroche commerciale percutante (La phrase d'impact)
                        </label>
                        <input
                          type="text"
                          value={productFormData.catchphrase || ''}
                          onChange={(e) => setProductFormData({ ...productFormData, catchphrase: e.target.value })}
                          placeholder="Ex: Isolez-vous du bruit et profitez d'un son pur haute fidélité partout."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Points forts / Bénéfices majeurs (1 par ligne)
                        </label>
                        <textarea
                          rows={3}
                          value={benefitsText}
                          onChange={(e) => setBenefitsText(e.target.value)}
                          placeholder="Ex :&#10;Réduction active du bruit 35dB&#10;Autonomie record de 32 heures&#10;Résistant à l'eau et à la pluie IPX5"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Ce que contient votre colis / Unboxing (1 élément par ligne)
                        </label>
                        <textarea
                          rows={3}
                          value={boxContentText}
                          onChange={(e) => setBoxContentText(e.target.value)}
                          placeholder="Ex :&#10;1x Paire d'écouteurs Buds Pulse Pro&#10;1x Boîtier de charge sans fil&#10;3x Paires d'embouts silicone&#10;1x Câble de charge rapide USB-C"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Garantie & SAV affiché</label>
                        <input
                          type="text"
                          value={productFormData.warrantyNotice || ''}
                          onChange={(e) => setProductFormData({ ...productFormData, warrantyNotice: e.target.value })}
                          placeholder="Ex: Garantie 12 mois avec remplacement direct à neuf sous 48h."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400"
                        />
                      </div>

                      {/* RICH DESCRIPTION: COMPATIBLE MAKETOU / CHARIOW / CHATGPT */}
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                            <FileText className="w-4 h-4 text-sky-400" />
                            <span>Description Détaillée (Copier-Coller Maketou / Chariow / ChatGPT)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleInsertMaketouTemplate}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Insérer Template Maketou</span>
                            </button>

                            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-white/10">
                              <button
                                type="button"
                                onClick={() => setDescViewMode('edit')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                                  descViewMode === 'edit'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Éditeur
                              </button>
                              <button
                                type="button"
                                onClick={() => setDescViewMode('preview')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                                  descViewMode === 'preview'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Aperçu Rendu
                              </button>
                            </div>
                          </div>
                        </div>

                        {descViewMode === 'edit' ? (
                          <div>
                            <textarea
                              rows={6}
                              value={productFormData.description || ''}
                              onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                              placeholder="Collez ici votre texte complet généré par ChatGPT, Maketou ou Chariow (avec puces •, **gras**, émojis 🔥, etc.)"
                              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400 leading-relaxed font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              💡 <em>Conseil : Vous pouvez coller directement du texte avec des puces (- ou •), des astérisques (**gras**) ou même du code HTML, tout s'affichera proprement sur la boutique !</em>
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-200 min-h-[140px] max-h-[300px] overflow-y-auto shadow-inner">
                            <RichDescriptionRenderer content={productFormData.description} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsEditingProduct(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-extrabold shadow-lg hover:scale-105 transition cursor-pointer"
                      >
                        Publier ce Produit dans la Boutique
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
                <h2 className="text-xl font-black text-white">Gestion des Commandes Clients</h2>
                <p className="text-xs text-slate-400">
                  Validez les commandes, mettez à jour le statut et relancez le client sur WhatsApp en 1 clic.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filtrer :</span>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-400"
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
            <div className="space-y-4">
              {orders
                .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                .map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-base text-white">
                          #{order.id}
                        </span>
                        <span className="text-slate-400">{order.createdAt}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-400 font-bold border border-sky-400/20">
                          {order.paymentMethodLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Statut :</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-sky-400/40 text-white font-bold text-xs focus:outline-none"
                        >
                          <option value="Nouvelle">Nouvelle</option>
                          <option value="Confirmée">Confirmée</option>
                          <option value="En préparation">En préparation</option>
                          <option value="Expédiée">Expédiée</option>
                          <option value="Livrée">Livrée</option>
                          <option value="Annulée">Annulée</option>
                        </select>

                        <a
                          href={getWhatsAppClientLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/30 transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>WhatsApp Client</span>
                        </a>

                        <button
                          onClick={() => setPrintableOrder(order)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="Imprimer le bordereau"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Destinataire :</span>
                        <strong className="text-white block text-sm">{order.customer.fullName}</strong>
                        <span className="text-slate-300 block">{order.customer.phone}</span>
                        <span className="text-slate-300 block">{order.customer.city}</span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-slate-400 block mb-1">Articles ({order.items.length}) :</span>
                        <div className="space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-slate-300">
                              <span>
                                {it.quantity}x {it.name}
                              </span>
                              <span className="font-bold text-white">
                                {formatPrice(it.price * it.quantity, settings.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-sm font-extrabold">
                          <span className="text-slate-300">Total :</span>
                          <span className="text-sky-400">{formatPrice(order.total, settings.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Printable Delivery Sheet */}
            {printableOrder && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="relative w-full max-w-lg rounded-2xl bg-white text-slate-900 p-8 shadow-2xl space-y-6">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h3 className="text-xl font-black text-blue-700">PRIME SHOP</h3>
                      <p className="text-xs text-slate-500">Bordereau de Livraison / Facture</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm block">#{printableOrder.id}</span>
                      <span className="text-xs text-slate-500">{printableOrder.createdAt}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 border-b pb-4">
                    <div className="font-bold text-slate-700 uppercase">Client :</div>
                    <div className="text-sm font-bold">{printableOrder.customer.fullName}</div>
                    <div>Tél : {printableOrder.customer.phone}</div>
                    <div>Ville & Quartier : {printableOrder.customer.city}</div>
                  </div>

                  <div className="space-y-2 text-xs border-b pb-4">
                    <div className="font-bold text-slate-700 uppercase">Articles :</div>
                    {printableOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-bold">{formatPrice(it.price * it.quantity, settings.currency)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm font-black pt-2">
                    <span>TOTAL À ENCAISSER :</span>
                    <span className="text-blue-700 text-lg">{formatPrice(printableOrder.total, settings.currency)}</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setPrintableOrder(null)}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow"
                    >
                      Imprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: STATISTIQUES DASHBOARD */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-[22px] bg-slate-900/60 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'affaires</span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {formatPrice(totalRevenue, settings.currency)}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-600/20 text-sky-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] bg-slate-900/60 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commandes Totales</span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {totalOrdersCount}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] bg-slate-900/60 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produits en boutique</span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {publishedProductsCount}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-600/20 text-sky-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] bg-slate-900/60 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertes Stock</span>
                    <h3 className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                      {lowStockCount}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
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
            <h2 className="text-xl font-black text-white">Gestion & Réapprovisionnement Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <span className="text-[10px] text-slate-400">{formatPrice(p.price, settings.currency)}</span>
                    <div className="text-xs font-black text-sky-400 mt-1">
                      {p.stock} en stock
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStockAdjust(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 font-bold text-sm"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleStockAdjust(p.id, +1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
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
            <h2 className="text-xl font-black text-white">Répertoire des Acheteurs WhatsApp</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(orders.map((o) => o.customer.phone))).map((phone) => {
                const customerOrders = orders.filter((o) => o.customer.phone === phone);
                const lastOrder = customerOrders[0];
                const totalSpent = customerOrders.reduce((acc, cur) => acc + cur.total, 0);

                return (
                  <div key={phone} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                        {lastOrder.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{lastOrder.customer.fullName}</h4>
                        <span className="text-xs text-slate-400">{lastOrder.customer.city}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Téléphone :</span>
                        <strong className="text-white">{phone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dépense totale :</span>
                        <strong className="text-emerald-400">{formatPrice(totalSpent, settings.currency)}</strong>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(lastOrder.customer.fullName)},%20ici%20Prime%20Shop%20!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2 transition"
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
        {/* TAB 6: PIXEL FACEBOOK ADS */}
        {/* ============================================================ */}
        {activeTab === 'pixel' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" /> Pixel Meta / Facebook Ads
              </h2>
              <p className="text-xs text-slate-400">
                Connectez votre Pixel ID Meta pour optimiser vos ventes et recibler les acheteurs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Votre Pixel ID Meta (15 à 16 chiffres)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.facebookPixelId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value })}
                    placeholder="Ex: 109823471829381"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.facebookPixelEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-sky-400"
                    />
                    <span className="text-xs font-bold text-white">Activer le Pixel Meta</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    onUpdateSettings(settingsForm);
                    alert('Pixel Facebook enregistré avec succès !');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  Enregistrer l'ID Pixel
                </button>
                <button onClick={() => { clearPixelLogs(); setPixelLogs([]); }} className="text-xs text-slate-400 hover:text-white">
                  Effacer les logs Pixel
                </button>
              </div>
            </div>

            {/* Real-time Pixel Logs */}
            <div className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Inspecteur Pixel en Direct ({pixelLogs.length} événements)
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pixelLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 font-mono font-bold text-[11px]">
                      {log.eventName}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px] truncate max-w-sm">
                      {JSON.stringify(log.payload)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: PARAMÈTRES & URL SECRÈTE */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white">Paramètres Généraux & Sécurité</h2>
              <p className="text-xs text-slate-400">
                Personnalisez le numéro WhatsApp, l'URL secrète de l'admin et le mot de passe.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 space-y-6 text-xs">
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {saveSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">
                    URL Secrète de l'Admin (Seul vous la connaissez)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 rounded-l-xl bg-slate-800 text-slate-400 font-mono border border-r-0 border-white/15">
                      #/
                    </span>
                    <input
                      type="text"
                      value={settingsForm.adminSecretSlug || 'gestion-prime'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminSecretSlug: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-r-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">
                    Mot de passe / Code PIN Admin
                  </label>
                  <input
                    type="text"
                    value={settingsForm.adminPin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">Numéro WhatsApp Réception</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">Frais de livraison standard ({settings.currency})</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  Enregistrer les Paramètres
                </button>
              </div>
            </form>

            {/* Backup & Restore */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" /> Sauvegarde & Restauration Totale (JSON)
              </h3>
              <p className="text-xs text-slate-400">
                Téléchargez un fichier de secours contenant tous vos produits, commandes et réglages pour ne jamais rien perdre.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter la Sauvegarde (JSON)</span>
                </button>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer">
                  <Upload className="w-4 h-4" />
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
