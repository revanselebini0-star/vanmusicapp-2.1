import React from 'react';
import { Clock, Trash2, Play, Plus } from 'lucide-react';
import { Song } from '../types';
import { SongRow } from '../components/SongItems';
import { db } from '../services/db';

interface HistoryViewProps {
  history: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onClearHistory: () => void;
  onNavigateToBrowse: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onClearHistory,
  onNavigateToBrowse,
}) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Riwayat Pemutaran
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2.5">
            <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            Baru Diputar
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Daftar lagu yang baru-baru ini Anda dengarkan, tersimpan di database lokal.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 text-xs font-semibold border border-white/10 active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Riwayat
          </button>
        )}
      </div>

      {/* History list */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white/3 rounded-2xl border border-white/5 p-6">
            <Clock className="w-12 h-12 mx-auto text-white/20" />
            <h3 className="text-base font-semibold text-white/70">Belum Ada Riwayat Lagu</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Lagu yang Anda putar akan otomatis tercatat di sini sehingga mudah didengarkan kembali.
            </p>
            <button
              onClick={onNavigateToBrowse}
              className="mt-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-light transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Putar Musik Trending Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-[#181820]/40 rounded-2xl border border-white/5 p-2 divide-y divide-white/5">
            {history.map((song, i) => (
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
