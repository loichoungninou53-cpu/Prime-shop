import React from 'react';
import { Zap, ShieldCheck, PackageCheck, MessageCircleHeart } from 'lucide-react';

export const ReassuranceSection: React.FC = () => {
  const points = [
    {
      icon: Zap,
      title: 'Zéro Paperasse en 1 Clic',
      description: 'Commandez directement sans créer de compte compliqué.',
      color: 'text-amber-500',
      bgIcon: 'bg-amber-50',
    },
    {
      icon: ShieldCheck,
      title: 'Paiement à la Livraison',
      description: 'Vérifiez votre colis avant de régler en espèces ou Mobile Money.',
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-50',
    },
    {
      icon: PackageCheck,
      title: 'Expédition Express 24h',
      description: 'Livraison express à Cotonou, Calavi, Porto-Novo et tout le Bénin.',
      color: 'text-[#5433eb]',
      bgIcon: 'bg-[#ece7ff]',
    },
    {
      icon: MessageCircleHeart,
      title: 'Service Client 7j/7',
      description: 'Une équipe attentive prête à répondre sur WhatsApp en 2 minutes.',
      color: 'text-blue-600',
      bgIcon: 'bg-blue-50',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <span>ENGAGEMENTS & CONFIANCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#050508] tracking-tight">
            Pourquoi choisir Prime Shop ?
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Une expérience fluide, sécurisée et rapide pensée pour votre confort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div
                key={i}
                className="relative rounded-[28px] p-6 bg-[#f8f9fa] border border-slate-200/90 hover:border-[#5433eb]/40 shadow-xs hover:shadow-xl hover:shadow-[#5433eb]/10 transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${pt.bgIcon} flex items-center justify-center mb-4 ${pt.color} group-hover:scale-110 transition-transform shadow-xs`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#050508] mb-2 group-hover:text-[#5433eb] transition-colors">
                  {pt.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {pt.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
