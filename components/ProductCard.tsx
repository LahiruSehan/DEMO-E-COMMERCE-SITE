
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onSelect: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      className="royal-card glass-royal group flex flex-col h-full border border-amber-500/10 hover:border-amber-500/40 transform hover:-translate-y-1 cursor-pointer shadow-lg transition-all rounded-[2.5rem]"
    >
      <div className="relative overflow-hidden rounded-t-[2.5rem]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-auto object-cover transition-all duration-1000 group-hover:scale-105"
          loading="lazy"
        />
        <div className="shimmer-sweep" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-amber-500 text-black py-2 rounded-full uppercase tracking-widest text-[8px] font-bold shadow-xl active:scale-95"
          >
            Selection
          </button>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-[10px] md:text-xs font-bold text-white/80 tracking-widest uppercase">
            {product.name}
          </h3>
          <span className="text-amber-500 font-bold text-[9px] md:text-[11px] tracking-tight">
            Rs. {product.price.toLocaleString()}
          </span>
        </div>
        <div className="mt-auto pt-3 border-t border-amber-500/5 flex justify-between items-center text-[7px] uppercase tracking-widest text-amber-500/20">
          <span>{product.category}</span>
          <span className="text-amber-500/40">{product.rating} ★</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
