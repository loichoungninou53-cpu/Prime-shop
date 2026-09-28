import React, { useState } from 'react';
import { CartItem, Order, StoreSettings } from '../types';
import { formatPrice } from '../utils/storage';
import { trackPurchase } from '../utils/pixel';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  PhoneCall, 
  Truck, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Smartphone
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  settings: StoreSettings;
  onOrderCreated: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  settings,
  onOrderCreated,
  onClearCart,
}) => {
  // Simplified 3-field form (Zéro Paperasse)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !location.trim()) {
      alert('Veuillez renseigner votre Nom, Téléphone et Ville/Quartier.');
      return;
    }

    setIsSubmitting(true);

    const orderNumber = 'PS-' + Math.floor(1000 + Math.random() * 9000);
    const methodLabels: Record<string, string> = {
      cod: 'Paiement en espèces à la livraison',
      momo: 'Mobile Money (Wave / MTN / Moov / Orange)',
    };

    const newOrder: Order = {
      id: orderNumber,
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: location.trim(),
        address: location.trim(),
      },
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      paymentMethodLabel: methodLabels[paymentMethod] || 'Paiement à la livraison',
      status: 'Nouvelle',
      createdAt: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      updatedAt: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
      }),
    };

    // Save order
    onOrderCreated(newOrder);

    // Play celebration audio feedback
    soundFX.playSuccessChime();

    // Trigger Meta Facebook Pixel Purchase event
    trackPurchase(newOrder, settings.currency);

    // Clear cart
    onClearCart();

    // Trigger Confetti Celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5433eb', '#7c3aed', '#10b981', '#38bdf8'],
      });
    } catch {
      // fallback
    }

    setIsSubmitting(false);
    setCompletedOrder(newOrder);
  };

  // WhatsApp 1-click confirmation text
  const generateWhatsAppLink = (order: Order) => {
    const itemsList = order.items
      .map((i) => `• ${i.quantity}x ${i.name} (${formatPrice(i.price * i.quantity, settings.currency)})`)
      .join('\n');

    const trackingUrl = `${window.location.origin}/#/suivi?id=${order.id}`;

    const msg = encodeURIComponent(
      `Bonjour Prime Shop !\n` +
      `Je viens de valider ma commande *#${order.id}* :\n\n` +
      `👤 *Client :* ${order.customer.fullName}\n` +
      `📱 *Téléphone :* ${order.customer.phone}\n` +
      `📍 *Adresse de livraison :* ${order.customer.city}\n\n` +
      `📦 *Articles :*\n${itemsList}\n\n` +
      `💵 *Total :* ${formatPrice(order.total, settings.currency)}\n` +
      `💳 *Mode :* ${order.paymentMethodLabel}\n\n` +
      `🔗 *Lien de suivi en direct :* ${trackingUrl}\n\n` +
      `Pouvez-vous me confirmer le passage du coursier ? Merci !`
    );

    return `https://wa.me/${settings.whatsappNumber}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={completedOrder ? onClose : undefined} />

      <div className="relative w-full max-w-xl rounded-[28px] bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#f8f9fa]">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#5433eb]" />
            <h2 className="text-base sm:text-lg font-black text-[#050508]">
              {completedOrder ? 'Commande Enregistrée !' : 'Commande Rapide (Zéro Paperasse)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Completed View */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="inline-block px-3.5 py-1 rounded-full bg-[#ece7ff] text-[#5433eb] text-xs font-black">
                Commande N° #{completedOrder.id}
              </div>
              <h3 className="text-2xl font-black text-[#050508]">
                Merci {completedOrder.customer.fullName} !
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
                Votre commande est confirmée. Cliquez ci-dessous pour ouvrir la discussion WhatsApp avec notre équipe de livraison.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between text-slate-600">
                <span>Client :</span>
                <strong className="text-[#050508]">{completedOrder.customer.fullName} ({completedOrder.customer.phone})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Adresse de livraison :</span>
                <strong className="text-[#050508]">{completedOrder.customer.city}</strong>
              </div>
              <div className="flex justify-between text-slate-700 pt-2 border-t border-slate-200 text-sm font-black">
                <span>Total à la livraison :</span>
                <span className="text-[#5433eb]">{formatPrice(completedOrder.total, settings.currency)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 max-w-md mx-auto">
              <a
                href={generateWhatsAppLink(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition active:scale-98"
              >
                <PhoneCall className="w-5 h-5" />
                <span>CONFIRMER SUR WHATSAPP</span>
              </a>

              <a
                href={`#/suivi?id=${completedOrder.id}`}
                onClick={onClose}
                className="w-full py-3 px-6 rounded-full bg-[#ece7ff] hover:bg-[#ded6ff] text-[#5433eb] font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Truck className="w-4 h-4 text-[#5433eb]" />
                <span>Suivre mon colis en direct (#{completedOrder.id})</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
              >
                Retourner à la boutique
              </button>
            </div>
          </div>
        ) : (
          /* Simplified Checkout Form: Just 3 inputs */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            
            <div className="p-3.5 rounded-2xl bg-[#ece7ff]/60 border border-[#5433eb]/20 flex items-center gap-2.5 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aucun compte requis. Remplissez simplement ces 3 champs pour recevoir votre colis.</span>
            </div>

            {/* Field 1: Nom complet */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                1. Votre Nom et Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Koffi Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#050508] placeholder-slate-400 text-sm focus:outline-none focus:border-[#5433eb]"
              />
            </div>

            {/* Field 2: Numéro WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                2. Votre Numéro WhatsApp pour le livreur *
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: +229 97 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#050508] placeholder-slate-400 text-sm focus:outline-none focus:border-[#5433eb]"
              />
            </div>

            {/* Field 3: Ville & Quartier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                3. Ville et Quartier de livraison *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cotonou, Haie Vive (face Pharmacie)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#050508] placeholder-slate-400 text-sm focus:outline-none focus:border-[#5433eb]"
              />
            </div>

            {/* Mode de paiement */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Mode de règlement :
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-[#ece7ff] border-[#5433eb] text-[#5433eb] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Espèces à réception</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'bg-[#ece7ff] border-[#5433eb] text-[#5433eb] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Mobile Money</span>
                </button>
              </div>
            </div>

            {/* Recap Box */}
            <div className="p-3.5 rounded-2xl bg-[#f8f9fa] border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Articles ({items.reduce((acc, i) => acc + i.quantity, 0)}) :</span>
                <span className="font-bold text-[#050508]">{formatPrice(subtotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-bold text-[#050508]">{isFreeDelivery ? 'Offerte (0 FCFA)' : formatPrice(deliveryFee, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#050508] pt-2 border-t border-slate-200">
                <span>Total à régler à réception :</span>
                <span className="text-[#5433eb]">{formatPrice(total, settings.currency)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#5433eb]/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>CONFIRMER LA COMMANDE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5433eb]" />
              Paiement à la livraison après inspection de votre colis
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
