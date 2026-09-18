import React from 'react';
import { Home, LayoutGrid, Radio, Library, Search } from 'lucide-react';
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
}) => {
  const isBeranda = currentTab === 'home' || currentTab === 'listen-now';
  const isBaru = currentTab === 'explore' || currentTab === 'browse';
  const isRadio = currentTab === 'radio';
  const isPerpustakaan =
    currentTab === 'playlists' ||
    currentTab === 'albums' ||
    currentTab === 'tracks' ||
    currentTab === 'favorites' ||
    currentTab === 'artists' ||
    currentTab === 'history';
  const isCari = currentTab === 'search';

  return (
    <nav
      id="apple-music-bottom-dock"
      aria-label="Navigasi Bawah Layar HP Apple Music"
      className="md:hidden fixed bottom-2.5 inset-x-3 sm:inset-x-6 max-w-md mx-auto h-[62px] bg-[#1c1c1e]/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-40 px-2 flex items-center justify-between select-none"
    >
      {/* 1. Beranda */}
      <button
        id="mobile-tab-beranda"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-full transition active:scale-95 ${
          isBeranda
            ? 'text-[#fa2d48] bg-white/10'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Beranda</span>
      </button>

      {/* 2. Baru (Active tab in screenshot with 4-square icon) */}
      <button
        id="mobile-tab-baru"
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-full transition active:scale-95 ${
          isBaru
            ? 'text-[#fa2d48] bg-white/10'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Baru</span>
      </button>

      {/* 3. Radio */}
      <button
        id="mobile-tab-radio"
        onClick={() => onSelectTab('radio')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-full transition active:scale-95 ${
          isRadio
            ? 'text-[#fa2d48] bg-white/10'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Radio className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Radio</span>
      </button>

      {/* 4. Perpustakaan */}
      <button
        id="mobile-tab-perpustakaan"
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-full transition active:scale-95 ${
          isPerpustakaan
            ? 'text-[#fa2d48] bg-white/10'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Library className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Perpustakaan</span>
      </button>

      {/* 5. Cari (Distinctive circular pill on right like screenshot) */}
      <button
        id="mobile-tab-cari"
        onClick={() => onSelectTab('search')}
        className={`flex items-center justify-center w-11 h-11 rounded-full transition active:scale-95 ${
          isCari
            ? 'bg-[#fa2d48] text-white shadow-md'
            : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
        }`}
        aria-label="Cari Musik"
      >
        <Search className="w-5 h-5 stroke-[2.2]" />
      </button>
    </nav>
  );
};
