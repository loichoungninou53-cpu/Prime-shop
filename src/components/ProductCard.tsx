import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/storage';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  currency: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  currency,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleCardClick = () => {
    soundFX.playPop();
    onSelect(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playPop();
    onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      soundFX.playAddToCart();
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-[28px] p-4 bg-white border border-slate-200/90 hover:border-[#5433eb]/40 shadow-sm hover:shadow-xl hover:shadow-[#5433eb]/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square rounded-[22px] overflow-hidden bg-slate-50 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-[10px] font-black text-[#5433eb] tracking-wide shadow-xs">
          {product.categoryLabel}
        </span>

        {/* Discount Badge */}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wide shadow-xs">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition shadow-xs cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 border-rose-200'
              : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white border-slate-200'
          }`}
          title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#050508] text-xs font-bold border border-slate-200 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#5433eb]" /> Voir détails
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Rating & Stock */}
          <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold text-[#050508]">{product.rating}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
            
            {/* Stock status indicator */}
            <span className="ml-auto text-[10px] font-semibold flex items-center gap-1">
              {isOutOfStock ? (
                <span className="text-rose-600">🔴 Rupture</span>
              ) : isLowStock ? (
                <span className="text-amber-600">🟠 Stock : {product.stock}</span>
              ) : (
                <span className="text-emerald-600">🟢 En stock</span>
              )}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-extrabold text-[#050508] group-hover:text-[#5433eb] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-[#050508] tracking-tight">
              {formatPrice(product.price, currency)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.oldPrice, currency)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-full transition shadow-xs flex items-center justify-center cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#5433eb] hover:bg-[#4323d8] text-white hover:scale-105 active:scale-95 shadow-[#5433eb]/20'
            }`}
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
