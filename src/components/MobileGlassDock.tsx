import React from 'react';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';

interface MobileGlassDockProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openSearch: () => void;
}

export const MobileGlassDock: React.FC<MobileGlassDockProps> = ({
  currentRoute,
  setRoute,
  cartCount,
  wishlistCount,
  openCart,
  openSearch,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none">
      <div className="mx-auto max-w-sm rounded-full p-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-[#5433eb]/10 flex items-center justify-around pointer-events-auto">
        
        {/* Accueil */}
        <button
          onClick={() => {
            setRoute('#/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition cursor-pointer ${
            currentRoute === '#/' ? 'text-[#5433eb] bg-[#ece7ff]' : 'text-slate-500 hover:text-black'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Accueil</span>
        </button>

        {/* Boutique */}
        <button
          onClick={() => {
            setRoute('#/shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition cursor-pointer ${
            currentRoute.startsWith('#/shop') ? 'text-[#5433eb] bg-[#ece7ff]' : 'text-slate-500 hover:text-black'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Boutique</span>
        </button>

        {/* Recherche */}
        <button
          onClick={openSearch}
          className="flex flex-col items-center justify-center p-2 rounded-full text-slate-500 hover:text-[#5433eb] transition cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Chercher</span>
        </button>

        {/* Favoris */}
        <button
          onClick={() => {
            setRoute('#/wishlist');
          }}
          className={`relative flex flex-col items-center justify-center p-2 rounded-full transition cursor-pointer ${
            currentRoute.includes('wishlist') ? 'text-rose-500 bg-rose-50' : 'text-slate-500 hover:text-rose-500'
          }`}
        >
          <Heart className="w-4 h-4" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-bold mt-0.5">Favoris</span>
        </button>

        {/* Panier */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full text-white bg-[#5433eb] hover:bg-[#4323d8] transition shadow-md shadow-[#5433eb]/30 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-white text-[#5433eb] text-[9px] font-black flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold mt-0.5">Panier</span>
        </button>

      </div>
    </div>
  );
};
