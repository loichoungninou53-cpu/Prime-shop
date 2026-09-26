import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface LiveSalesNotificationProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

const RECENT_BUYERS = [
  { name: 'Koffi A.', city: 'Cotonou (Haie Vive)', time: 'Il y a 3 min' },
  { name: 'Aminata B.', city: 'Abomey-Calavi (Arconville)', time: 'Il y a 7 min' },
  { name: 'Marc D.', city: 'Cotonou (Cadjehoun)', time: 'Il y a 12 min' },
  { name: 'Sylvie M.', city: 'Porto-Novo (Avakpa)', time: 'Il y a 15 min' },
  { name: 'Romaric T.', city: 'Cotonou (Fidjrossè)', time: 'Il y a 18 min' },
  { name: 'Bernadette K.', city: 'Cotonou (Akpakpa)', time: 'Il y a 22 min' },
];

export const LiveSalesNotification: React.FC<LiveSalesNotificationProps> = ({ products, onSelectProduct }) => {
  const [currentNotification, setCurrentNotification] = useState<{
    buyer: typeof RECENT_BUYERS[0];
    product: Product;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || products.length === 0) return;

    // Show initial notification after 6 seconds
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();
    }, 6000);

    // Then interval every 18 seconds
    const interval = setInterval(() => {
      triggerRandomNotification();
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products, dismissed]);

  const triggerRandomNotification = () => {
    if (dismissed || products.length === 0) return;
    const randomBuyer = RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    setCurrentNotification({
      buyer: randomBuyer,
      product: randomProduct,
    });
    setIsVisible(true);

    // Auto-hide after 5.5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5500);
  };

  if (!currentNotification || !isVisible || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm animate-slideUp">
      <div 
        onClick={() => onSelectProduct && onSelectProduct(currentNotification.product)}
        className="rounded-[22px] p-3.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl shadow-[#5433eb]/10 flex items-center gap-3 cursor-pointer hover:border-[#5433eb]/40 transition group"
      >
        {/* Product thumb with verified check */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          <img
            src={currentNotification.product.image}
            alt={currentNotification.product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <span>{currentNotification.buyer.name}</span>
            <span className="text-slate-400 font-normal">•</span>
            <span className="text-slate-500 text-[10px] truncate">{currentNotification.buyer.city}</span>
          </div>
          <p className="text-xs font-black text-[#5433eb] truncate">
            {currentNotification.product.name}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {currentNotification.buyer.time} • Commande vérifiée
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setDismissed(true);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition shrink-0"
          title="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
