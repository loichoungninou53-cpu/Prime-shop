import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  User, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  settings: StoreSettings;
  openSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  setRoute,
  cartCount,
  wishlistCount,
  openCart,
  settings,
  openSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil', route: '#/' },
    { label: 'Boutique', route: '#/shop' },
    { label: 'Électronique', route: '#/shop?cat=electronique' },
    { label: 'Accessoires', route: '#/shop?cat=accessoires' },
    { label: 'Nouveautés', route: '#/shop?cat=nouveautes' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Announcement Banner (Shop Violet gradient) */}
      {settings.bannerEnabled && settings.bannerNotice && (
        <div className="bg-gradient-to-r from-[#5433eb] via-[#6d28d9] to-[#7c3aed] text-white text-xs sm:text-sm font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300 shrink-0" />
          <span className="truncate">{settings.bannerNotice}</span>
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 ml-3 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-semibold transition"
          >
            <PhoneCall className="w-3 h-3" /> WhatsApp Direct
          </a>
        </div>
      )}

      {/* Main Glass Nav - Light Mist / White Marble */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3'
            : 'bg-white/70 backdrop-blur-sm border-b border-slate-200/40 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              setRoute('#/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group"
          >
            <Logo size="md" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#f2f4f5] p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route || (link.route.startsWith('#/shop') && currentRoute.startsWith('#/shop') && currentRoute === link.route);
              return (
                <a
                  key={link.label}
                  href={link.route}
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute(link.route);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-[#5433eb] text-white shadow-sm shadow-[#5433eb]/30'
                      : 'text-slate-600 hover:text-[#050508] hover:bg-white'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right Action Icons (Public Customer Icons) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#050508] transition shadow-xs cursor-pointer"
              title="Rechercher un article"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Link */}
            <a
              href="#/wishlist"
              onClick={(e) => {
                e.preventDefault();
                setRoute('#/wishlist');
              }}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-500 transition shadow-xs cursor-pointer"
              title="Mes favoris"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </a>

            {/* Customer Account */}
            <a
              href="#/account"
              onClick={(e) => {
                e.preventDefault();
                setRoute('#/account');
              }}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#5433eb] transition shadow-xs cursor-pointer hidden sm:flex items-center justify-center"
              title="Mon espace client"
            >
              <User className="w-4 h-4" />
            </a>

            {/* WhatsApp Quick Link */}
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent("Bonjour Prime Shop, je souhaite des renseignements sur vos articles.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 text-xs font-bold transition shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assistance</span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold shadow-md shadow-[#5433eb]/25 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#5433eb] text-xs font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 mt-2 space-y-2 shadow-lg animate-fadeIn">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.route}
                onClick={(e) => {
                  e.preventDefault();
                  setRoute(link.route);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  currentRoute === link.route
                    ? 'bg-[#5433eb] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="#/account"
                onClick={(e) => {
                  e.preventDefault();
                  setRoute('#/account');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="w-4 h-4 text-[#5433eb]" />
                <span>Mon Espace Client</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contacter sur WhatsApp Direct</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
