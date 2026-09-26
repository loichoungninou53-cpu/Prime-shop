import React, { useState } from 'react';
import { Order, Product, StoreSettings } from '../types';
import { formatPrice } from '../utils/storage';
import { 
  Package, 
  Heart, 
  MapPin, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  User, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AccountViewProps {
  orders: Order[];
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  settings: StoreSettings;
  initialTab?: string;
}

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  settings,
  initialTab = 'orders',
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(
    initialTab === 'wishlist' ? 'wishlist' : 'orders'
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const getStatusBadge = (status: Order['status']) => {
    const colors: Record<string, string> = {
      Nouvelle: 'bg-blue-50 text-blue-700 border-blue-200',
      Confirmée: 'bg-[#ece7ff] text-[#5433eb] border-[#5433eb]/30',
      'En préparation': 'bg-amber-50 text-amber-700 border-amber-200',
      Expédiée: 'bg-purple-50 text-purple-700 border-purple-200',
      Livrée: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Annulée: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors['Nouvelle']}`}>
        {status}
      </span>
    );
  };

  const steps: Order['status'][] = ['Nouvelle', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée'];

  return (
    <div className="min-h-screen py-8 pb-24 bg-[#f2f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="rounded-[28px] p-6 sm:p-8 bg-white border border-slate-200/90 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ece7ff] text-[#5433eb] flex items-center justify-center shrink-0 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-[#5433eb] font-extrabold uppercase tracking-wider">
                Espace Client Sécurisé
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#050508]">
                Bonjour & Bienvenue !
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivez vos commandes en cours, vos coups de cœur et échangez avec l'équipe Prime Shop.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=Bonjour%20Prime%20Shop%20Support,%20j'ai%20une%20question%20concernant%20mon%20compte.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition shadow-xs"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Assistance WhatsApp</span>
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#5433eb] text-white shadow-md shadow-[#5433eb]/20'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mes Commandes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[#5433eb] text-white shadow-md shadow-[#5433eb]/20'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Mes Favoris ({wishlistedProducts.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Orders list */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Historique des Commandes
              </h2>

              {orders.length === 0 ? (
                <div className="p-8 rounded-[28px] bg-white border border-slate-200 text-center">
                  <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Vous n'avez pas encore passé de commande.</p>
                  <p className="text-xs text-slate-500 mt-1">Vos commandes passées s'afficheront ici en temps réel.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-[22px] border transition-all cursor-pointer ${
                      selectedOrder?.id === order.id
                        ? 'bg-white border-[#5433eb] shadow-lg shadow-[#5433eb]/10'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-sm text-[#050508]">
                        #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>{order.createdAt}</span>
                      <span className="font-black text-[#5433eb] text-sm">
                        {formatPrice(order.total, settings.currency)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-2 truncate font-medium">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Order Detail & Live Timeline */}
            <div className="lg:col-span-7">
              {selectedOrder ? (
                <div className="rounded-[28px] p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm space-y-6">
                  
                  {/* Top order summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <span className="text-xs text-[#5433eb] font-bold uppercase">Détails de la commande</span>
                      <h3 className="text-2xl font-black text-[#050508]">
                        Commande #{selectedOrder.id}
                      </h3>
                      <span className="text-xs text-slate-500">Enregistrée le {selectedOrder.createdAt}</span>
                    </div>
                    <div>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">
                      Suivi d'acheminement en direct
                    </h4>

                    <div className="grid grid-cols-5 gap-2 text-center">
                      {steps.map((st, idx) => {
                        const stepIndex = steps.indexOf(selectedOrder.status);
                        const isDone = stepIndex >= idx;
                        const isCurrent = selectedOrder.status === st;

                        return (
                          <div key={st} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isCurrent
                                  ? 'bg-[#5433eb] text-white ring-4 ring-[#5433eb]/20 font-black'
                                  : isDone
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] sm:text-xs mt-2 font-bold leading-tight ${isDone ? 'text-[#050508]' : 'text-slate-400'}`}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer and Delivery info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Informations de livraison :</span>
                      <strong className="text-[#050508] block">{selectedOrder.customer.fullName}</strong>
                      <span className="text-slate-600 block">{selectedOrder.customer.phone}</span>
                      <span className="text-slate-600 block">{selectedOrder.customer.city}, {selectedOrder.customer.address}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Paiement & Notes :</span>
                      <strong className="text-[#050508] block">{selectedOrder.paymentMethodLabel}</strong>
                      {selectedOrder.customer.note && (
                        <span className="text-slate-500 block italic mt-1">« {selectedOrder.customer.note} »</span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Articles commandés</h4>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" />
                          <div>
                            <span className="font-bold text-[#050508] block">{item.name}</span>
                            <span className="text-slate-500">Qté : {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-black text-[#050508]">
                          {formatPrice(item.price * item.quantity, settings.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total :</span>
                      <span className="font-bold text-[#050508]">{formatPrice(selectedOrder.subtotal, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Frais de livraison :</span>
                      <span className="font-bold text-[#050508]">{formatPrice(selectedOrder.deliveryFee, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#050508] pt-2 border-t border-slate-200">
                      <span>Total à payer :</span>
                      <span className="text-[#5433eb]">{formatPrice(selectedOrder.total, settings.currency)}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="rounded-[28px] p-12 bg-white border border-slate-200 text-center text-slate-500">
                  Sélectionnez une commande pour afficher les détails.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="p-12 rounded-[28px] bg-white border border-slate-200 text-center max-w-md mx-auto">
                <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#050508] mb-1">Aucun coup de cœur pour l'instant</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Ajoutez vos articles préférés en cliquant sur le cœur pour les retrouver rapidement plus tard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-[28px] bg-white border border-slate-200/90 shadow-sm space-y-3"
                  >
                    <div className="relative aspect-square rounded-[22px] overflow-hidden bg-slate-50">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => onToggleWishlist(p.id)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-rose-50 text-rose-500 shadow-xs border border-rose-200 cursor-pointer"
                        title="Retirer des favoris"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#5433eb] uppercase font-bold">{p.categoryLabel}</span>
                      <h4 className="text-sm font-bold text-[#050508] truncate">{p.name}</h4>
                      <div className="text-sm font-black text-[#050508] mt-1">
                        {formatPrice(p.price, settings.currency)}
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(p)}
                      className="w-full py-2.5 px-3 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
