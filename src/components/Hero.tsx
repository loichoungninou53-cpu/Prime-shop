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
  ExternalLink,
  ShoppingBag,
  Volume2,
  VolumeX,
  Smile
} from 'lucide-react';
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
    setTilt({ x: x * 10, y: -y * 8 });
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

    // Spawn floating heart particle
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
      className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f5f2fc] via-[#f0effa] to-[#f2f4f5] pt-6 pb-4 sm:pb-8 border-b border-slate-200/60"
    >
      
      {/* Subtle Ambient Radial Light behind the 3D Character */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#5433eb]/10 via-[#a78bfa]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sound Toggle Pill */}
      <div className="absolute top-4 right-4 z-20 hidden md:block">
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
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 hidden lg:grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Editorial Headline & Nav Links */}
        <div className="col-span-4 flex flex-col items-start text-left space-y-4 pt-2">
          {/* Eyebrow */}
          <span className="text-xs font-semibold tracking-wider text-slate-500 lowercase font-mono">
            have a fresh idea?
          </span>

          {/* Headline */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#050508] tracking-tight leading-[1.15]">
            imagination <br />
            <span className="text-[#5433eb]">meets craft</span>
          </h1>

          <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed pt-1">
            Découvrez une sélection exclusive pensée avec passion : smartphones, montres, audio & gadgets indispensables du quotidien au Bénin.
          </p>

          {/* Vertical Editorial Links */}
          <nav className="flex flex-col space-y-2.5 pt-4">
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
        </div>

        {/* CENTER COLUMN: Top Brand Wordmark */}
        <div className="col-span-4 flex flex-col items-center justify-start pt-1">
          <PrimeWordmark />
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-[11px] font-bold text-slate-700">
            <Sparkles className="w-3 h-3 text-[#5433eb]" />
            <span>Store Officiel • Cotonou, Calavi & Tout le Bénin</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Say Hey, Team Up Headline, Asterisk & Socials */}
        <div className="col-span-4 flex flex-col items-start text-left space-y-3 pt-2 pl-4">
          {/* Eyebrow */}
          <span className="text-xs font-semibold tracking-wider text-slate-500 lowercase font-mono">
            say hey
          </span>

          {/* Headline */}
          <h2 className="text-2xl xl:text-3xl font-extrabold text-[#050508] tracking-tight leading-tight">
            let’s team up! <br />
            <span>bring us your idea*</span>
          </h2>

          {/* Asterisk note */}
          <p className="text-[11px] text-slate-500 leading-snug font-medium max-w-xs">
            *livraison express sous 24h à Cotonou, Calavi et environs. Règlement sécurisé en cash ou Mobile Money à la réception.
          </p>

          {/* Social Channels Row */}
          <div className="flex items-center gap-3 pt-3">
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              aria-label="WhatsApp Prime Shop"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:scale-110 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <a
              href={`https://instagram.com/${(settings.instagramHandle || 'primeshop').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Prime Shop"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-pink-600 hover:border-pink-300 hover:scale-110 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a
              href={`https://tiktok.com/@${(settings.tiktokHandle || 'primeshop').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Prime Shop"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-400 hover:scale-110 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.14z"/>
              </svg>
            </a>

            <a
              href={`tel:${settings.whatsappNumber}`}
              aria-label="Appeler Prime Shop"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#5433eb] hover:border-[#5433eb]/40 hover:scale-110 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          {/* Quick WhatsApp Action Button */}
          <div className="pt-2">
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold shadow-md shadow-[#5433eb]/25 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Commander en 1 Clic</span>
            </a>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE HEADER & INTRO (Screen Profile < lg) */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:hidden relative z-10 px-4 text-center flex flex-col items-center pt-2 space-y-3">
        <PrimeWordmark className="h-9" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-[#5433eb]" />
          <span>Imagination meets craft • Prime Shop</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#050508] tracking-tight leading-tight">
          Tout ce qu'il vous faut.{' '}
          <span className="text-[#5433eb]">Au même endroit.</span>
        </h1>

        <p className="text-xs text-slate-600 font-medium max-w-sm">
          Électronique de pointe, accessoires tendance et service client WhatsApp 7j/7 avec paiement à la livraison au Bénin.
        </p>

        {/* Mobile Quick Action Pills */}
        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <button
            onClick={() => {
              soundFX.playPop();
              onDiscoverClick();
            }}
            className="px-4 py-2 rounded-full bg-[#5433eb] text-white text-xs font-bold shadow-md shadow-[#5433eb]/20 active:scale-95 transition cursor-pointer"
          >
            Boutique
          </button>
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFX.playPop()}
            className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <PhoneCall className="w-3 h-3" />
            WhatsApp
          </a>
          <button
            onClick={() => {
              soundFX.playPop();
              onNewArrivalsClick();
            }}
            className="px-4 py-2 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer"
          >
            Nouveautés 🔥
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTERPIECE: TACTILE 3D CHARACTER (Visible on both PC & Mobile) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 w-full flex flex-col items-center justify-end mt-4 sm:mt-6">
        
        {/* Interactive Speech Bubble */}
        {showBubble && (
          <div className="mb-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#5433eb]/30 shadow-xl shadow-[#5433eb]/10 max-w-sm text-center animate-slideUp relative">
            <p className="text-xs font-bold text-[#050508] leading-snug">
              {MASCOT_QUOTES[currentQuoteIndex]}
            </p>
            <div className="text-[10px] text-[#5433eb] mt-1 font-semibold flex items-center justify-center gap-1">
              <Smile className="w-3 h-3" /> Cliquez sur la mascotte pour un autre conseil !
            </div>
            {/* Arrow triangle pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
          </div>
        )}

        {/* Character Frame with Subtle Mouse Tilt */}
        <div 
          className="relative max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full flex justify-center items-end"
          onMouseEnter={() => setCharacterHovered(true)}
          onMouseLeave={() => setCharacterHovered(false)}
          style={{
            transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Main Pristine Tactile 3D Image */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[52vh] flex items-end justify-center">
            <picture className="w-full h-full flex items-end justify-center">
              <source srcSet="/hero-character-clean.webp" type="image/webp" />
              <img
                src="/hero-character-clean.png"
                alt="Prime Shop Tactile Mascot - Douceur, Passion et Confiance"
                className="w-full h-full object-contain object-bottom animate-float-gentle drop-shadow-2xl transition-transform duration-500 select-none pointer-events-auto cursor-pointer"
                onClick={handleMascotClick}
                loading="eager"
              />
            </picture>

            {/* Simulated Black Cursor Arrow with interactive tooltip */}
            <div 
              className={`absolute top-[42%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 hidden sm:block ${
                characterHovered ? 'scale-110 -translate-y-6' : ''
              }`}
            >
              <div className="relative flex items-start">
                <svg 
                  className="w-9 h-9 text-black drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  stroke="white" 
                  strokeWidth="1.5"
                >
                  <path d="M4 2v17.2l4.8-4.8 3.5 8.1 3.5-1.5-3.5-8.1 6.5.1L4 2z" />
                </svg>

                {/* Micro tooltip pill on hover */}
                <div className="ml-2 mt-2 px-3 py-1 rounded-full bg-[#050508] text-white text-[11px] font-bold shadow-xl border border-white/20 whitespace-nowrap animate-fadeIn">
                  Cliquez-moi pour un conseil ✨
                </div>
              </div>
            </div>

            {/* Interactive Heart Counter Badge with Particle Emitter */}
            <button
              onClick={handleHeartClick}
              className="absolute bottom-6 right-6 sm:right-12 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-black/5 hover:scale-108 active:scale-95 transition flex items-center gap-2 cursor-pointer z-20 group"
              title="Envoyer un coup de cœur à Prime Shop"
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
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
                className="absolute bottom-12 right-10 pointer-events-none animate-floatUp text-rose-500 text-lg"
                style={{ transform: `translateX(${h.x}px)` }}
              >
                ❤️
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM REASSURANCE STRIP (Clean White Marble & Shop Violet) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pt-2">
        <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <Truck className="w-4 h-4 text-[#5433eb] shrink-0" />
            <span>Livraison 24h Bénin</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Paiement à Réception</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Commande 1 Clic Direct</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-[#5433eb] shrink-0" />
            <span>Produits 100% Testés</span>
          </div>
        </div>
      </div>

    </section>
  );
};
