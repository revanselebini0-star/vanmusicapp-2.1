import React, { useState } from 'react';
import { Heart, Play, Shuffle, Music, Plus } from 'lucide-react';
import { Song } from '../types';
import { SongRow } from '../components/SongItems';

interface FavoritesViewProps {
  favorites: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAll: (songs: Song[], shuffle?: boolean) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onNavigateToBrowse: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAll,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onNavigateToBrowse,
}) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-6 md:gap-8 pb-6 border-b border-white/5">
        <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-2xl shadow-rose-600/30 shrink-0 border border-white/10">
          <Heart className="w-14 h-14 sm:w-20 sm:h-20 text-white fill-white" />
        </div>

        <div className="flex-1 text-center md:text-left min-w-0 w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Perpustakaan Pribadi
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-1 mb-2">
            Favorit Saya
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mb-3">
            Kumpulan lagu dan video musik yang Anda tandai dengan tombol suka.
          </p>
          <div className="text-xs text-white/40 font-medium">
            <span className="text-white/80 font-semibold">{favorites.length} lagu disukai</span>
            <span> • Tersimpan permanen di database lokal</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={() => onPlayAll(favorites, false)}
              disabled={favorites.length === 0}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-accent hover:bg-accent-light disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent flex items-center gap-2 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Putar Semua</span>
            </button>

            <button
              onClick={() => onPlayAll(favorites, true)}
              disabled={favorites.length === 0}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm border border-white/10 flex items-center gap-2 active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4" />
              <span>Acak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="space-y-2">
        {favorites.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white/3 rounded-2xl border border-white/5 p-6">
            <Heart className="w-12 h-12 mx-auto text-white/20" />
            <h3 className="text-base font-semibold text-white/70">Belum Ada Lagu Favorit</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Klik ikon hati pada lagu manapun untuk menyimpannya ke koleksi favorit Anda.
            </p>
            <button
              onClick={onNavigateToBrowse}
              className="mt-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-light transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Telusuri Musik Trending
            </button>
          </div>
        ) : (
          <div className="bg-[#181820]/40 rounded-2xl border border-white/5 p-2 divide-y divide-white/5">
            {favorites.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
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
