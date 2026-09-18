import React, { useState } from 'react';
import {
  Radio,
  ListMusic,
  Disc3,
  Music,
  Film,
  Mic2,
  Plus,
  MoreHorizontal,
  X,
  Upload,
  Download,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Playlist, UserProfile, ViewTab } from '../types';
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
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
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
  user = null,
  onOpenAuthModal,
}) => {
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

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
    setShowMenuDropdown(false);
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
    setShowMenuDropdown(false);
  };

  const isHomeActive = (currentTab === 'home' || currentTab === 'listen-now') && !selectedPlaylistId;
  const isExploreActive = (currentTab === 'explore' || currentTab === 'browse') && !selectedPlaylistId;
  const isVideosActive = currentTab === 'videos' && !selectedPlaylistId;
  const isRadioActive = currentTab === 'radio' && !selectedPlaylistId;
  const isPlaylistsActive = currentTab === 'playlists' && !selectedPlaylistId;
  const isAlbumsActive = currentTab === 'albums' && !selectedPlaylistId;
  const isTracksActive = (currentTab === 'tracks' || currentTab === 'favorites') && !selectedPlaylistId;
  const isArtistsActive = currentTab === 'artists' && !selectedPlaylistId;

  const renderContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden px-4 py-4">
      {/* Top Header: Circular Logo + Three Dots Menu */}
      <div className="flex items-center justify-between pb-6 pt-1">
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 via-white/5 to-cyan-400/30 p-1 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_12px_rgba(0,229,255,0.25)] group-hover:scale-105 transition">
            <img
              src="./vanz-logo.png"
              alt="Vanz Music"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold tracking-tight text-white text-sm hidden sm:inline-block">
            Vanz<span className="text-cyan-400 font-bold ml-0.5">Tidal</span>
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition active:scale-95"
            title="Menu Tambahan"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Three dots dropdown */}
          {showMenuDropdown && (
            <div className="absolute left-0 top-8 w-48 bg-[#18181f] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={handleExport}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cadangkan Playlist</span>
              </button>
              <label className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Pulihkan Playlist</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  if (confirm('Bersihkan riwayat dan putar dari awal?')) {
                    db.clearHistory();
                    onPlaylistDataChanged();
                  }
                  setShowMenuDropdown(false);
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-white/10 text-left transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            </div>
          )}

          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation: Home, Explore, Videos */}
      <nav className="space-y-1 pb-6 border-b border-white/5">
        <button
          onClick={() => handleTabClick('home')}
          className={`w-full text-left py-2 px-2.5 rounded-lg text-[15px] font-bold transition flex items-center justify-between ${
            isHomeActive
              ? 'text-cyan-400'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span>Home</span>
          {isHomeActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />}
        </button>

        <button
          onClick={() => handleTabClick('explore')}
          className={`w-full text-left py-2 px-2.5 rounded-lg text-[15px] font-bold transition flex items-center justify-between ${
            isExploreActive
              ? 'text-cyan-400'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span>Explore</span>
          {isExploreActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />}
        </button>

        <button
          onClick={() => handleTabClick('videos')}
          className={`w-full text-left py-2 px-2.5 rounded-lg text-[15px] font-bold transition flex items-center justify-between ${
            isVideosActive
              ? 'text-cyan-400'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span>Videos</span>
          {isVideosActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />}
        </button>
      </nav>

      {/* MY COLLECTION Section */}
      <div className="pt-5 pb-4">
        <div className="px-2.5 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-white/40">
          My Collection
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => handleTabClick('radio')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isRadioActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-white/50 shrink-0" />
            <span>Mixes & Radio</span>
          </button>

          <button
            onClick={() => handleTabClick('playlists')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isPlaylistsActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListMusic className="w-4 h-4 text-white/50 shrink-0" />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => handleTabClick('albums')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isAlbumsActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc3 className="w-4 h-4 text-white/50 shrink-0" />
            <span>Albums</span>
          </button>

          <button
            onClick={() => handleTabClick('tracks')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isTracksActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4 text-white/50 shrink-0" />
            <span>Tracks</span>
          </button>

          <button
            onClick={() => handleTabClick('videos')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isVideosActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4 text-white/50 shrink-0" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => handleTabClick('artists')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              isArtistsActive
                ? 'text-cyan-400 bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic2 className="w-4 h-4 text-white/50 shrink-0" />
            <span>Artists</span>
          </button>
        </div>
      </div>

      {/* PLAYLISTS Section */}
      <div className="flex-1 min-h-0 flex flex-col pt-3 border-t border-white/5">
        <div className="flex items-center justify-between px-2.5 pb-2 shrink-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/40">
            Playlists
          </span>
          <button
            onClick={() => onOpenCreatePlaylist()}
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
            title="Tambah Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* + Create... Action */}
        <button
          onClick={() => {
            onOpenCreatePlaylist();
            if (isMobileDrawer && onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Create...</span>
        </button>

        {/* Scrollable List of Playlists */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 no-scrollbar pt-1">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => handlePlaylistClick(pl.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition block ${
                  isSelected
                    ? 'text-cyan-400 font-bold bg-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                {pl.title}
              </button>
            );
          })}

          {playlists.length === 0 && (
            <p className="px-2.5 py-3 text-[11px] text-white/30 italic">
              Belum ada playlist tersimpan
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        id="vanz-tidal-sidebar"
        className="hidden md:flex flex-col w-56 lg:w-60 h-full shrink-0 border-r border-white/5 bg-[#000000] z-20"
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer (< md screens) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer panel */}
          <div className="relative w-64 max-w-[80vw] h-full bg-[#000000] shadow-2xl z-10 flex flex-col border-r border-white/10 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
