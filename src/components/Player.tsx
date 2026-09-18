import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListPlus,
  Airplay,
  ListMusic,
  Maximize2,
  MessageSquareQuote,
  MinusCircle,
  MoreHorizontal,
  Share2,
  Music,
} from 'lucide-react';
import { PlayerState, Song } from '../types';
import { db } from '../services/db';

interface PlayerProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleVideoModal: () => void;
  onToggleQueue?: () => void;
  isQueueOpen?: boolean;
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
  onToggleVideoModal,
  onToggleQueue,
  isQueueOpen = false,
}) => {
  const { currentSong, isPlaying, currentTime, duration, volume, isMuted, repeatMode, isShuffle } =
    playerState;

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isFavorite = currentSong ? db.isFavorite(currentSong.id) : false;

  const handleToggleFav = () => {
    if (currentSong) {
      db.toggleFavorite(currentSong);
    }
  };

  const handleShare = () => {
    if (!currentSong) return;
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${currentSong.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMoreMenu(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. APPLE MUSIC FLOATING MINI-PLAYER (< md screens / HP)                    */}
      {/* Matches user's Apple Music mobile screenshot:                             */}
      {/* "[ ♫ ]  Tidak Diputar                 ▶   ⏭"                             */}
      {/* Or when playing: artwork, song title, artist, pause, next track           */}
      {/* ========================================================================= */}
      <div
        id="apple-music-mobile-mini-player"
        className="md:hidden fixed bottom-[72px] inset-x-3 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="h-14 bg-[#1e1e24]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-3 flex items-center justify-between gap-3 relative overflow-hidden">
          {/* Subtle Top Progress Bar if playing */}
          {currentSong && duration > 0 && (
            <div className="absolute top-0 inset-x-0 h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#fa2d48] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          )}

          {/* Left: Thumbnail or Music Note + Title */}
          <div
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            onClick={onToggleVideoModal}
          >
            {currentSong ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-white/10 shadow-sm">
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Music className="w-5 h-5 text-neutral-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate leading-tight">
                {currentSong ? currentSong.title : 'Tidak Diputar'}
              </h4>
              {currentSong && (
                <p className="text-xs text-neutral-400 truncate leading-tight mt-0.5">
                  {currentSong.artist}
                </p>
              )}
            </div>
          </div>

          {/* Right: Play/Pause and SkipForward (Exactly matching Apple Music screenshot) */}
          <div className="flex items-center gap-3.5 shrink-0 pr-1">
            <button
              id="apple-mobile-play-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (currentSong) {
                  onTogglePlay();
                } else {
                  onToggleVideoModal();
                }
              }}
              className="text-white hover:text-white/80 active:scale-90 transition p-1"
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              id="apple-mobile-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                onNextTrack();
              }}
              disabled={!currentSong}
              className="text-white hover:text-white/80 disabled:opacity-30 active:scale-90 transition p-1"
              aria-label="Lagu Berikutnya"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP TIDAL BOTTOM PLAYER BAR (>= md screens)                         */}
      {/* Exact match to user's TIDAL screenshot                                    */}
      {/* ========================================================================= */}
      <div
        id="vanz-tidal-bottom-bar"
        className="hidden md:flex h-20 bg-[#101014] border-t border-white/10 px-4 lg:px-6 items-center justify-between z-30 select-none shrink-0"
      >
        {/* LEFT: Thumbnail, Title, Artist, "PLAYING FROM: ...", Favorite, Block, More */}
        <div className="flex items-center gap-3 w-1/4 min-w-[240px] max-w-sm">
          {currentSong ? (
            <>
              {/* Artwork Thumbnail */}
              <div
                onClick={onToggleVideoModal}
                className="relative w-12 h-12 rounded overflow-hidden bg-neutral-900 border border-white/10 shrink-0 group cursor-pointer shadow-md"
                title="Buka Lirik & Tampilan Penuh"
              >
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Title & Artist & Playing From Context */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4
                    onClick={onToggleVideoModal}
                    className="text-xs font-bold text-white truncate cursor-pointer hover:underline"
                    title={currentSong.title}
                  >
                    {currentSong.title}
                  </h4>
                </div>

                <p className="text-[11px] text-white/60 truncate hover:text-white cursor-pointer">
                  {currentSong.artist}
                </p>

                {/* Tidal "PLAYING FROM" Context Tag */}
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/35 truncate mt-0.5">
                  Playing from: {currentSong.artist.toUpperCase()}
                </p>
              </div>

              {/* Action Icons (Heart, Block/Minus, More) */}
              <div className="flex items-center gap-0.5 shrink-0 relative">
                {/* Favorite */}
                <button
                  onClick={handleToggleFav}
                  className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                    isFavorite ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                  }`}
                  title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                  aria-label="Favorit"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-cyan-400' : ''}`} />
                </button>

                {/* Block / Hide */}
                <button
                  onClick={() => onNextTrack()}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition"
                  title="Lewati Lagu Ini"
                  aria-label="Sembunyikan"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>

                {/* More Options */}
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition"
                  title="Opsi Lainnya"
                  aria-label="Opsi Lainnya"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMoreMenu && (
                  <div className="absolute left-0 bottom-10 w-48 bg-[#1a1b22] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        onOpenAddToPlaylist(currentSong);
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tambah ke Playlist</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Tautan Lagu</span>
                    </button>
                    {copied && (
                      <p className="px-3.5 py-1 text-[10px] text-cyan-400 font-bold">
                        Tautan tersalin ke papan klip!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-white/40">
              <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/5">
                <Play className="w-4 h-4 opacity-40" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white/60">Vanz Tidal</p>
                <p className="text-white/30 text-[11px]">Pilih lagu untuk memutar</p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Playback Controls + Sleek Timeline Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl px-4">
          {/* Controls: Shuffle, Previous, Play/Pause, Next, Repeat */}
          <div className="flex items-center gap-5 lg:gap-7">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-1 rounded-full hover:bg-white/10 transition ${
                isShuffle ? 'text-cyan-400' : 'text-white/40 hover:text-white'
              }`}
              title={isShuffle ? 'Acak Aktif' : 'Acak Nonaktif'}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Skip Back */}
            <button
              onClick={onPrevTrack}
              disabled={!currentSong}
              className="text-white/80 hover:text-white disabled:opacity-30 transition active:scale-90"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={onTogglePlay}
              disabled={!currentSong}
              className="w-8 h-8 rounded-full bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-30 flex items-center justify-center shadow-lg transition"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={onNextTrack}
              disabled={!currentSong}
              className="text-white/80 hover:text-white disabled:opacity-30 transition active:scale-90"
              title="Lagu Berikutnya"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={onToggleRepeat}
              className={`p-1 rounded-full hover:bg-white/10 transition ${
                repeatMode !== 'off' ? 'text-cyan-400' : 'text-white/40 hover:text-white'
              }`}
              title={`Ulangi: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="w-full flex items-center gap-3 text-[11px] font-medium text-white/40">
            <span className="w-8 text-right tabular-nums text-[10px]">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-1.5 cursor-pointer group py-1 flex items-center"
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
              {/* Background Track Line */}
              <div className="w-full h-0.5 rounded-full bg-white/20 group-hover:h-1 transition-all overflow-hidden relative">
                <div
                  className="h-full bg-white group-hover:bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>

              {/* Scrubber Thumb */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition -translate-x-1/2 pointer-events-none"
                style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />

              {/* Hover Tooltip */}
              {isHoveringSeek && duration > 0 && (
                <div
                  className="absolute -top-6 px-1.5 py-0.5 rounded bg-black/90 text-white text-[9px] font-mono pointer-events-none -translate-x-1/2"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            <span className="w-8 text-left tabular-nums text-[10px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Tidal "MAX / FLAC" Gold Badge, Volume Slider, AirPlay, Queue, Lyrics */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[240px]">
          {/* Tidal Signature MAX / FLAC Golden Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2a220b] border border-[#ffc72c]/40 text-[#ffc72c] text-[10px] font-black tracking-widest uppercase select-none shadow-sm">
            <span>MAX</span>
            <span className="text-[8px] text-[#ffc72c]/60">FLAC</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-white/50 hover:text-white transition p-1"
              title={isMuted ? 'Batal Bisukan' : 'Bisukan'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 50 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 lg:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-cyan-400"
              aria-label="Volume"
            />
          </div>

          {/* Airplay / Device Output */}
          <button
            className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition"
            title="Keluaran Audio / AirPlay"
          >
            <Airplay className="w-4 h-4" />
          </button>

          {/* Queue Drawer Toggle */}
          <button
            onClick={onToggleQueue}
            className={`p-1.5 rounded hover:bg-white/10 transition ${
              isQueueOpen ? 'text-cyan-400 bg-white/10' : 'text-white/50 hover:text-white'
            }`}
            title="Antrean Putar"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Lyrics / Fullscreen Button (Apple Music modal with synced lyrics on right!) */}
          <button
            onClick={onToggleVideoModal}
            disabled={!currentSong}
            className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-cyan-400 disabled:opacity-30 transition"
            title="Lihat Lirik Lagu & Tampilan Penuh (Apple Music Style)"
          >
            <MessageSquareQuote className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
