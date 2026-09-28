import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '../utils/storage';
import { trackViewContent } from '../utils/pixel';
import { StoreSettings } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  PhoneCall, 
  Play, 
  Pause, 
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Flame,
  Star,
  ShoppingBag,
  Truck
} from 'lucide-react';

export interface ShowcaseProduct {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  price: number;
  oldPrice?: number;
  image: string;
}

// Curated showcase products for advertising & WhatsApp direct orders
export const SHOWCASE_PRODUCTS: ShowcaseProduct[] = [
  {
    id: 'spotlight-01',
    name: 'iPhone 16 Pro Max 256GB Titane Bleu',
    subtitle: 'Écran Super Retina XDR 6.9", Puce A18 Pro, Caméra 48 MP Fusion',
    badge: '🔥 OFFRE EXCLUSIVE',
    price: 890000,
    oldPrice: 980000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-02',
    name: 'Apple Watch Ultra 2 Titane (Bracelet Océan)',
    subtitle: 'Boîtier titane 49 mm, GPS double fréquence et 72h d\'autonomie',
    badge: '⚡ VENTE FLASH',
    price: 240000,
    oldPrice: 295000,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-03',
    name: 'AirPods Pro 2 USB-C MagSafe (ANC 2x)',
    subtitle: 'Réduction active du bruit de pointe et Audio Spatial personnalisé 3D',
    badge: '⭐ BEST-SELLER',
    price: 65000,
    oldPrice: 85000,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-04',
    name: 'Enceinte JBL Charge 5 Bass Boost Waterproof',
    subtitle: 'Son puissant Pro JBL, Powerbank intégrée, 20h d\'autonomie continue',
    badge: '🔊 MEGA BASS',
    price: 55000,
    oldPrice: 70000,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-05',
    name: 'Samsung Galaxy S24 Ultra 5G AI Edition',
    subtitle: 'Écran Dynamic AMOLED 2X, S-Pen intégré, Zoom optique 100x',
    badge: '🤖 GALAXY AI',
    price: 790000,
    oldPrice: 880000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-06',
    name: 'Pack Super Chargeur GaN 65W + Câble 100W',
    subtitle: 'Recharge ultra-rapide simultanée pour ordinateur portable et téléphones',
    badge: '🔌 PACK PRO',
    price: 22000,
    oldPrice: 32000,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spotlight-07',
    name: 'Trépied Stabilisateur Gimbal 3 Axes AI Track',
    subtitle: 'Stabilisation cinématique ultra-fluide pour créateurs de contenu',
    badge: '🎬 CRÉATEUR',
    price: 45000,
    oldPrice: 60000,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
];

interface VideoSectionProps {
  settings: StoreSettings;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ settings }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedShowcase, setSelectedShowcase] = useState<ShowcaseProduct | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fast 1-click WhatsApp order state
  const [clientName, setClientName] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  // Infinite marquee elements
  const displayList = [...SHOWCASE_PRODUCTS, ...SHOWCASE_PRODUCTS, ...SHOWCASE_PRODUCTS];

  const handleOpenShowcase = (item: ShowcaseProduct) => {
    trackViewContent({
      id: item.id,
      name: item.name,
      slug: item.id,
      category: 'nouveautes',
      categoryLabel: 'Nouveautés',
      price: item.price,
      stock: 5,
      featured: true,
      status: 'published',
      image: item.image,
      gallery: [item.image],
      description: item.subtitle,
      specs: [],
      rating: 5.0,
      reviewsCount: 1,
      createdAt: '2026-09-24',
    });

    setSelectedShowcase(item);
    setOrderSent(false);
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const generateWhatsAppUrl = (item: ShowcaseProduct) => {
    const coordStr = clientName.trim()
      ? `\n👤 *Client :* ${clientName.trim()}` + (clientCity.trim() ? `\n📍 *Ville / Quartier :* ${clientCity.trim()}` : '')
      : '';

    const text = encodeURIComponent(
      `Bonjour Prime Shop !\n` +
      `Je souhaite profiter de cette offre vedette :\n\n` +
      `📦 *${item.name}*\n` +
      `💰 *Prix Spécial :* ${formatPrice(item.price, settings.currency)}\n` +
      (item.oldPrice ? `🏷️ *Ancien prix :* ${formatPrice(item.oldPrice, settings.currency)}\n` : '') +
      coordStr +
      `\n\nPouvez-vous me confirmer la disponibilité et lancer ma livraison ? Merci !`
    );

    return `https://wa.me/${settings.whatsappNumber}?text=${text}`;
  };

  return (
    <section className="relative overflow-hidden py-20 my-4 bg-[#f8f9fa] text-[#050508] border-y border-slate-200/80 shadow-xs">
      
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND VIDEO LAYER: New video URL provided by user */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="https://videotourl.com/videos/1790287007789-37a4f2ac-e233-4735-8b61-479452c46037.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-15 filter saturate-120 contrast-110 mix-blend-multiply"
        />

        {/* Luminous White Marble Gradient Wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] via-[#f8f9fa]/85 to-[#f8f9fa]" />
        <div className="absolute inset-0 bg-radial from-[#5433eb]/5 via-transparent to-[#f8f9fa]" />
      </div>

      {/* Heading Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-extrabold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#5433eb] animate-pulse" />
              <span>SÉLECTION EN MOUVEMENT • OFFRES EXCLUSIVES WHATSAPP</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#050508] tracking-tight">
              Constellation shopping <span className="text-[#5433eb]">en direct</span>
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base max-w-xl font-medium">
              Une sélection vivante pensée pour votre quotidien. Cliquez sur un article pour commander en 1 clic sans formalités.
            </p>
          </div>

          {/* Controls: Pause / Play & Mute */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleVideoPlayback}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#5433eb] text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Reprendre la vidéo' : 'Pause vidéo'}</span>
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#5433eb] shadow-xs hover:shadow-sm transition cursor-pointer"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING PILLOW-SOFT MARQUEE CONSTELLATION */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="relative z-10 w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`flex items-center gap-6 ${isPaused ? '' : 'animate-marquee'}`}>
          {displayList.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => handleOpenShowcase(item)}
              className="w-[290px] sm:w-[320px] shrink-0 rounded-[28px] bg-white border border-slate-200/90 hover:border-[#5433eb]/40 shadow-sm hover:shadow-xl hover:shadow-[#5433eb]/10 p-4 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-square w-full rounded-[22px] overflow-hidden bg-slate-100 mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-black text-[#5433eb] shadow-xs">
                  {item.badge}
                </div>

                {/* Rating overlay */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-3">
                <h3 className="font-extrabold text-sm text-[#050508] group-hover:text-[#5433eb] transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-[#050508]">
                    {formatPrice(item.price, settings.currency)}
                  </div>
                  {item.oldPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      {formatPrice(item.oldPrice, settings.currency)}
                    </div>
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5433eb] text-white text-xs font-bold group-hover:bg-[#4323d8] transition-colors shadow-xs">
                  <span>Voir</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1-CLICK WHATSAPP MODAL FOR SHOWCASE PRODUCT */}
      {/* ------------------------------------------------------------- */}
      {selectedShowcase && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setSelectedShowcase(null)} />

          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase">
                EXEMPLE DE DÉMONSTRATION
              </span>
              <button
                onClick={() => setSelectedShowcase(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Notice "C'était un exemple" */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-[#5433eb]/20 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-black text-[#5433eb]">
                <Sparkles className="w-4 h-4" />
                <span>Article de Démonstration Vitrine</span>
              </div>
              <p className="leading-relaxed">
                Cet article qui défilait sur la vitrine était <strong>un exemple de présentation</strong>. Vous pouvez consulter nos articles immédiatement disponibles en stock ou nous contacter sur WhatsApp pour toute commande personnalisée !
              </p>
            </div>

            {/* Product Highlight */}
            <div className="flex gap-4 items-center">
              <img
                src={selectedShowcase.image}
                alt={selectedShowcase.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-base text-[#050508] leading-tight">
                  {selectedShowcase.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {selectedShowcase.subtitle}
                </p>
                <div className="mt-2 text-lg font-black text-[#5433eb]">
                  {formatPrice(selectedShowcase.price, settings.currency)}
                </div>
              </div>
            </div>

            {/* Action Buttons: Return back or WhatsApp */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedShowcase(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>← Revenir en arrière sur la boutique</span>
              </button>

              <a
                href={`/#/shop`}
                onClick={() => setSelectedShowcase(null)}
                className="w-full py-3 px-4 rounded-xl bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold text-xs shadow-md shadow-[#5433eb]/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Voir nos produits 100% en stock au Bénin</span>
              </a>

              <a
                href={generateWhatsAppUrl(selectedShowcase)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedShowcase(null)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Demander la disponibilité sur WhatsApp</span>
              </a>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs text-slate-500 pt-1">
              <div className="flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-[#5433eb]" />
                <span>Livraison 24h</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement à la livraison</span>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </section>
  );
};
