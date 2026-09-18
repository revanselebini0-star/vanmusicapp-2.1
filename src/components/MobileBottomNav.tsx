import React from 'react';
import { Flame, Compass, Search, Heart, ListMusic } from 'lucide-react';
import { ViewTab } from '../types';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenLibraryMenu: () => void;
  favoriteCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenLibraryMenu,
  favoriteCount,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navigasi Bawah Melayang Layar Hp"
      className="md:hidden fixed bottom-3.5 inset-x-3 sm:inset-x-8 max-w-md mx-auto h-16 bg-[#16161f]/85 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-40 px-2 sm:px-3 flex items-center justify-around select-none ring-1 ring-black/30"
    >
      {/* 1. Dengarkan Sekarang */}
      <button
        id="mobile-tab-listen-now"
        onClick={() => onSelectTab('listen-now')}
        className={`flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-1 px-2.5 rounded-full transition active:scale-95 ${
          currentTab === 'listen-now'
            ? 'text-[#fa243c] bg-white/10'
            : 'text-white/55 hover:text-white hover:bg-white/5'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Dengarkan</span>
      </button>

      {/* 2. Telusuri Trending */}
      <button
        id="mobile-tab-browse"
        onClick={() => onSelectTab('browse')}
        className={`flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-1 px-2.5 rounded-full transition active:scale-95 ${
          currentTab === 'browse'
            ? 'text-[#fa243c] bg-white/10'
            : 'text-white/55 hover:text-white hover:bg-white/5'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Telusuri</span>
      </button>

      {/* 3. Pencarian Lagu */}
      <button
        id="mobile-tab-search"
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-1 px-2.5 rounded-full transition active:scale-95 ${
          currentTab === 'search'
            ? 'text-[#fa243c] bg-white/10'
            : 'text-white/55 hover:text-white hover:bg-white/5'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Cari</span>
      </button>

      {/* 4. Favorit */}
      <button
        id="mobile-tab-favorites"
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-1 px-2.5 rounded-full relative transition active:scale-95 ${
          currentTab === 'favorites'
            ? 'text-[#fa243c] bg-white/10'
            : 'text-white/55 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5" fill={currentTab === 'favorites' ? '#fa243c' : 'none'} />
          {favoriteCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-[#fa243c] text-white">
              {favoriteCount > 99 ? '99+' : favoriteCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Favorit</span>
      </button>

      {/* 5. Koleksi & Playlist Drawer */}
      <button
        id="mobile-tab-library"
        onClick={onOpenLibraryMenu}
        className="flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-1 px-2.5 rounded-full text-white/55 hover:text-white hover:bg-white/5 active:scale-95 transition"
      >
        <ListMusic className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Koleksi</span>
      </button>
    </nav>
  );
};
