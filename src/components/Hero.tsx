import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  PhoneCall, 
  Zap, 
  Flame, 
  MessageCircle, 
  Heart,
  ShoppingBag,
  Volume2,
  VolumeX,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreSettings } from '../types';
import { PrimeWordmark } from './Logo';
import { soundFX } from '../utils/audio';

interface HeroProps {
  onDiscoverClick: () => void;
  onNewArrivalsClick: () => void;
  onCatalogClick?: () => void;
  onGuideClick?: () => void;
  settings: StoreSettings;
}

const MASCOT_QUOTES = [
  "« Bienvenue chez Prime Shop ! Besoin d'un coup de cœur aujourd'hui ? »",
  "« 📦 Livraison express sous 24h à Cotonou et Calavi avec paiement à la réception ! »",
  "« 💬 Un doute ? Discutez directement avec notre équipe sur WhatsApp en 2 min ! »",
  "« ⭐ Tous nos articles sont testés et certifiés avant expédition. Zéro mauvaise surprise ! »",
  "« 🎁 Profitez du code promo PRIME10 pour 10% de réduction immédiate ! »",
];

export const Hero: React.FC<HeroProps> = ({ 
  onDiscoverClick, 
  onNewArrivalsClick, 
  onCatalogClick = onDiscoverClick,
  onGuideClick,
  settings 
}) => {
  const [characterHovered, setCharacterHovered] = useState(false);
  const [likesCount, setLikesCount] = useState(254);
  const [hasLiked, setHasLiked] = useState(false);
  const [heartsList, setHeartsList] = useState<{ id: number; x: number }[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundFX.getSoundEnabled());

  // Mouse tilt coordinates for 3D physics
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const whatsappHeroUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    "Bonjour Prime Shop ! Je souhaite passer commande directement en 1 clic sans formalités."
  )}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setCharacterHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playPop();
    setLikesCount(prev => prev + 1);
    setHasLiked(true);

    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
    setHeartsList(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHeartsList(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  };

  const handleMascotClick = () => {
    soundFX.playPop();
    setCurrentQuoteIndex(prev => (prev + 1) % MASCOT_QUOTES.length);
    setShowBubble(true);
  };

  const toggleSound = () => {
    const next = soundFX.toggleMute();
    setSoundEnabled(next);
  };

  return (
    <section 
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f5f2fc] via-[#f0effa] to-[#f2f4f5] pt-4 sm:pt-6 pb-4 border-b border-slate-200/60"
    >
      
      {/* Subtle Ambient Radial Light behind the 3D Character */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#5433eb]/10 via-[#a78bfa]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sound Toggle Pill */}
      <div className="absolute top-3 right-4 z-20 hidden md:block">
        <button
          onClick={toggleSound}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-600 hover:text-[#5433eb] shadow-xs transition cursor-pointer"
          title={soundEnabled ? 'Couper les sons d’ambiance' : 'Activer les sons d’ambiance'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5433eb]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          <span>{soundEnabled ? 'Audio interactif' : 'Audio muet'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP & TABLET EDITORIAL THREE-COLUMN LAYOUT (Screen Profile >= lg) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 hidden lg:grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Editorial Headline & Nav Links */}
        <motion.div 
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-4 flex flex-col items-start text-left space-y-3 pt-1"
        >
          <span className="text-xs font-semibold tracking-wider text-slate-500 lowercase font-mono">
            have a fresh idea?
          </span>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#050508] tracking-tight leading-[1.15]">
            imagination <br />
            <span className="text-[#5433eb]">meets craft</span>
          </h1>

          <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
            Découvrez une sélection exclusive pensée avec passion : smartphones, montres, audio & lifestyle au Bénin.
          </p>

          <nav className="flex flex-col space-y-2 pt-2">
            <button
              onClick={() => {
                soundFX.playPop();
                onDiscoverClick();
              }}
              className="text-left text-sm font-semibold text-slate-700 hover:text-[#5433eb] transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#5433eb] transition-colors" />
              <span>Collection Prime</span>
            </button>
            <button
              onClick={() => {
                soundFX.playPop();
                onNewArrivalsClick();
              }}
              className="text-left text-sm font-semibold text-slate-700 hover:text-[#5433eb] transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#5433eb] transition-colors" />
              <span>Nouveautés 2026</span>
            </button>
            {onGuideClick && (
              <button
                onClick={() => {
                  soundFX.playPop();
                  onGuideClick();
                }}
                className="text-left text-sm font-semibold text-slate-700 hover:text-[#5433eb] transition-colors flex items-center gap-2 group cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#5433eb] transition-colors" />
                <span>Guide Shopping Gratuit</span>
              </button>
            )}
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              className="text-left text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
              <span>Say hey sur WhatsApp</span>
            </a>
          </nav>
        </motion.div>

        {/* CENTER COLUMN: Top Brand Wordmark */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-4 flex flex-col items-center justify-start"
        >
          <PrimeWordmark className="h-9 sm:h-11" />
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-[11px] font-bold text-slate-700">
            <Sparkles className="w-3 h-3 text-[#5433eb]" />
            <span>Store Officiel • Cotonou, Calavi & Bénin</span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Say Hey, Team Up Headline, Asterisk & Socials */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-4 flex flex-col items-start text-left space-y-2.5 pt-1 pl-4"
        >
          <span className="text-xs font-semibold tracking-wider text-slate-500 lowercase font-mono">
            say hey
          </span>

          <h2 className="text-2xl xl:text-3xl font-extrabold text-[#050508] tracking-tight leading-tight">
            let’s team up! <br />
            <span>bring us your idea*</span>
          </h2>

          <p className="text-[11px] text-slate-500 leading-snug font-medium max-w-xs">
            *livraison express 24h à Cotonou, Calavi et tout le Bénin. Règlement à la réception.
          </p>

          {/* Social Channels Row */}
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              aria-label="WhatsApp Prime Shop"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:scale-110 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>

            <a
              href={`https://instagram.com/${(settings.instagramHandle || 'primeshop.bj').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Prime Shop"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-pink-600 hover:border-pink-300 hover:scale-110 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a
              href={`https://tiktok.com/@${(settings.tiktokHandle || 'primeshop.bj').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Prime Shop"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-400 hover:scale-110 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.14z"/>
              </svg>
            </a>

            <a
              href={`tel:${settings.whatsappNumber}`}
              aria-label="Appeler Prime Shop"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#5433eb] hover:border-[#5433eb]/40 hover:scale-110 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold shadow-md shadow-[#5433eb]/25 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Commander en 1 Clic</span>
            </a>
          </div>
        </motion.div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE HEADER & INTRO (Screen Profile < lg) */}
      {/* ------------------------------------------------------------- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:hidden relative z-10 px-4 text-center flex flex-col items-center space-y-2"
      >
        <PrimeWordmark className="h-8" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-[11px] font-bold text-slate-700">
          <Sparkles className="w-3 h-3 text-[#5433eb]" />
          <span>Imagination meets craft • Prime Shop</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#050508] tracking-tight leading-tight">
          Tout ce qu'il vous faut.{' '}
          <span className="text-[#5433eb]">Au même endroit.</span>
        </h1>

        {/* Mobile Quick Action Pills */}
        <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
          <button
            onClick={() => {
              soundFX.playPop();
              onDiscoverClick();
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#5433eb] text-white text-xs font-bold shadow-md shadow-[#5433eb]/20 active:scale-95 transition cursor-pointer"
          >
            Boutique
          </button>
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFX.playPop()}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <PhoneCall className="w-3 h-3" />
            WhatsApp
          </a>
          <button
            onClick={() => {
              soundFX.playPop();
              onNewArrivalsClick();
            }}
            className="px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
          >
            Nouveautés 🔥
          </button>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* CENTERPIECE: TACTILE 3D CHARACTER (TIGHT FRAMING, ZERO DEAD GAP) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-1 sm:mt-2">
        
        {/* Interactive Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#5433eb]/30 shadow-xl shadow-[#5433eb]/10 max-w-xs sm:max-w-sm text-center relative z-20"
            >
              <p className="text-[11px] sm:text-xs font-bold text-[#050508] leading-snug">
                {MASCOT_QUOTES[currentQuoteIndex]}
              </p>
              <div className="text-[10px] text-[#5433eb] mt-0.5 font-semibold flex items-center justify-center gap-1">
                <Smile className="w-3 h-3" /> Cliquez pour un autre conseil !
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character Frame with Subtle Mouse Tilt */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full flex justify-center items-end"
          onMouseEnter={() => setCharacterHovered(true)}
          onMouseLeave={() => setCharacterHovered(false)}
          style={{
            transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transition: 'transform 0.12s ease-out',
          }}
        >
          {/* Main Pristine Tactile 3D Image (COMPACT HEIGHT - NO OVERFLOW GAP) */}
          <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px] flex items-end justify-center">
            <picture className="w-full h-full flex items-end justify-center">
              <source srcSet="/hero-character-clean.webp" type="image/webp" />
              <img
                src="/hero-character-clean.png"
                alt="Prime Shop Tactile Mascot"
                className="w-auto h-full object-contain object-bottom animate-float-gentle drop-shadow-xl transition-transform duration-300 select-none pointer-events-auto cursor-pointer"
                onClick={handleMascotClick}
                loading="eager"
              />
            </picture>

            {/* Reference Screenshot Black Cursor Arrow */}
            <div 
              className={`absolute top-[40%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 hidden sm:block ${
                characterHovered ? 'scale-110 -translate-y-4' : ''
              }`}
            >
              <div className="relative flex items-start">
                <svg 
                  className="w-8 h-8 text-black drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  stroke="white" 
                  strokeWidth="1.5"
                >
                  <path d="M4 2v17.2l4.8-4.8 3.5 8.1 3.5-1.5-3.5-8.1 6.5.1L4 2z" />
                </svg>

                <div className="ml-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-[#050508] text-white text-[10px] font-bold shadow-xl border border-white/20 whitespace-nowrap">
                  Cliquez-moi ✨
                </div>
              </div>
            </div>

            {/* Interactive Heart Counter Badge */}
            <button
              onClick={handleHeartClick}
              className="absolute bottom-2 right-4 sm:right-8 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md hover:scale-108 active:scale-95 transition flex items-center gap-1.5 cursor-pointer z-20 group"
              title="Coup de cœur pour Prime Shop"
            >
              <Heart 
                className={`w-3.5 h-3.5 transition-colors ${
                  hasLiked ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-400 group-hover:text-rose-500'
                }`} 
              />
              <span className="text-xs font-bold text-slate-700">
                {likesCount}
              </span>
            </button>

            {/* Floating Heart Particles */}
            {heartsList.map(h => (
              <div
                key={h.id}
                className="absolute bottom-8 right-6 pointer-events-none animate-floatUp text-rose-500 text-base"
                style={{ transform: `translateX(${h.x}px)` }}
              >
                ❤️
              </div>
            ))}
          </div>

        </motion.div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* COMPACT REASSURANCE STRIP (FLUID INTEGRATION RIGHT UNDER MASCOT) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pt-1 sm:pt-2">
        <div className="rounded-[22px] bg-white/95 backdrop-blur-md border border-slate-200/80 p-2.5 sm:p-3 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
            <Truck className="w-3.5 h-3.5 text-[#5433eb] shrink-0" />
            <span>Livraison 24h Bénin</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Paiement à Réception</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Commande 1 Clic Direct</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-[#5433eb] shrink-0" />
            <span>Produits 100% Testés</span>
          </div>
        </div>
      </div>

    </section>
  );
};
