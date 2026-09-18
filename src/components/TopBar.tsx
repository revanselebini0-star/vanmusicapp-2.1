import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Settings,
  Menu,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { UserProfile, ViewTab } from '../types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  currentTab: ViewTab;
  onOpenSearchTab: () => void;
  onToggleMobileMenu?: () => void;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
}

export const REGIONS = [
  { code: 'ID', name: 'ID', flag: '🇮🇩' },
  { code: 'US', name: 'US', flag: '🇺🇸' },
  { code: 'KR', name: 'KR', flag: '🇰🇷' },
  { code: 'JP', name: 'JP', flag: '🇯🇵' },
  { code: 'GB', name: 'GB', flag: '🇬🇧' },
];

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  currentTab,
  onOpenSearchTab,
  onToggleMobileMenu,
  user = null,
  onOpenAuthModal,
  onNavigateBack,
  onNavigateForward,
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
      id="tidal-topbar"
      className="hidden md:flex h-16 px-4 sm:px-8 items-center justify-between gap-4 bg-[#000000] border-b border-white/5 sticky top-0 z-20 shrink-0 select-none"
    >
      {/* Left: Mobile menu button or History Navigation Arrows (< >) */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-full hover:bg-white/10 text-white/70 active:scale-95 transition"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop History Arrows: < and > */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              if (onNavigateBack) onNavigateBack();
              else window.history.back();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
            title="Kembali"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (onNavigateForward) onNavigateForward();
              else window.history.forward();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
            title="Maju"
            aria-label="Maju"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Controls: Search pill + Settings / Profile */}
      <div className="flex items-center gap-3">
        {/* Tidal Search Pill */}
        <div className="relative flex items-center w-48 sm:w-64 md:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            id="tidal-search-input"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (currentTab !== 'search' && searchQuery) onOpenSearchTab();
            }}
            placeholder="Search"
            className="w-full pl-10 pr-8 py-1.5 rounded-full bg-[#18181d] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:bg-[#202026] focus:outline-none text-xs sm:text-sm text-white placeholder:text-white/40 transition duration-200"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 p-1 text-white/40 hover:text-white rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region selector (compact) */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <Globe className="w-3 h-3 text-white/40" />
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code} className="bg-[#18181d] text-white">
                {r.flag} {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Settings / Google Profile Button (Circle in top-right) */}
        {user ? (
          <button
            onClick={onOpenAuthModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-white/10 active:scale-95 group relative"
            title={`Akun: ${user.name}`}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-black" />
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition border border-white/10 active:scale-95"
            title="Pengaturan & Masuk Akun"
            aria-label="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
