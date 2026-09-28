import React, { useState, useEffect } from 'react';
import { Order, StoreSettings } from '../types';
import { formatPrice } from '../utils/storage';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { getSupabaseClient } from '../utils/supabase';
import { BeninDeliveryMap } from './BeninDeliveryMap';

interface TrackingViewProps {
  orders: Order[];
  settings: StoreSettings;
  initialOrderId?: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ orders, settings, initialOrderId }) => {
  const [searchCode, setSearchCode] = useState(initialOrderId || '');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      const match = orders.find(
        (o) => o.id.toLowerCase() === initialOrderId.toLowerCase() || o.customer.phone.includes(initialOrderId)
      );
      if (match) {
        setFoundOrder(match);
        setSearchCode(match.id);
        setHasSearched(true);
      } else {
        // Fallback check Supabase in background
        const client = getSupabaseClient();
        if (client) {
          client
            .from('orders')
            .select('*')
            .ilike('id', `%${initialOrderId}%`)
            .limit(1)
            .then(({ data }) => {
              if (data && data[0]) {
                setFoundOrder(data[0]);
                setSearchCode(data[0].id);
                setHasSearched(true);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [initialOrderId, orders]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundFX.playPop();
    const query = searchCode.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    const match = orders.find((o) => {
      const matchId = o.id.toLowerCase().includes(query) || query.includes(o.id.toLowerCase());
      const matchPhone = o.customer.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''));
      return matchId || matchPhone;
    });

    if (match) {
      setFoundOrder(match);
    } else {
      setFoundOrder(null);
      // Fallback check Supabase
      const client = getSupabaseClient();
      if (client) {
        client
          .from('orders')
          .select('*')
          .ilike('id', `%${query}%`)
          .limit(1)
          .then(({ data }) => {
            if (data && data[0]) {
              setFoundOrder(data[0]);
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleShareTracking = () => {
    soundFX.playPop();
    const trackingUrl = `${window.location.origin}/#/suivi?id=${foundOrder?.id}`;
    if (navigator.share && foundOrder) {
      navigator.share({
        title: `Suivi Colis Prime Shop #${foundOrder.id}`,
        text: `Suivez votre commande Prime Shop #${foundOrder.id} en direct :`,
        url: trackingUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const steps = [
    { title: 'Commande Reçue', desc: 'Commande enregistrée par notre centrale' },
    { title: 'En Préparation', desc: 'Articles inspectés et emballés sous blister' },
    { title: 'Remis au Coursier', desc: 'Pris en charge par notre livreur express' },
    { title: 'En cours de Livraison', desc: 'En route vers votre quartier / adresse' },
    { title: 'Colis Livré', desc: 'Paiement effectué et remise en main propre' },
  ];

  const getStepProgress = (status: Order['status']): number => {
    switch (status) {
      case 'Nouvelle': return 1;
      case 'Confirmée': return 2;
      case 'En préparation': return 2;
      case 'Expédiée': return 4;
      case 'Livrée': return 5;
      case 'Annulée': return 0;
      default: return 2;
    }
  };

  const currentStep = foundOrder ? getStepProgress(foundOrder.status) : 2;

  return (
    <div className="min-h-screen py-10 pb-24 bg-[#f2f4f5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-bold tracking-wider uppercase shadow-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>SUIVI EN TEMPS RÉEL DU COLIS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#050508] tracking-tight">
            Où se trouve votre commande ?
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
            Entrez votre numéro de commande (ex: <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[#5433eb] font-bold">PS-4821</code>) ou votre numéro WhatsApp pour suivre votre coursier.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2 p-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm focus-within:border-[#5433eb] focus-within:ring-2 focus-within:ring-[#5433eb]/20 transition">
            <div className="relative flex-1 flex items-center pl-4">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Numéro de commande ou tél (ex: PS-1234)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full bg-transparent text-sm text-[#050508] placeholder-slate-400 focus:outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold shadow-md shadow-[#5433eb]/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>Suivre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Tracking Details View */}
        {foundOrder ? (
          <div className="rounded-[28px] p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-8 animate-fadeIn">
            
            {/* Top Bar with Order Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg sm:text-xl text-[#050508]">
                    Commande #{foundOrder.id}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ece7ff] text-[#5433eb] border border-[#5433eb]/20">
                    {foundOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enregistrée le <strong>{foundOrder.createdAt}</strong> • Expédition par coursier Prime Shop
                </p>
              </div>

              {/* Share tracking link button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareTracking}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer relative"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#5433eb]" />
                  <span>Partager ce suivi</span>
                  {copiedLink && (
                    <span className="absolute -bottom-8 right-0 px-2.5 py-1 rounded-md bg-[#050508] text-white text-[10px] whitespace-nowrap shadow-lg">
                      Lien copié !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Timeline Steps (5 Steps) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5433eb]" />
                <span>Progression de votre livraison</span>
              </h3>

              <div className="relative pt-2">
                {/* Connecting horizontal line */}
                <div className="hidden sm:block absolute top-6 left-8 right-8 h-1 bg-slate-100 -z-0">
                  <div 
                    className="h-full bg-[#5433eb] transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100))}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {steps.map((st, idx) => {
                    const stepNum = idx + 1;
                    const isDone = currentStep >= stepNum;
                    const isCurrent = currentStep === stepNum;

                    return (
                      <div key={idx} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0 ${
                            isCurrent
                              ? 'bg-[#5433eb] text-white ring-4 ring-[#5433eb]/20 shadow-md'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                        </div>

                        <div>
                          <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#5433eb]' : isDone ? 'text-[#050508]' : 'text-slate-400'}`}>
                            {st.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            {st.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REAL-TIME BENIN GPS TRACKING MAP */}
            <BeninDeliveryMap order={foundOrder} settings={settings} />

            {/* Delivery Reassurance & Destination Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-500 font-bold block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5433eb]" /> Destination du Colis
                </span>
                <strong className="text-sm font-black text-[#050508] block">
                  {foundOrder.customer.fullName}
                </strong>
                <span className="text-slate-600 block">
                  📱 {foundOrder.customer.phone}
                </span>
                <span className="text-slate-600 block">
                  📍 {foundOrder.customer.city}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#ece7ff]/50 border border-[#5433eb]/20 text-xs space-y-1.5">
                <span className="text-[#5433eb] font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Règlement & Remise
                </span>
                <div className="text-sm font-black text-[#050508]">
                  Montant à régler : <span className="text-[#5433eb]">{formatPrice(foundOrder.total, settings.currency)}</span>
                </div>
                <span className="text-slate-600 block">
                  Mode : {foundOrder.paymentMethodLabel}
                </span>
                <p className="text-[11px] text-slate-500">
                  ⚠️ <em>Vérifiez le colis avec le coursier avant de régler en espèces ou Mobile Money.</em>
                </p>
              </div>
            </div>

            {/* Parcel Contents List */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Articles dans le colis ({foundOrder.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h4>
              <div className="space-y-2">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200" />
                      <div>
                        <strong className="text-[#050508] block font-bold">{item.name}</strong>
                        <span className="text-slate-500">Quantité : {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-[#050508]">
                      {formatPrice(item.price * item.quantity, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Contact with Courier */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  `Bonjour Prime Shop ! Je consulte le suivi de ma commande *#${foundOrder.id}* et je souhaite échanger avec le coursier.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Joindre le service livraison sur WhatsApp</span>
              </a>
            </div>

          </div>
        ) : hasSearched ? (
          <div className="rounded-[28px] p-10 bg-white border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#050508]">
              Aucune commande trouvée pour "{searchCode}"
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Vérifiez le numéro indiqué (ex: <code className="font-bold text-[#5433eb]">PS-1234</code>) ou entrez le numéro WhatsApp utilisé lors de la commande.
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent("Bonjour Prime Shop, je souhaite vérifier le statut de ma commande.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5433eb] text-white text-xs font-bold shadow-xs hover:bg-[#4323d8] transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Demander à notre support WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="rounded-[28px] p-8 bg-white border border-slate-200/90 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#ece7ff] text-[#5433eb] flex items-center justify-center mx-auto shadow-inner">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#050508]">
              Suivez votre coursier en toute sérénité
            </h3>
            <p className="text-xs text-slate-500">
              Chaque commande passée sur Prime Shop dispose d'un identifiant unique vous permettant de suivre l'avancée de la livraison étape par étape.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
