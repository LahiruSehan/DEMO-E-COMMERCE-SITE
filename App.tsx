
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ParticleTrail from './components/ParticleTrail';
import ProductCard from './components/ProductCard';
import FilterBar from './components/FilterBar';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import AIStylist from './components/AIStylist';
import { PRODUCTS } from './constants';
import { Product, CartItem, FilterState, Category, AgeGroup } from './types';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    ageGroup: 'All',
    minPrice: 0,
    maxPrice: 10000000,
  });

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCategory = filters.category === 'All' || p.category === filters.category;
      const matchAge = filters.ageGroup === 'All' || p.ageGroup === filters.ageGroup;
      return matchCategory && matchAge;
    });
  }, [filters]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleAIComplete = (aiFilters: { category: string; ageGroup: string }) => {
    setFilters(prev => ({
      ...prev,
      category: aiFilters.category as Category,
      ageGroup: aiFilters.ageGroup as AgeGroup
    }));
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#050505] selection:bg-amber-500/30">
      <ParticleTrail />
      
      <Header 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      <div className="bg-amber-500/5 py-1.5 border-y border-amber-500/10 overflow-hidden">
        <div className="animate-marquee-slow whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-[7px] md:text-[8px] uppercase tracking-[1em] text-amber-500/30 px-12">
              SHANI FASHION &bull; ROYAL HERITAGE &bull; IMPERIAL ATELIER &bull; LUXURY REDEFINED
            </span>
          ))}
        </div>
      </div>

      <main className="flex-grow">
        <section className="relative h-[45vh] md:h-[70vh] overflow-hidden flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#050505]" />
          
          <div className="relative text-center z-10 px-6 max-w-5xl">
            <h2 className="text-7xl md:text-[15rem] font-royal leading-none tracking-tighter mb-2 magical-text">
              SHANI
            </h2>
            <div className="animate-text-reveal">
              <p className="text-white text-[10px] md:text-sm font-bold tracking-[0.5em] uppercase mb-4 opacity-90">
                DEMO CLOTHING STORE WEBSITE
              </p>
              <div className="w-12 h-px bg-amber-500/50 mx-auto mb-4" />
              <p className="text-gray-500 text-[8px] md:text-[10px] tracking-[0.8em] uppercase font-light">
                Curated Sovereignty
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <FilterBar filters={filters} onFilterChange={setFilters} />

          <div className="masonry-grid py-12">
            {filteredProducts.map(product => (
              <div key={product.id} className="masonry-item">
                <ProductCard 
                  product={product} 
                  onAddToCart={addToCart} 
                  onSelect={setSelectedProduct}
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24 glass-royal rounded-[3rem] p-8">
              <p className="text-amber-500/30 font-royal italic text-xs">Nothing matches your search.</p>
              <button 
                onClick={() => setFilters({ ...filters, category: 'All', ageGroup: 'All' })}
                className="mt-4 text-[9px] uppercase text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full"
              >
                Reset
              </button>
            </div>
          )}
        </section>
      </main>

      <AIStylist onComplete={handleAIComplete} />

      <footer className="bg-black py-16 text-center border-t border-amber-500/5">
        <div className="container mx-auto px-6 space-y-4">
          <h2 className="text-lg font-royal gold-gradient uppercase tracking-widest">SHANI ATELIER</h2>
          <p className="text-[7px] text-gray-700 tracking-[0.4em]">&copy; MMXXIV SHANI FASHION. ALL TRANSACTIONS SIMULATED.</p>
        </div>
      </footer>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={(id) => setCart(c => c.filter(i => i.id !== id))}
        onUpdateQty={(id, delta) => setCart(c => c.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
      />
    </div>
  );
};

export default App;
