
import React, { memo } from 'react';
import { MediaCategory, SortOption } from '../types';
import { ArrowUpDown } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  selectedCategory: MediaCategory;
  onCategoryChange: (category: MediaCategory) => void;
  availableCategories: MediaCategory[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const Header: React.FC<HeaderProps> = memo(({ itemCount, selectedCategory, onCategoryChange, availableCategories, selectedTag, onTagChange, availableTags, sortBy, onSortChange }) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'alphabet-asc', label: 'A → Z' },
    { value: 'alphabet-desc', label: 'Z → A' },
    { value: 'date-desc', label: 'Mới nhất' },
    { value: 'date-asc', label: 'Cũ nhất' },
    { value: 'views-desc', label: 'Nhiều view' },
    { value: 'views-asc', label: 'Ít view' },
  ];

  return (
    <div className="px-6 py-4 border-b border-white/5 space-y-3">
      <div className="flex items-center justify-between overflow-x-auto">
        <div className="flex gap-2 flex-nowrap">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">{itemCount} items</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          <span className="text-xs uppercase tracking-wide text-gray-500">Tags:</span>
          <button
            onClick={() => onTagChange('All')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
              selectedTag === 'All' ? 'bg-red-600 text-white' : 'text-gray-300 bg-white/5 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedTag === tag ? 'bg-red-600 text-white' : 'text-gray-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              #{tag}
            </button>
          ))}
          {availableTags.length === 0 && (
            <span className="text-xs text-gray-500">Không có tag</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-white/5 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
