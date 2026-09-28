import React, { useState, useEffect } from 'react';
import { Product, StoreSettings, Order } from '../types';
import { formatPrice } from '../utils/storage';
import { copyToClipboard } from '../utils/clipboard';
import { trackViewContent } from '../utils/pixel';
import { RichDescriptionRenderer } from './RichDescriptionRenderer';
import { soundFX } from '../utils/audio';
import { 
  X, 
  ShoppingBag, 
  PhoneCall, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Check, 
  Star, 
  Heart, 
  Share2, 
  PackageCheck, 
  Sparkles, 
  Flame,
  FileText,
  BadgeCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  settings: StoreSettings;
  onOrderCreated?: (order: Order) => void;
}

const DEFAULT_VARIANTS = ['Noir Sidéral', 'Titane Naturel', 'Blanc Perle'];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  settings,
  onOrderCreated,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [selectedVariant, setSelectedVariant] = useState(DEFAULT_VARIANTS[0]);

  // Pre-WhatsApp quick buyer prompt state
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [promptError, setPromptError] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);
      setActiveTab('desc');
      setSelectedVariant(DEFAULT_VARIANTS[0]);
      setIsQuickPromptOpen(false);
      trackViewContent(product);
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // WhatsApp fallback pre-filled order link
  const defaultWhatsappOrderText = encodeURIComponent(
    `Bonjour Prime Shop !\n` +
    `Je souhaite commander ce produit :\n\n` +
    `📦 *${product.name}*\n` +
    `🎨 *Finition / Variante :* ${selectedVariant}\n` +
    `💰 *Prix :* ${formatPrice(product.price, settings.currency)}\n` +
    `🔢 *Quantité :* ${quantity}\n` +
    `🔗 *Lien :* ${window.location.origin}/#/shop\n\n` +
    `Est-il disponible pour une livraison rapide aujourd'hui ? Merci !`
  );
  const defaultWhatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${defaultWhatsappOrderText}`;

  const handleOpenWhatsAppPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    soundFX.playPop();
    setIsQuickPromptOpen(true);
  };

  const handleConfirmQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerCity.trim()) {
      setPromptError('Veuillez renseigner votre nom et votre ville/quartier.');
      return;
    }

    const orderNumber = 'PS-' + Math.floor(1000 + Math.random() * 9000);
    const trackingUrl = `${window.location.origin}/#/suivi?id=${orderNumber}`;
    const isFreeDelivery = (product.price * quantity) >= settings.freeDeliveryThreshold;
    const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
    const total = (product.price * quantity) + deliveryFee;

    if (onOrderCreated) {
      const newOrder: Order = {
        id: orderNumber,
        customer: {
          fullName: buyerName.trim(),
          phone: buyerPhone.trim() || settings.whatsappNumber,
          city: buyerCity.trim(),
          address: buyerCity.trim(),
        },
        items: [
          {
            productId: product.id,
            name: `${product.name} (${selectedVariant})`,
            price: product.price,
            quantity,
            image: product.image,
          },
        ],
        subtotal: product.price * quantity,
        deliveryFee,
        discount: 0,
        total,
        paymentMethod: 'cod',
        paymentMethodLabel: 'Paiement à la livraison',
        status: 'Nouvelle',
        createdAt: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        updatedAt: new Date().toISOString(),
      };

      onOrderCreated(newOrder);
    }

    soundFX.playSuccessChime();

    const formattedMessage = encodeURIComponent(
      `Bonjour Prime Shop !\n` +
      `Je confirme ma commande express *#${orderNumber}* :\n\n` +
      `📦 *Produit :* ${product.name}\n` +
      `🎨 *Finition :* ${selectedVariant}\n` +
      `🔢 *Quantité :* ${quantity}\n` +
      `💰 *Total à régler à la réception :* ${formatPrice(total, settings.currency)}\n\n` +
      `👤 *Coordonnées de Livraison :*\n` +
      `• Destinataire : ${buyerName.trim()}\n` +
      `• Ville & Quartier : ${buyerCity.trim()}\n` +
      (buyerPhone.trim() ? `• Téléphone d'appel : ${buyerPhone.trim()}\n` : '') +
      `\n📍 *Suivi de commande en direct :* ${trackingUrl}\n\n` +
      `Merci de m'indiquer l'heure approximative de passage du coursier !`
    );

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${formattedMessage}`, '_blank');
    setIsQuickPromptOpen(false);
    onClose();
  };

  const handleShare = () => {
    soundFX.playPop();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvre ${product.name} sur Prime Shop`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyToClipboard(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddToCartWithSound = () => {
    soundFX.playAddToCart();
    onAddToCart(product, quantity);
    onClose();
  };

  const handleBuyNowWithSound = () => {
    soundFX.playAddToCart();
    onBuyNow(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Maketou-style Sales Page Container - White Marble & Shop Violet */}
      <div className="relative w-full max-w-4xl rounded-[28px] bg-white border border-slate-200/90 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-[#f8f9fa]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#ece7ff] text-[#5433eb] text-xs font-bold border border-[#5433eb]/20">
              {product.categoryLabel}
            </span>
            {product.isPopular && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> Top Vente
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-[#050508] border border-slate-200 transition shadow-xs cursor-pointer relative"
              title="Partager ce produit"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 px-2 py-1 rounded bg-[#050508] text-white text-[10px] whitespace-nowrap shadow-md">
                  Lien copié !
                </span>
              )}
            </button>
            <button
              onClick={() => {
                soundFX.playPop();
                onToggleWishlist(product.id);
              }}
              className={`p-2 rounded-full border transition shadow-xs cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-white text-slate-600 hover:text-rose-500 border-slate-200'
              }`}
              title="Favoris"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-[#050508] border border-slate-200 transition shadow-xs cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Sales Page Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Top Section: Gallery + Commercial Pitch */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Gallery Column */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-square rounded-[24px] overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner flex items-center justify-center">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {product.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        soundFX.playPop();
                        setSelectedImage(img);
                      }}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        selectedImage === img
                          ? 'border-[#5433eb] scale-105 shadow-md shadow-[#5433eb]/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Express Delivery ETA pill */}
              <div className="p-3.5 rounded-2xl bg-[#ece7ff]/60 border border-[#5433eb]/20 flex items-center gap-2.5 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-[#5433eb] shrink-0" />
                <span>
                  <strong>Livraison express sous 24h :</strong> Commandez aujourd'hui, recevez votre colis à domicile à Cotonou ou Calavi.
                </span>
              </div>
            </div>

            {/* Sales Pitch & 1-Click Order Column */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div>
                {/* Rating & Stock */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-extrabold text-[#050508]">{product.rating}</span>
                    <span className="text-slate-500 text-xs">({product.reviewsCount} avis vérifiés)</span>
                  </div>

                  <span className="text-xs font-bold">
                    {isOutOfStock ? (
                      <span className="text-rose-600 flex items-center gap-1">🔴 Rupture de stock</span>
                    ) : isLowStock ? (
                      <span className="text-amber-600 flex items-center gap-1">🟠 Plus que {product.stock} dispo</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">🟢 En stock à Cotonou</span>
                    )}
                  </span>
                </div>

                {/* Product Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-[#050508] tracking-tight leading-snug">
                  {product.name}
                </h2>

                {/* Catchphrase */}
                {product.catchphrase && (
                  <div className="mt-2 text-[#5433eb] font-bold text-sm sm:text-base leading-snug">
                    « {product.catchphrase} »
                  </div>
                )}

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#050508] tracking-tight">
                    {formatPrice(product.price, settings.currency)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-slate-400 line-through font-normal">
                      {formatPrice(product.oldPrice, settings.currency)}
                    </span>
                  )}
                </div>

                {/* Variant Selector */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Finition / Variante :
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {DEFAULT_VARIANTS.map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          soundFX.playPop();
                          setSelectedVariant(v);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          selectedVariant === v
                            ? 'bg-[#5433eb] text-white border-[#5433eb] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Quantité :</span>
                  <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
                    <button
                      onClick={() => {
                        soundFX.playPop();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-8 h-8 rounded-lg text-slate-700 hover:text-black hover:bg-white flex items-center justify-center font-bold text-base disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-black text-[#050508] text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        soundFX.playPop();
                        setQuantity(Math.min(product.stock, quantity + 1));
                      }}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="w-8 h-8 rounded-lg text-slate-700 hover:text-black hover:bg-white flex items-center justify-center font-bold text-base disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion Buttons: WhatsApp Direct + On-Site 1-Click */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                {/* WhatsApp Direct Order Button with Fast Info Prompt */}
                <button
                  type="button"
                  onClick={handleOpenWhatsAppPrompt}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>COMMANDER SUR WHATSAPP (RÉPONSE EN 2 MIN)</span>
                </button>

                {/* 2 Alternate actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBuyNowWithSound}
                    disabled={isOutOfStock}
                    className="py-3 px-4 rounded-xl bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold text-xs shadow-md shadow-[#5433eb]/20 flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Acheter sans compte</span>
                  </button>

                  <button
                    onClick={handleAddToCartWithSound}
                    disabled={isOutOfStock}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#5433eb]" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* TABBED SPECIFICATIONS & RICH DESCRIPTION SECTION */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-4 border-t border-slate-200">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button
                onClick={() => {
                  soundFX.playPop();
                  setActiveTab('desc');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'desc'
                    ? 'bg-[#5433eb] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Description & Fiche Complète</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playPop();
                  setActiveTab('specs');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'specs'
                    ? 'bg-[#5433eb] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Points Forts & Colis</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playPop();
                  setActiveTab('delivery');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'delivery'
                    ? 'bg-[#5433eb] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Garantie & Livraison Bénin</span>
              </button>
            </div>

            {/* Tab 1: Rich Description (Maketou / Chariow / ChatGPT Compatible) */}
            {activeTab === 'desc' && (
              <div className="pt-4 space-y-4">
                <RichDescriptionRenderer content={product.description} />
              </div>
            )}

            {/* Tab 2: Key Benefits & Box Content */}
            {activeTab === 'specs' && (
              <div className="pt-4 space-y-6">
                {/* Benefits */}
                {product.keyBenefits && product.keyBenefits.length > 0 && (
                  <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-black text-[#050508] flex items-center gap-2 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#5433eb]" /> Pourquoi ce produit fait l'unanimité :
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.keyBenefits.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Box Content */}
                {product.boxContent && product.boxContent.length > 0 && (
                  <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-black text-[#050508] flex items-center gap-2 uppercase tracking-wider">
                      <PackageCheck className="w-4 h-4 text-[#5433eb]" /> Ce que contient votre colis :
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.boxContent.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-xl bg-white border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-[#5433eb] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Delivery & Warranty */}
            {activeTab === 'delivery' && (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 flex items-start gap-3.5 text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-[#050508] block font-extrabold text-sm mb-1">Garantie & Sérénité</strong>
                    <span className="text-slate-600 leading-relaxed">
                      {product.warrantyNotice || 'Produit 100% garanti avec test de conformité avant expédition.'}
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 flex items-start gap-3.5 text-xs">
                  <Truck className="w-8 h-8 text-[#5433eb] shrink-0" />
                  <div>
                    <strong className="text-[#050508] block font-extrabold text-sm mb-1">Livraison Partout au Bénin</strong>
                    <span className="text-slate-600 leading-relaxed">
                      Remise en main propre par coursier sous 24h à Cotonou et Calavi avec règlement sur place en espèces ou Mobile Money.
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* QUICK PRE-WHATSAPP BUYER INFO PROMPT */}
      {isQuickPromptOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-[28px] bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#050508]">Commande Express WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">2 champs seulement pour préparer votre livraison</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickPromptOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-slate-200/80 flex items-center gap-3">
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-bold text-[#050508] truncate">{product.name}</div>
                <div className="text-slate-500 text-[11px]">{selectedVariant} • Qté: {quantity}</div>
                <div className="font-extrabold text-[#5433eb]">{formatPrice(product.price * quantity, settings.currency)}</div>
              </div>
            </div>

            {/* Quick Form */}
            <form onSubmit={handleConfirmQuickOrder} className="space-y-3.5 text-xs">
              {promptError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {promptError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Votre Prénom & Nom *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Kouassi Marc"
                  value={buyerName}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    setPromptError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Ville & Quartier de livraison *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cotonou, Haie Vive (ou Calavi, etc.)"
                  value={buyerCity}
                  onChange={(e) => {
                    setBuyerCity(e.target.value);
                    setPromptError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Numéro de téléphone d'appel <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 97 00 00 00"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5433eb] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Envoyer ma commande sur WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <a
                  href={defaultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsQuickPromptOpen(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
                >
                  Passer directement sans remplir d'adresse →
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
