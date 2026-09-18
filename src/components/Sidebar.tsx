import React, { useState } from 'react';
import {
  Home,
  Search,
  Compass,
  Heart,
  Clock,
  Plus,
  ListMusic,
  Database,
  Download,
  Upload,
  X,
  Library,
} from 'lucide-react';
import { Playlist, ViewTab } from '../types';
import { db } from '../services/db';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
  onOpenCreatePlaylist: () => void;
  onPlaylistDataChanged: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onPlaylistDataChanged,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handlePlaylistClick = (playlistId: string) => {
    onSelectPlaylist(playlistId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleExport = () => {
    const data = db.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanz-music-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && db.importData(content)) {
        onPlaylistDataChanged();
        alert('Playlist dan data musik berhasil dipulihkan!');
      } else {
        alert('Format file cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const renderContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full gap-2 select-none">
      {/* Top Card: Spotify Brand & Primary Navigation (Beranda, Cari) */}
      <div className={`p-3 sm:p-4 ${isMobileDrawer ? 'bg-transparent' : 'bg-[#121212] rounded-lg'} shrink-0`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-2.5">
            {/* Spotify-styled Vanz Music Logo */}
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center shadow-lg shadow-[#1ed760]/30 shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.858.207c-2.35-1.436-5.308-1.76-8.793-.963a.625.625 0 01-.28-1.218c3.811-.871 7.086-.499 9.724 1.116a.625.625 0 01.207.858zm1.225-2.724a.782.782 0 01-1.076.257c-2.69-1.654-6.79-2.133-9.97-1.168a.78.78 0 11-.456-1.494c3.635-1.103 8.163-.569 11.245 1.328a.78.78 0 01.257 1.077zm.105-2.835C14.693 8.93 9.387 8.75 6.302 9.687a.936.936 0 11-.544-1.792c3.541-1.076 9.39-.868 13.15 1.362a.938.938 0 01-1.022 1.608z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Vanz Music
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1ed760]/20 text-[#1ed760] font-bold">
                  Premium
                </span>
              </h1>
            </div>
          </div>

          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            id={isMobileDrawer ? 'mobile-drawer-listen-now-btn' : 'nav-listen-now-btn'}
            onClick={() => handleTabClick('listen-now')}
            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-bold transition ${
              currentTab === 'listen-now' && !selectedPlaylistId
                ? 'text-white bg-[#282828]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </button>

          <button
            id={isMobileDrawer ? 'mobile-drawer-search-btn' : 'nav-search-btn'}
            onClick={() => handleTabClick('search')}
            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-bold transition ${
              currentTab === 'search' && !selectedPlaylistId
                ? 'text-white bg-[#282828]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Cari</span>
          </button>
        </nav>
      </div>

      {/* Bottom Card: Koleksi Kamu (Your Library) */}
      <div
        className={`flex-1 flex flex-col min-h-0 p-3 sm:p-4 ${
          isMobileDrawer ? 'bg-transparent' : 'bg-[#121212] rounded-lg'
        }`}
      >
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 pb-3 shrink-0">
          <div className="flex items-center gap-3 text-[#b3b3b3] hover:text-white transition cursor-pointer">
            <Library className="w-5 h-5" />
            <span className="text-sm font-bold">Koleksi Kamu</span>
          </div>

          <button
            id={isMobileDrawer ? 'mobile-drawer-create-playlist-btn' : 'create-playlist-sidebar-btn'}
            onClick={() => {
              onOpenCreatePlaylist();
              if (isMobileDrawer) onCloseMobile?.();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition"
            title="Buat Playlist Baru"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Library Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {/* Liked Songs (Spotify signature purple gradient square with white heart) */}
          <button
            id={isMobileDrawer ? 'mobile-drawer-favorites-btn' : 'nav-favorites-btn'}
            onClick={() => handleTabClick('favorites')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition text-left group ${
              currentTab === 'favorites' && !selectedPlaylistId
                ? 'bg-[#282828] text-white font-semibold'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0 shadow-sm">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">Lagu yang Disukai</p>
              <p className="text-xs text-[#b3b3b3]">Playlist • Disukai</p>
            </div>
          </button>

          {/* Browse / Trending Charts */}
          <button
            id={isMobileDrawer ? 'mobile-drawer-browse-btn' : 'nav-browse-btn'}
            onClick={() => handleTabClick('browse')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition text-left group ${
              currentTab === 'browse' && !selectedPlaylistId
                ? 'bg-[#282828] text-white font-semibold'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0 border border-white/5">
              <Compass className="w-5 h-5 text-[#1ed760]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">Tangga Lagu Trending</p>
              <p className="text-xs text-[#b3b3b3]">Katalog • Global</p>
            </div>
          </button>

          {/* History */}
          <button
            id={isMobileDrawer ? 'mobile-drawer-history-btn' : 'nav-history-btn'}
            onClick={() => handleTabClick('history')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition text-left group ${
              currentTab === 'history' && !selectedPlaylistId
                ? 'bg-[#282828] text-white font-semibold'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0 border border-white/5">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">Riwayat Putar</p>
              <p className="text-xs text-[#b3b3b3]">Aktivitas Terakhir</p>
            </div>
          </button>

          {/* Custom Playlists Divider */}
          {playlists.length > 0 && (
            <div className="pt-2 pb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-[#b3b3b3]/60">
              Daftar Putar Kamu
            </div>
          )}

          {/* Custom User Playlists */}
          {playlists.map((playlist) => {
            const isSelected = selectedPlaylistId === playlist.id;
            return (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-md transition text-left group ${
                  isSelected
                    ? 'bg-[#282828] text-[#1ed760] font-semibold'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded bg-gradient-to-br ${playlist.coverGradient} flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <ListMusic className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1ed760]' : 'text-white'}`}>
                    {playlist.title}
                  </p>
                  <p className="text-xs text-[#b3b3b3]">
                    Playlist • {playlist.songs.length} lagu
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Local Database Sync Indicator & Backup */}
        <div className="pt-3 mt-2 border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-2 text-[#b3b3b3]">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse"></span>
              <span className="text-[11px]">Database Lokal Aktif</span>
            </div>
            <button
              id={isMobileDrawer ? 'mobile-toggle-backup-btn' : 'toggle-backup-menu-btn'}
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#b3b3b3] hover:text-white transition"
              title="Cadangkan / Pulihkan Data"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
          </div>

          {showBackupMenu && (
            <div className="mt-2 p-2 rounded-lg bg-[#282828] border border-white/10 space-y-1.5 animate-fadeIn">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 text-xs text-white transition"
              >
                <Download className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Ekspor Backup JSON</span>
              </button>
              <label className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 text-xs text-white transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Impor Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Spotify-styled Sidebar */}
      <aside
        id="spotify-sidebar-desktop"
        className="hidden md:flex flex-col w-64 lg:w-72 h-full select-none shrink-0 z-20"
      >
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Slide-over Drawer (< md) */}
      {isMobileOpen && (
        <div
          id="spotify-sidebar-mobile-drawer"
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop blur click to close */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Slide-over panel */}
          <aside className="w-72 max-w-[85vw] h-full bg-[#121212] border-r border-white/10 flex flex-col justify-between shadow-2xl relative z-10 select-none animate-in slide-in-from-left duration-200 p-2">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
