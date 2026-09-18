import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListPlus,
  ListOrdered,
  Maximize2,
} from 'lucide-react';
import { PlayerState, Song } from '../types';
import { db } from '../services/db';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerProps {
  playerState: PlayerState;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleQueue: () => void;
  isQueueOpen: boolean;
  onToggleVideoModal: () => void;
  isVideoModalOpen: boolean;
}

export const Player: React.FC<PlayerProps> = ({
  playerState,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onOpenAddToPlaylist,
  onToggleQueue,
  isQueueOpen,
  onToggleVideoModal,
}) => {
  const { currentSong, isPlaying, currentTime, duration, volume, isMuted, repeatMode, isShuffle } =
    playerState;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  // Sync favorite state with local database
  useEffect(() => {
    if (currentSong) {
      setIsFavorite(db.isFavorite(currentSong.id));
    }
  }, [currentSong]);

  const handleToggleFav = () => {
    if (!currentSong) return;
    const isNow = db.toggleFavorite(currentSong);
    setIsFavorite(isNow);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE FLOATING MINI-PLAYER BAR (< md screens / HP)                    */}
      {/* Floats elegantly directly above the floating bottom nav dock               */}
      {/* ========================================================================= */}
      {currentSong && (
        <div
          id="apple-music-mobile-mini-player"
          className="md:hidden fixed bottom-[84px] inset-x-3 sm:inset-x-8 max-w-md mx-auto z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="h-14 bg-[#181822]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] px-3 flex items-center justify-between gap-2.5 relative overflow-hidden ring-1 ring-black/30">
            {/* Top Micro Progress Bar */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#fa243c] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>

            {/* Artwork + Title (Tap to expand video modal) */}
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              onClick={onToggleVideoModal}
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-black/60 border border-white/10 shadow-sm">
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate leading-tight">
                  {currentSong.title}
                </h4>
                <p className="text-[11px] text-white/50 truncate leading-tight mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Mobile Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Favorite */}
              <button
                onClick={handleToggleFav}
                className={`p-2 rounded-full transition active:scale-90 ${
                  isFavorite ? 'text-[#fa243c]' : 'text-white/50 active:text-white'
                }`}
                aria-label={isFavorite ? 'Hapus Favorit' : 'Suka'}
              >
                <Heart className="w-4 h-4" fill={isFavorite ? '#fa243c' : 'none'} />
              </button>

              {/* Play / Pause button */}
              <button
                id="mobile-player-play-btn"
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-full bg-white text-black active:scale-95 flex items-center justify-center shadow-md transition"
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                id="mobile-player-next-btn"
                onClick={onNextTrack}
                className="p-2 text-white/70 active:text-white active:scale-90 transition"
                aria-label="Lagu Berikutnya"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Queue Toggle */}
              <button
                onClick={onToggleQueue}
                className={`p-2 rounded-lg transition active:scale-90 ${
                  isQueueOpen ? 'text-[#fa243c]' : 'text-white/50 active:text-white'
                }`}
                aria-label="Antrean Lagu"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP APPLE MUSIC PLAYER BAR (md:flex)                               */}
      {/* ========================================================================= */}
      <footer
        id="apple-music-player-bar"
        className="hidden md:flex h-20 bg-[#16161d]/95 backdrop-blur-2xl border-t border-white/8 px-4 lg:px-6 items-center justify-between z-30 select-none shrink-0"
      >
        {/* Left Section: Track Info & Quick Actions */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          {currentSong ? (
            <>
              <div
                className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 group shrink-0 cursor-pointer bg-black/40"
                onClick={onToggleVideoModal}
                title="Buka Layar Penuh Video"
              >
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
                  onClick={onToggleVideoModal}
                  title={currentSong.title}
                >
                  {currentSong.title}
                </h4>
                <p className="text-xs text-white/50 truncate hover:text-white/80 transition">
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="player-fav-btn"
                  onClick={handleToggleFav}
                  className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                    isFavorite ? 'text-[#fa243c]' : 'text-white/40 hover:text-white'
                  }`}
                  title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <Heart className="w-4 h-4" fill={isFavorite ? '#fa243c' : 'none'} />
                </button>

                <button
                  id="player-add-playlist-btn"
                  onClick={() => onOpenAddToPlaylist(currentSong)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition"
                  title="Tambah ke Playlist"
                >
                  <ListPlus className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-white/40">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                <Play className="w-4 h-4 opacity-40" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white/60">Tidak Ada Musik</p>
                <p className="text-white/30">Pilih lagu untuk memutar</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Section: Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl px-2">
          {/* Controls buttons */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Shuffle button */}
            <button
              id="player-shuffle-btn"
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                isShuffle ? 'text-[#fa243c]' : 'text-white/40 hover:text-white'
              }`}
              title={isShuffle ? 'Acak Aktif' : 'Acak Nonaktif'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous track */}
            <button
              id="player-prev-btn"
              onClick={onPrevTrack}
              disabled={!currentSong}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 transition"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play / Pause button */}
            <button
              id="player-play-pause-btn"
              onClick={onTogglePlay}
              disabled={!currentSong}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center shadow-lg transition duration-200"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next track */}
            <button
              id="player-next-btn"
              onClick={onNextTrack}
              disabled={!currentSong}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 transition"
              title="Lagu Berikutnya"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat button */}
            <button
              id="player-repeat-btn"
              onClick={onToggleRepeat}
              className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                repeatMode !== 'off' ? 'text-[#fa243c]' : 'text-white/40 hover:text-white'
              }`}
              title={`Ulangi: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Scrubber / Progress Bar */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-medium text-white/40">
            <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>

            <div
              className="relative flex-1 h-1.5 rounded-full bg-white/15 cursor-pointer group py-2 flex items-center"
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                onSeek(pos * duration);
              }}
              onMouseMove={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setIsHoveringSeek(true);
                setHoverTime(pos * duration);
              }}
              onMouseLeave={() => setIsHoveringSeek(false)}
            >
              {/* Background bar */}
              <div className="w-full h-1 rounded-full bg-white/15 group-hover:h-1.5 transition-all overflow-hidden relative">
                {/* Active progress */}
                <div
                  className="h-full bg-white group-hover:bg-[#fa243c] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>

              {/* Scrubber thumb */}
              <div
                className="absolute w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition -translate-x-1/2 pointer-events-none"
                style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />

              {/* Hover time tooltip */}
              {isHoveringSeek && duration > 0 && (
                <div
                  className="absolute -top-7 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono pointer-events-none -translate-x-1/2"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            <span className="w-10 text-left tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Volume & View toggles */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          {/* Cover photo preview toggle */}
          <button
            id="player-toggle-cover-preview-btn"
            onClick={onToggleVideoModal}
            disabled={!currentSong}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 transition"
            title="Pratinjau Foto Sampul & Detail Lagu"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Queue toggle */}
          <button
            id="player-toggle-queue-btn"
            onClick={onToggleQueue}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
              isQueueOpen ? 'text-[#fa243c] bg-white/10' : 'text-white/40 hover:text-white'
            }`}
            title="Daftar Putar Berikutnya (Up Next)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button
              id="player-mute-btn"
              onClick={onToggleMute}
              className="p-1 rounded-full text-white/50 hover:text-white transition"
              title={isMuted ? 'Batal Bisukan' : 'Bisukan Suara'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              id="player-volume-slider"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-20 lg:w-24 h-1 rounded-full accent-[#fa243c] bg-white/20 cursor-pointer"
              title={`Volume: ${isMuted ? 0 : volume}%`}
            />
          </div>
        </div>
      </footer>
    </>
  );
};
