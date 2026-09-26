import React from 'react';
import { ArrowRight, Sparkles, PhoneCall } from 'lucide-react';

interface FinalCTAProps {
  onDiscoverClick: () => void;
  whatsappNumber?: string;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onDiscoverClick, whatsappNumber = '22990000000' }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#f2f4f5]">
      {/* Subtle violet ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#5433eb]/10 via-[#a78bfa]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="rounded-[28px] p-8 sm:p-14 bg-white border border-slate-200/90 shadow-xl shadow-[#5433eb]/5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-bold tracking-wider uppercase mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRIME SHOP EXPÉRIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#050508] tracking-tight leading-tight max-w-2xl mx-auto">
            Votre prochain coup de cœur vous attend.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Explorez notre catalogue exclusif ou échangez directement avec nous sur WhatsApp pour une commande sur-mesure livrée sous 24h.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onDiscoverClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#5433eb]/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>DÉCOUVRIR LE CATALOGUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour Prime Shop, je souhaite passer commande !")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>COMMANDER SUR WHATSAPP</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
