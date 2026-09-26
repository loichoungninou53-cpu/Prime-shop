import React from 'react';
import { 
  Smartphone, 
  Headphones, 
  Sparkles, 
  Flame, 
  ShoppingBag, 
  ArrowUpRight 
} from 'lucide-react';
import { CategoryId } from '../types';

interface CategoriesSectionProps {
  onSelectCategory: (cat: CategoryId) => void;
  productCounts: Record<string, number>;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  productCounts,
}) => {
  const categories = [
    {
      id: 'electronique' as CategoryId,
      number: '01',
      title: 'Électronique',
      subtitle: 'Smartphones, montres, audio & gadgets connectés.',
      icon: Smartphone,
      count: productCounts['electronique'] || 4,
      iconBg: 'bg-[#ece7ff]',
      iconColor: 'text-[#5433eb]',
    },
    {
      id: 'accessoires' as CategoryId,
      number: '02',
      title: 'Accessoires',
      subtitle: 'Chargeurs GaN, câbles 100W & protections.',
      icon: Headphones,
      count: productCounts['accessoires'] || 2,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'quotidien' as CategoryId,
      number: '03',
      title: 'Produits du quotidien',
      subtitle: 'Lifestyle intelligent, lampes & indispensables.',
      icon: ShoppingBag,
      count: productCounts['quotidien'] || 3,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'nouveautes' as CategoryId,
      number: '04',
      title: 'Nouveautés',
      subtitle: 'Les dernières sorties et tendances 2026.',
      icon: Sparkles,
      count: productCounts['nouveautes'] || 2,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'populaires' as CategoryId,
      number: '05',
      title: 'Populaires',
      subtitle: 'Les coups de cœur recommandés par nos clients.',
      icon: Flame,
      count: productCounts['populaires'] || 4,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-[#f2f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLECTIONS PRIME SHOP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#050508] tracking-tight">
            Explorez par catégorie
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Une organisation fluide pour trouver exactement ce dont vous avez besoin en un instant.
          </p>
        </div>

        {/* Category Cards Grid: White Marble Cards, 28px Radius */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative rounded-[28px] p-6 bg-white border border-slate-200/90 hover:border-[#5433eb]/40 shadow-sm hover:shadow-xl hover:shadow-[#5433eb]/10 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top row: Number and Arrow icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-400 group-hover:text-[#5433eb] transition-colors">
                      {cat.number}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#5433eb] group-hover:text-white text-slate-500 flex items-center justify-center transition-all duration-300 shadow-xs">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 shadow-xs`}>
                    <Icon className={`w-7 h-7 ${cat.iconColor}`} />
                  </div>

                  {/* Title & description */}
                  <h3 className="text-lg font-black text-[#050508] group-hover:text-[#5433eb] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Bottom items count */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">{cat.count} produits</span>
                  <span className="font-bold text-[#5433eb] group-hover:underline">Voir tout →</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
