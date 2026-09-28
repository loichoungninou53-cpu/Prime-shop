import React, { useState } from 'react';
import { Logo } from './Logo';
import { StoreSettings } from '../types';
import { 
  PhoneCall, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowUp, 
  ShieldCheck 
} from 'lucide-react';

interface FooterProps {
  settings: StoreSettings;
  setRoute: (route: string) => void;
  onOpenFreeGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setRoute, onOpenFreeGuide }) => {
  const [secretClicks, setSecretClicks] = useState(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secret Admin Trigger: Clicking copyright text 3 times opens hidden admin
  const handleSecretClick = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 3) {
      setSecretClicks(0);
      setRoute(`#/${settings.adminSecretSlug || 'gestion-prime'}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-white border-t border-slate-200/80 pt-16 pb-28 md:pb-16 text-slate-600 text-xs overflow-hidden">
      {/* Background subtle violet glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5433eb]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
              Prime Shop est votre destination shopping de référence pour l'électronique de pointe, les accessoires mobiles et les pépites indispensables du quotidien au Bénin.
            </p>
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition text-xs shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Service Client WhatsApp</span>
              </a>

              <button
                onClick={onOpenFreeGuide}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ece7ff] hover:bg-[#ded6ff] text-[#5433eb] text-xs font-bold border border-[#5433eb]/20 transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5433eb]" />
                <span>Guide Gratuit (0 FCFA)</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#050508]">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#/"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="#/shop"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/shop');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Toute la boutique
                </a>
              </li>
              <li>
                <a
                  href="#/wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/wishlist');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Mes Favoris
                </a>
              </li>
              <li>
                <a
                  href="#/account"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/account');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Mon Espace Client
                </a>
              </li>
              <li>
                <a
                  href="#/suivi"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/suivi');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition font-bold text-[#5433eb]"
                >
                  Suivre mon Colis 📦
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#050508]">Catégories</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#/shop?cat=electronique"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/shop?cat=electronique');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Électronique & High-Tech
                </a>
              </li>
              <li>
                <a
                  href="#/shop?cat=accessoires"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/shop?cat=accessoires');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Accessoires Téléphone
                </a>
              </li>
              <li>
                <a
                  href="#/shop?cat=quotidien"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/shop?cat=quotidien');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Produits du quotidien
                </a>
              </li>
              <li>
                <a
                  href="#/shop?cat=populaires"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute('#/shop?cat=populaires');
                    scrollToTop();
                  }}
                  className="hover:text-[#5433eb] transition"
                >
                  Les Plus Populaires
                </a>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#050508]">Modes de Règlement</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paiement cash à la livraison</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>MTN MoMo / Moov Money / Celtiis</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                <CreditCard className="w-4 h-4 text-[#5433eb] shrink-0" />
                <span>Cartes bancaires Visa & Mastercard</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar (Zero visible admin links - Hidden secret trigger on 3-click copyright) */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              onClick={handleSecretClick}
              className="cursor-default select-none text-slate-500 hover:text-slate-800 transition"
              title=""
            >
              © 2026 {settings.storeName}. Tous droits réservés.
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> 100% Produits Authentiques
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#050508] transition cursor-pointer shadow-xs"
              title="Retour en haut"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
