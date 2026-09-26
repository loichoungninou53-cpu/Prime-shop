import React from 'react';
import { X, Sparkles, CheckCircle, Globe, Database, ShieldCheck, PhoneCall, Zap, HelpCircle } from 'lucide-react';

interface FreeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeGuideModal: React.FC<FreeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-[28px] bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ece7ff] text-[#5433eb] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#050508]">Guide Gratuit : Hébergement & Base de Données (0 FCFA)</h2>
              <p className="text-[11px] text-slate-500">Tout ce que vous devez savoir pour faire tourner Prime Shop sans abonnement mensuel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          
          {/* Section 1: Pourquoi 0 abonnement ? */}
          <div className="p-5 rounded-[22px] bg-[#ece7ff]/50 border border-[#5433eb]/20 space-y-2">
            <h3 className="text-sm font-black text-[#5433eb] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5433eb]" />
              1. Pourquoi vous ne paierez aucun abonnement mensuel ?
            </h3>
            <p>
              Sur Shopify ou d'autres plateformes SaaS, vous devez payer entre <strong>20 000 FCFA et 50 000 FCFA chaque mois</strong>, même si vous ne réalisez aucune vente.
            </p>
            <p>
              Avec <strong>Prime Shop</strong>, l'application est votre propriété personnelle. Vous pouvez l'héberger gratuitement à vie sur les meilleures infrastructures mondiales sans jamais débourser 1 centime d'abonnement.
            </p>
          </div>

          {/* Section 2: Hébergeur Gratuit */}
          <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#050508] flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              2. Quel hébergeur gratuit utiliser ? (Vercel ou Netlify)
            </h3>
            <p>
              <strong>Vercel</strong> et <strong>Netlify</strong> offrent tous les deux un plan « Hobby / Starter » <strong>100% gratuit à vie</strong> :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Certificat SSL HTTPS sécurisé gratuit automatique (cadenas vert 🔒).</li>
              <li>Bande passante ultra-rapide (jusqu'à 100 Go de trafic mensuel gratuit, suffisant pour plus de 50 000 visites par mois).</li>
              <li>Lien gratuit personnalisé en <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[#5433eb] font-bold">primeshop.vercel.app</code> ou possibilité de relier votre propre nom de domaine (<code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[#5433eb] font-bold">primeshop.bj</code>).</li>
            </ul>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-[11px] text-emerald-700">
              ➜ Pour déployer : Déposez le dossier de code sur GitHub puis connectez GitHub à Vercel.com en 1 clic !
            </div>
          </div>

          {/* Section 3: Base de données gratuite */}
          <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#050508] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#5433eb]" />
              3. Comment fonctionne la base de données ?
            </h3>
            <p>
              Votre boutique dispose d'une architecture à double niveau :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <strong className="text-[#050508] block mb-1">Niveau 1 : Stockage Local & Sauvegarde JSON</strong>
                <p className="text-[11px] text-slate-500">
                  Tous vos produits, commandes et paramètres sont sauvegardés automatiquement sur le navigateur de gestion. Vous pouvez exporter vos données en 1 clic dans l'onglet Paramètres.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <strong className="text-[#050508] block mb-1">Niveau 2 : Supabase Cloud (PostgreSQL 100% Gratuit)</strong>
                <p className="text-[11px] text-slate-500">
                  Créez un compte gratuit sur <strong>supabase.com</strong>. Récupérez l'URL et la clé API publique, puis collez-les dans les paramètres. Supabase fournit 500 Mo de base de données PostgreSQL gratuite !
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: WhatsApp E-Commerce */}
          <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#050508] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              4. Pourquoi WhatsApp est le canal N°1 au Bénin ?
            </h3>
            <p>
              En Afrique de l'Ouest, les clients préfèrent vérifier la disponibilité et discuter avec un être humain avant de payer à la réception.
            </p>
            <p>
              Le système <strong>1-Clic WhatsApp</strong> de Prime Shop pré-remplit automatiquement le nom du produit, le prix et les coordonnées du client pour une commande validée en moins de 2 minutes sans friction.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#f8f9fa] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>

      </div>
    </div>
  );
};
