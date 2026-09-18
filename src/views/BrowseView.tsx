import React, { useState } from 'react';
import { Compass, Flame, LayoutGrid, List, Sparkles } from 'lucide-react';
import { Song } from '../types';
import { SongCard, SongRow } from '../components/SongItems';
import { REGIONS } from '../components/TopBar';

interface BrowseViewProps {
  trendingSongs: Song[];
  isLoading: boolean;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onSelectGenre: (genreQuery: string) => void;
}

const GENRE_TILES = [
  { name: 'Pop Indonesia', query: 'lagu pop indonesia hits 2024', gradient: 'from-pink-600 to-rose-500' },
  { name: 'Indie & Akustik', query: 'indie akustik santai indonesia', gradient: 'from-amber-500 to-orange-600' },
  { name: 'K-Pop Terpopuler', query: 'kpop trending music video', gradient: 'from-purple-600 to-pink-500' },
  { name: 'Dangdut & Koplo', query: 'dangdut koplo viral trending', gradient: 'from-orange-500 to-red-600' },
  { name: 'Lo-Fi Chill Beats', query: 'lofi hip hop chill beats relax', gradient: 'from-teal-600 to-emerald-700' },
  { name: 'Top Hits Global', query: 'billboard hot 100 music video', gradient: 'from-blue-600 to-indigo-700' },
  { name: 'Rock & Alternatif', query: 'rock alternative hits official video', gradient: 'from-zinc-700 to-zinc-900' },
  { name: 'R&B / Soul', query: 'rb soul smooth music video', gradient: 'from-fuchsia-600 to-purple-800' },
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  trendingSongs,
  isLoading,
  selectedRegion,
  onRegionChange,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onSelectGenre,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Katalog Global
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2.5">
            <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
            Telusuri Tangga Musik
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Menampilkan tangga lagu musik terpopuler dan terhangat saat ini.
          </p>
        </div>

        {/* Layout Switcher & Region Pill Selector */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-wrap">
          {/* Region Quick Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => onRegionChange(r.code)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedRegion === r.code
                    ? 'bg-accent text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Grid vs List Toggle */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                layoutMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition ${
                layoutMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Tampilan Daftar"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genre & Kategori Cards */}
      <section className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Kategori & Genre Pilihan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {GENRE_TILES.map((genre) => (
            <button
              key={genre.name}
              onClick={() => onSelectGenre(genre.query)}
              className={`p-3.5 h-24 rounded-2xl bg-gradient-to-br ${genre.gradient} flex flex-col justify-end text-left shadow-lg hover:scale-105 active:scale-95 transition duration-200 border border-white/10 group`}
            >
              <span className="text-xs font-bold text-white tracking-tight line-clamp-2">
                {genre.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Songs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Daftar Video Musik Terpopuler ({trendingSongs.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/5 rounded-2xl aspect-[3/4] p-3 flex flex-col gap-2"
              >
                <div className="w-full aspect-video bg-white/10 rounded-xl" />
                <div className="h-4 bg-white/10 rounded w-3/4 mt-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                onPlay={onPlaySong}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#181820]/40 rounded-2xl border border-white/5 p-2 divide-y divide-white/5">
            {trendingSongs.map((song, i) => (
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
      </section>
    </div>
  );
};
