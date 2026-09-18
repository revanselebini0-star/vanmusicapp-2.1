import React, { useState } from 'react';
import { Search, Sparkles, Clock, X, Music, AlertCircle, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { SongCard, SongRow } from '../components/SongItems';

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Song[];
  isSearching: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
}

const POPULAR_SEARCHES = [
  'Bernadya',
  'Mahalini',
  'Komang Raim Laode',
  'Sal Priadi Dari Planet Lain',
  'Coldplay',
  'NewJeans',
  'Sheila on 7',
  'Nadhif Basalamah Penjaga Hati',
  'Taylor Swift',
  'Bruno Mars Die With A Smile',
];

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenAddToPlaylist,
  onToggleFavorite,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'video' | 'short'>('all');

  const filteredResults = searchResults.filter((s) => {
    if (filterType === 'video') {
      return s.title.toLowerCase().includes('video') || s.title.toLowerCase().includes('mv');
    }
    if (filterType === 'short') {
      return (s.durationSec || 0) > 0 && (s.durationSec || 0) < 240;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Search Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Pencarian Cepat
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
          Pencarian Lagu Real-Time
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Cari jutaan lagu, artis, dan album favorit Anda secara instan.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 text-white/40 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          id="search-view-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ketik judul lagu, penyanyi, atau penggalan lirik..."
          className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 rounded-2xl bg-white/7 border border-white/10 focus:border-accent focus:bg-white/10 focus:outline-none text-white placeholder:text-white/40 text-sm sm:text-base shadow-lg transition"
          autoFocus
        />
        {isSearching ? (
          <Loader2 className="w-5 h-5 text-accent absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
        ) : (
          searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Trending Search Suggestions */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Pencarian Populer
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/80 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips if Search is active */}
      {searchQuery && (
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Semua ({searchResults.length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'video'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Video Klip / MV
          </button>
          <button
            onClick={() => setFilterType('short')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'short'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Durasi &lt; 4 Menit
          </button>
        </div>
      )}

      {/* Search Results Area */}
      <div className="pt-2">
        {isSearching ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-white/5 animate-pulse flex items-center px-4 gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() === '' ? (
          <div className="text-center py-16 space-y-3 text-white/40">
            <Music className="w-12 h-12 mx-auto opacity-30 text-accent" />
            <h3 className="text-base font-semibold text-white/70">Mulai Mengetik Lagu Favorit Anda</h3>
            <p className="text-xs max-w-sm mx-auto">
              Ketik nama lagu atau artis pada kolom di atas, atau pilih salah satu kata kunci populer.
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-white/40">
            <AlertCircle className="w-12 h-12 mx-auto opacity-40 text-amber-400" />
            <h3 className="text-base font-semibold text-white/70">
              Tidak ada hasil untuk "{searchQuery}"
            </h3>
            <p className="text-xs max-w-sm mx-auto">
              Coba periksa ejaan atau gunakan kata kunci umum lainnya.
            </p>
          </div>
        ) : (
          <div className="bg-[#181820]/40 rounded-2xl border border-white/5 p-2 divide-y divide-white/5">
            {filteredResults.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                onPlay={onPlaySong}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
