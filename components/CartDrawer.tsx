
import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const simulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-neutral-950/95 border-l border-amber-500/10 transform transition-transform duration-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-royal gold-gradient uppercase tracking-widest">Treasury</h2>
            <button onClick={onClose} className="text-amber-500 p-2">✕</button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-4 no-scrollbar">
            {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <p className="font-royal text-sm gold-gradient animate-pulse">Consulting the Royal Mint...</p>
               </div>
            ) : isSuccess ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4 text-center animate-text-reveal">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-royal text-xl text-white">Granted</h3>
                  <p className="text-[10px] text-amber-500/60 leading-relaxed uppercase tracking-widest">The wardrobe has been updated.</p>
               </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <p className="uppercase tracking-[0.5em] text-[8px]">Selection is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-3 p-2 bg-white/5 rounded-2xl border border-white/5">
                  <img src={item.image} className="w-16 h-20 object-cover rounded-xl" />
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex justify-between text-[10px] font-bold text-white mb-1">
                      <span className="truncate w-32">{item.name}</span>
                      <button onClick={() => onRemove(item.id)} className="text-gray-600">✕</button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                       <div className="flex items-center space-x-3 bg-black/20 px-2 py-1 rounded-full text-[9px]">
                         <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                         <span>{item.quantity}</span>
                         <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                       </div>
                       <span className="text-[10px] text-amber-400 font-bold">Rs.{ (item.price * item.quantity).toLocaleString() }</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isProcessing && !isSuccess && items.length > 0 && (
            <div className="pt-6 border-t border-amber-500/10 space-y-4">
              <div className="flex justify-between text-[10px] uppercase text-amber-500/50">
                <span>Imperial Total</span>
                <span className="text-amber-400 font-bold">Rs. {total.toLocaleString()}</span>
              </div>
              <button 
                onClick={simulatePayment}
                className="w-full bg-amber-500 text-black py-4 rounded-full text-[9px] uppercase font-bold tracking-[0.3em] shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Execute Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
