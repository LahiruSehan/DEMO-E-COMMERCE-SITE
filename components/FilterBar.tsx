
import React from 'react';
import { Category, FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const categories = ['All', ...Object.values(Category)];

  return (
    <div className="sticky top-[64px] z-40 w-full glass-royal py-2.5 px-4 rounded-full border border-amber-500/10">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange({ ...filters, category: cat as Category | 'All' })}
            className={`px-4 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.2em] rounded-full border transition-all flex-shrink-0 ${
              filters.category === cat 
              ? 'bg-amber-500 border-amber-500 text-black font-bold' 
              : 'border-white/5 text-white/30 hover:text-amber-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
