import React, { useRef } from 'react';
import { Search, X, Globe, Sparkles, Menu, Music2 } from 'lucide-react';
import { ViewTab } from '../types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  currentTab: ViewTab;
  onOpenSearchTab: () => void;
  onToggleMobileMenu?: () => void;
}

export const REGIONS = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'US', name: 'Global/US', flag: '🇺🇸' },
  { code: 'KR', name: 'Korea', flag: '🇰🇷' },
  { code: 'JP', name: 'Jepang', flag: '🇯🇵' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
];

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  currentTab,
  onOpenSearchTab,
  onToggleMobileMenu,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSearchChange(val);
    if (currentTab !== 'search' && val.length > 0) {
      onOpenSearchTab();
    }
  };

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <header
      id="apple-music-topbar"
      className="h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 bg-[#121216]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20 shrink-0"
    >
      {/* Mobile Drawer Hamburger & Brand Icon (< md) */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          id="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
          aria-label="Buka Menu Navigasi"
          title="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#fa243c] to-[#ff4762] flex items-center justify-center shadow-md shadow-[#fa243c]/30 cursor-pointer"
          onClick={onToggleMobileMenu}
        >
          <Music2 className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Real-time Search Input Box */}
      <div className="flex-1 max-w-md relative min-w-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (currentTab !== 'search' && searchQuery) onOpenSearchTab();
            }}
            placeholder="Cari lagu, artis, lirik..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/7 border border-white/10 focus:border-[#fa243c] focus:bg-white/10 focus:outline-none text-xs sm:text-sm text-white placeholder:text-white/40 transition duration-200"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={handleClear}
              className="absolute right-2.5 p-1 text-white/40 hover:text-white rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls: Region selector and Apple-style pill indicator */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Region selector for trending */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80">
          <Globe className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <span className="text-white/40 text-[11px] uppercase tracking-wider hidden lg:inline">
            Trending:
          </span>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code} className="bg-[#1c1c22] text-white">
                {r.flag} {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Hi-Res Lossless Apple badge (Desktop large screens) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-[#fa243c]/20 text-[11px] font-semibold text-[#fa243c]">
          <Sparkles className="w-3 h-3" />
          <span>Lossless Audio</span>
        </div>
      </div>
    </header>
  );
};
