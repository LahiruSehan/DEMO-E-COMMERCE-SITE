
import React from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass-royal max-w-2xl w-full max-h-[85vh] overflow-hidden relative flex flex-col md:flex-row rounded-[3rem] shadow-2xl border-amber-500/20 animate-text-reveal">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-black/50 p-3 rounded-full text-amber-500 hover:scale-110 transition-transform">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-t-none">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <span className="text-amber-500 uppercase tracking-[0.5em] text-[8px] font-bold">{product.category}</span>
            <h2 className="text-4xl font-royal gold-gradient">{product.name}</h2>
          </div>
          
          <p className="text-gray-400 text-[10px] leading-relaxed italic tracking-wider">
            Identity: {product.name} &bull; Limited Release &bull; {product.description}
          </p>

          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-baseline border-b border-amber-500/10 pb-4">
              <span className="text-3xl font-bold text-amber-400">Rs. {product.price.toLocaleString()}</span>
              <span className="text-[8px] text-gray-600 uppercase tracking-widest">LKR Valuation</span>
            </div>
            
            <button 
              onClick={() => { onAddToCart(product); onClose(); }}
              className="w-full bg-amber-500 text-black py-5 rounded-full uppercase tracking-[0.4em] font-bold text-[9px] shadow-2xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              Add to Wardrobe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
