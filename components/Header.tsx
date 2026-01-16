
import React from 'react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-12 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 border-2 border-amber-500 rounded-full flex items-center justify-center transform rotate-45 hover:rotate-180 transition-transform duration-700">
          <span className="text-amber-500 font-bold -rotate-45">S</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-royal tracking-widest gold-gradient font-bold uppercase">
          Shani Fashion
        </h1>
      </div>

      <nav className="hidden md:flex space-x-8 text-sm uppercase tracking-widest text-amber-500/70">
        <a href="#" className="hover:text-amber-500 transition-colors">Collection</a>
        <a href="#" className="hover:text-amber-500 transition-colors">Heritage</a>
        <a href="#" className="hover:text-amber-500 transition-colors">Bespoke</a>
        <a href="#" className="hover:text-amber-500 transition-colors">Concierge</a>
      </nav>

      <div className="flex items-center space-x-6">
        <button className="relative group p-2">
          <svg className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button 
          onClick={onOpenCart}
          className="relative group p-2 border border-amber-500/30 rounded-full hover:border-amber-500 transition-colors"
        >
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
