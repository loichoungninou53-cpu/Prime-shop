import React, { useState, useMemo } from 'react';
import { Product, CategoryId } from '../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Sparkles, X, Check } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  initialCategory?: string;
  currency: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  initialCategory = 'all',
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>((initialCategory as CategoryId) || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categories = [
    { id: 'all' as CategoryId, label: 'Tous les produits' },
    { id: 'electronique' as CategoryId, label: 'Électronique' },
    { id: 'accessoires' as CategoryId, label: 'Accessoires' },
    { id: 'quotidien' as CategoryId, label: 'Produits du quotidien' },
    { id: 'nouveautes' as CategoryId, label: 'Nouveautés' },
    { id: 'populaires' as CategoryId, label: 'Populaires' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory === 'populaires') {
        if (!item.isPopular) return false;
      } else if (selectedCategory === 'nouveautes') {
        if (!item.isNew && item.category !== 'nouveautes') return false;
      } else if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false;
      }

      // Stock filter
      if (onlyInStock && item.stock <= 0) return false;

      // Price filter
      if (item.price > maxPrice) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description ? item.description.toLowerCase().includes(query) : false;
        const matchCat = item.categoryLabel ? item.categoryLabel.toLowerCase().includes(query) : false;
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, onlyInStock, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setOnlyInStock(false);
    setMaxPrice(1000000);
  };

  return (
    <div className="min-h-screen py-8 pb-24 bg-[#f2f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ece7ff] border border-[#5433eb]/20 text-[#5433eb] text-xs font-bold tracking-wider uppercase mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CATALOGUE OFFICIEL PRIME SHOP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#050508] tracking-tight">
            La Boutique Prime Shop
          </h1>
          <p className="mt-1 text-slate-600 text-sm sm:text-base font-medium">
            Parcourez notre collection exclusive avec livraison rapide à Cotonou et paiement sécurisé à la réception.
          </p>
        </div>

        {/* Search & Mobile Filter Trigger Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un smartphone, des écouteurs, une montre..."
              className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border border-slate-200/90 text-[#050508] placeholder-slate-400 focus:outline-none focus:border-[#5433eb] focus:ring-1 focus:ring-[#5433eb] shadow-xs transition text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3.5 rounded-full bg-white border border-slate-200/90 text-[#050508] text-sm focus:outline-none focus:border-[#5433eb] shadow-xs cursor-pointer font-medium"
            >
              <option value="featured">✨ En vedette</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
              <option value="newest">Plus récents</option>
              <option value="name">Nom (A - Z)</option>
            </select>

            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden px-4 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-black text-sm font-semibold flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#5433eb]" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar: 9999px pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#5433eb] text-white shadow-md shadow-[#5433eb]/25'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Main Layout: Filters Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <aside className={`lg:block ${showFiltersMobile ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="sticky top-28 rounded-[28px] p-6 bg-white border border-slate-200/90 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-[#050508] text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#5433eb]" /> Filtres rapides
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#5433eb] hover:underline font-bold cursor-pointer"
                >
                  Réinitialiser
                </button>
              </div>

              {/* In stock toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5433eb] focus:ring-[#5433eb] border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#5433eb] transition">
                    Produits en stock uniquement
                  </span>
                </label>
              </div>

              {/* Price range filter */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                  <span>Prix maximum</span>
                  <span className="font-bold text-[#5433eb]">
                    {maxPrice.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#5433eb] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 000 FCFA</span>
                  <span>1 000 000 FCFA</span>
                </div>
              </div>

              {/* Quick reassure box */}
              <div className="p-4 rounded-2xl bg-[#ece7ff]/50 border border-[#5433eb]/20 text-xs text-slate-700 space-y-1.5">
                <div className="font-extrabold text-[#5433eb] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Commande simple & rapide
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Commandez en 1 clic sans formalités ou finalisez directement avec un conseiller par WhatsApp.
                </p>
              </div>

            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            
            {/* Products count header */}
            <div className="flex items-center justify-between mb-5 text-xs text-slate-500 font-medium">
              <span>
                Affichage de <strong className="text-[#050508]">{filteredProducts.length}</strong> produit(s)
              </span>
              {(searchQuery || selectedCategory !== 'all' || onlyInStock || maxPrice < 1000000) && (
                <button
                  onClick={resetFilters}
                  className="text-[#5433eb] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <X className="w-3 h-3" /> Effacer les filtres
                </button>
              )}
            </div>

            {/* Grid: White Marble Cards with Shop Violet accents */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    currency={currency}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-[28px] bg-white border border-slate-200/80 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#050508] mb-1">Aucun produit ne correspond à vos critères</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  Modifiez votre recherche ou réinitialisez les filtres pour découvrir tout le catalogue.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
