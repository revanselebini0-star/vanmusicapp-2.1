import React from 'react';
import { X, Play, Trash2, ListMusic } from 'lucide-react';
import { Song } from '../types';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentSong,
  onPlaySong,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        id="queue-drawer"
        className="w-full sm:w-84 md:w-96 h-full bg-[#18181f]/98 backdrop-blur-2xl border-l border-white/10 shadow-2xl relative z-10 flex flex-col"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-[#fa243c]" />
            <h3 className="font-bold text-white text-base">Berikutnya (Up Next)</h3>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="text-xs text-white/50 hover:text-rose-400 px-2 py-1 rounded transition"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Tutup Antrean"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Currently Playing Card */}
      {currentSong && (
        <div className="p-4 bg-white/5 border-b border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#fa243c] block mb-2">
            Sedang Diputar
          </span>
          <div className="flex items-center gap-3">
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-lg object-cover border border-white/10 shadow shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Up Next List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
          <span>Antrean Lagu ({queue.length})</span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-xs">
            Antrean kosong. Klik lagu apa saja untuk menambahkannya ke antrean pemutaran!
          </div>
        ) : (
          queue.map((song, idx) => (
            <div
              key={`${song.id}-${idx}`}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
            >
              <span className="text-xs text-white/30 w-4 text-center tabular-nums">
                {idx + 1}
              </span>
              <img
                src={song.thumbnailUrl}
                alt={song.title}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
              />
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onPlaySong(song)}
              >
                <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#fa243c] transition">
                  {song.title}
                </h4>
                <p className="text-[11px] text-white/50 truncate">{song.artist}</p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => onPlaySong(song)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                  title="Putar Sekarang"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemoveFromQueue(idx)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-rose-400"
                  title="Hapus dari antrean"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
};
