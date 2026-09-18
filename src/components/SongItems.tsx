import React from 'react';
import { Play, Pause, Heart, ListPlus, MoreHorizontal } from 'lucide-react';
import { Song } from '../types';
import { db } from '../services/db';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onPlay: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isPlaying,
  isCurrentSong,
  onPlay,
  onOpenAddToPlaylist,
  onToggleFavorite,
}) => {
  const isFav = db.isFavorite(song.id);

  return (
    <div
      id={`song-card-${song.id}`}
      className="group relative flex flex-col p-3 rounded-2xl bg-[#1a1a22]/60 hover:bg-[#22222d] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl"
    >
      {/* Thumbnail with overlay play button */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 mb-3">
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Duration badge */}
        {song.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-white/90">
            {song.duration}
          </span>
        )}

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition duration-200 ${
            isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            id={`play-card-btn-${song.id}`}
            onClick={() => onPlay(song)}
            className="w-12 h-12 rounded-full bg-accent hover:bg-accent-light text-white shadow-xl shadow-accent flex items-center justify-center transform hover:scale-110 active:scale-95 transition"
            title={isCurrentSong && isPlaying ? 'Jeda' : 'Putar'}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold truncate transition cursor-pointer ${
            isCurrentSong ? 'text-accent' : 'text-white group-hover:text-white'
          }`}
          onClick={() => onPlay(song)}
          title={song.title}
        >
          {song.title}
        </h4>
        <p className="text-xs text-white/50 truncate mt-0.5">{song.artist}</p>
      </div>

      {/* Meta & Actions Bar */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
        <span>{song.viewCount ? `${song.viewCount} views` : 'Musik'}</span>
        <div className="flex items-center gap-1 opacity-90 sm:opacity-80 sm:group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(song);
            }}
            className={`p-1.5 sm:p-1 rounded-full hover:bg-white/10 active:scale-90 transition ${
              isFav ? 'text-accent' : 'text-white/50 hover:text-white'
            }`}
            title={isFav ? 'Disukai' : 'Suka'}
            aria-label="Favorit"
          >
            <Heart className="w-3.5 h-3.5" fill={isFav ? 'var(--accent-color)' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddToPlaylist(song);
            }}
            className="p-1.5 sm:p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white active:scale-90 transition"
            title="Tambah ke Playlist"
            aria-label="Tambah ke Playlist"
          >
            <ListPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface SongRowProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onPlay: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite?: (song: Song) => void;
  onRemove?: (songId: string) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  isPlaying,
  isCurrentSong,
  onPlay,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onRemove,
}) => {
  const isFav = db.isFavorite(song.id);

  return (
    <div
      id={`song-row-${song.id}`}
      className={`group flex items-center gap-3 md:gap-4 px-3.5 py-2.5 rounded-xl transition border border-transparent ${
        isCurrentSong
          ? 'bg-white/10 border-white/10'
          : 'hover:bg-white/5 hover:border-white/5'
      }`}
    >
      {/* Index number or playing equalizer animation */}
      <div className="w-6 flex items-center justify-center shrink-0">
        {isCurrentSong ? (
          <div className="flex items-end gap-0.5 h-4">
            <span
              className={`w-1 bg-accent rounded-full ${
                isPlaying ? 'animate-bounce' : 'h-3'
              }`}
              style={{ height: isPlaying ? '100%' : '50%', animationDelay: '0ms' }}
            />
            <span
              className={`w-1 bg-accent rounded-full ${
                isPlaying ? 'animate-bounce' : 'h-2'
              }`}
              style={{ height: isPlaying ? '70%' : '30%', animationDelay: '150ms' }}
            />
            <span
              className={`w-1 bg-accent rounded-full ${
                isPlaying ? 'animate-bounce' : 'h-4'
              }`}
              style={{ height: isPlaying ? '90%' : '60%', animationDelay: '300ms' }}
            />
          </div>
        ) : (
          <span className="text-xs font-semibold text-white/30 group-hover:hidden">
            {index + 1}
          </span>
        )}
        <button
          onClick={() => onPlay(song)}
          className={`p-1 rounded-full text-white/80 hover:text-white ${
            isCurrentSong ? 'hidden' : 'hidden group-hover:flex'
          }`}
          title="Putar"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Thumbnail */}
      <div
        className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10 cursor-pointer"
        onClick={() => onPlay(song)}
      >
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition"
          loading="lazy"
        />
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlay(song)}>
        <h4
          className={`text-sm font-semibold truncate transition ${
            isCurrentSong ? 'text-accent' : 'text-white'
          }`}
        >
          {song.title}
        </h4>
        <p className="text-xs text-white/50 truncate mt-0.5">{song.artist}</p>
      </div>

      {/* View Count (desktop only) */}
      {song.viewCount && (
        <span className="hidden md:block text-xs text-white/40 tabular-nums w-20 text-right">
          {song.viewCount}
        </span>
      )}

      {/* Duration */}
      <span className="text-xs text-white/40 tabular-nums w-12 text-right">
        {song.duration || '03:30'}
      </span>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-80 sm:opacity-60 sm:group-hover:opacity-100 transition shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(song);
          }}
          className={`p-2 sm:p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition ${
            isFav ? 'text-accent' : 'text-white/50 hover:text-white'
          }`}
          title={isFav ? 'Disukai' : 'Suka'}
          aria-label="Favorit"
        >
          <Heart className="w-4 h-4" fill={isFav ? 'var(--accent-color)' : 'none'} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddToPlaylist(song);
          }}
          className="p-2 sm:p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white active:scale-90 transition"
          title="Tambah ke Playlist"
          aria-label="Tambah ke Playlist"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(song.id);
            }}
            className="p-2 sm:p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-rose-400 active:scale-90 transition"
            title="Hapus dari Playlist"
            aria-label="Hapus dari Playlist"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
