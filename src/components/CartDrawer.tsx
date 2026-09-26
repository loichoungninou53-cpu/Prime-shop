import React, { useState } from 'react';
import { CartItem, StoreSettings } from '../types';
import { formatPrice } from '../utils/storage';
import { trackInitiateCheckout } from '../utils/pixel';
import { soundFX } from '../utils/audio';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles, Tag, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenCheckout: (discountAmount: number) => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  settings,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const applyCoupon = () => {
    soundFX.playPop();
    const code = couponCode.trim().toUpperCase();
    if (code === 'PRIME10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponMessage(`Code PRIME10 appliqué (-10%) : -${disc.toLocaleString('fr-FR')} ${settings.currency}`);
    } else if (code === 'BIENVENUE') {
      const disc = 2000;
      setDiscount(disc);
      setCouponMessage(`Code BIENVENUE appliqué : -2 000 ${settings.currency}`);
    } else {
      setDiscount(0);
      setCouponMessage('Code promo invalide. Essayez PRIME10.');
    }
  };

  const handleCheckoutClick = () => {
    trackInitiateCheckout(items, total);
    onClose();
    onOpenCheckout(discount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-[#f8f9fa]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#5433eb]" />
              <h2 className="text-lg font-black text-[#050508]">Mon Panier</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ece7ff] text-[#5433eb] text-xs font-black">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Free Delivery progress */}
          <div className="px-6 py-3 bg-[#ece7ff]/60 border-b border-[#5433eb]/10 text-xs">
            {subtotal >= settings.freeDeliveryThreshold ? (
              <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Félicitations ! La livraison vous est offerte.
              </div>
            ) : (
              <div className="text-slate-700">
                Plus que{' '}
                <strong className="text-[#5433eb]">
                  {formatPrice(settings.freeDeliveryThreshold - subtotal, settings.currency)}
                </strong>{' '}
                pour la livraison offerte à Cotonou !
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#050508] mb-1">Votre panier est vide</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explorez le catalogue Prime Shop pour trouver vos articles préférés.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold shadow-md shadow-[#5433eb]/20 transition cursor-pointer"
                >
                  Découvrir les produits
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-[22px] bg-[#f8f9fa] border border-slate-200/90 flex gap-3.5 items-center justify-between shadow-xs"
                >
                  {/* Thumb */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#050508] truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-xs text-[#5433eb] font-black mt-1">
                      {formatPrice(item.product.price, settings.currency)}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-lg bg-white border border-slate-200 px-1 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 text-slate-600 hover:text-black flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#050508]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-5 h-5 text-slate-600 hover:text-black flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0 font-black text-xs text-[#050508]">
                    {formatPrice(item.product.price * item.quantity, settings.currency)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-[#f8f9fa] space-y-4">
              
              {/* Promo Code Input */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Code promo (ex: PRIME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-[#050508] text-xs placeholder-slate-400 focus:outline-none focus:border-[#5433eb] uppercase font-bold"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#5433eb] text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Appliquer
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${discount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price rows */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="font-bold text-[#050508]">{formatPrice(subtotal, settings.currency)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Remise</span>
                    <span>-{formatPrice(discount, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison</span>
                  <span className="font-bold text-[#050508]">
                    {deliveryFee === 0 ? 'Gratuit' : formatPrice(deliveryFee, settings.currency)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-[#050508]">
                  <span>Total à payer</span>
                  <span className="text-base text-[#5433eb]">{formatPrice(total, settings.currency)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#5433eb]/25 flex items-center justify-center gap-2 transition hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Commander maintenant (1 Clic)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
