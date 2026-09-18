import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Star,
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  MessageSquareQuote,
  Airplay,
  ListMusic,
  ListPlus,
  Share2,
  ExternalLink,
  Search,
  X,
  RefreshCw,
  Shuffle,
  Repeat,
  Repeat1,
  Check,
  Music,
} from 'lucide-react';
import { Song, RepeatMode } from '../types';
import { db } from '../services/db';
import { fetchLyrics, LyricsData } from '../services/lyrics';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onOpenAddToPlaylist: (song: Song) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  currentTime?: number;
  duration?: number;
  onSeek?: (seconds: number) => void;
  isShuffle?: boolean;
  repeatMode?: RepeatMode;
  volume?: number;
  isMuted?: boolean;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  onToggleQueue?: () => void;
  isQueueOpen?: boolean;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  song,
  onOpenAddToPlaylist,
  isPlaying = false,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime = 0,
  duration = 0,
  onSeek,
  isShuffle = false,
  repeatMode = 'off',
  volume = 80,
  isMuted = false,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleMute,
  onToggleQueue,
}) => {
  const [copied, setCopied] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [isMobileLyricsOpen, setIsMobileLyricsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Lyrics state
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [userIsScrolling, setUserIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<any>(null);
  const desktopLyricsContainerRef = useRef<HTMLDivElement>(null);
  const mobileLyricsContainerRef = useRef<HTMLDivElement>(null);

  // Load high-res cover and lyrics on song change
  useEffect(() => {
    if (song) {
      setCoverUrl(`https://i.ytimg.com/vi/${song.id}/maxresdefault.jpg`);
      loadSongLyrics(song.title, song.artist, song.durationSec);
      setManualQuery(`${song.title} ${song.artist}`);
      setShowManualSearch(false);
      setActiveLineIdx(-1);
    }
  }, [song]);

  const loadSongLyrics = async (title: string, artist: string, dur?: number, custom?: string) => {
    setIsLoadingLyrics(true);
    try {
      const data = await fetchLyrics(title, artist, dur, custom);
      setLyricsData(data);
    } catch (err) {
      setLyricsData(null);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isMobileLyricsOpen) {
          setIsMobileLyricsOpen(false);
        } else {
          onClose();
        }
      }
      if (e.key === ' ' && isOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        onTogglePlay?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onTogglePlay, isMobileLyricsOpen]);

  // Synchronize active lyrics line based on currentTime
  useEffect(() => {
    if (!lyricsData?.syncedLyrics || lyricsData.syncedLyrics.length === 0) return;

    const lines = lyricsData.syncedLyrics;
    let currentIdx = -1;

    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        currentIdx = i;
      } else {
        break;
      }
    }

    if (currentIdx !== activeLineIdx) {
      setActiveLineIdx(currentIdx);

      // Auto scroll if user isn't actively scrolling
      if (!userIsScrolling && currentIdx >= 0) {
        const desktopEl = document.getElementById(`lyric-line-desktop-${currentIdx}`);
        if (desktopEl) {
          desktopEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const mobileEl = document.getElementById(`lyric-line-mobile-${currentIdx}`);
        if (mobileEl) {
          mobileEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, lyricsData, activeLineIdx, userIsScrolling]);

  const handleLyricsScroll = () => {
    setUserIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setUserIsScrolling(false);
    }, 4000);
  };

  if (!isOpen || !song) return null;

  const isFavorite = db.isFavorite(song.id);

  const handleToggleFav = () => {
    db.toggleFavorite(song);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${song.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemainingTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '-0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `-${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  return (
    <div
      id="apple-music-now-playing-modal"
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-[#0b0c10] text-white select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Dynamic Ambient Blurred Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
        <img
          src={coverUrl || song.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover blur-[140px] scale-150 transform transition-all duration-1000"
        />
        <div
          className="absolute inset-0 transition-all duration-700 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 40% 30%, var(--accent-glow, rgba(30, 215, 96, 0.4)), transparent 75%), linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(10,11,15,0.92) 100%)',
          }}
        />
      </div>

      {/* 2. Main Full Screen Layout */}
      <div className="relative w-full h-full flex flex-col z-10 overflow-hidden">
        {/* Top Minimal Bar */}
        <div className="w-full px-4 sm:px-8 pt-3 pb-2 flex items-center justify-between shrink-0">
          <button
            id="full-screen-minimize-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition active:scale-95"
            title="Perkecil Tampilan (Esc)"
            aria-label="Perkecil"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Top Pill Handle on Mobile */}
          <div
            onClick={onClose}
            className="cursor-pointer py-2 px-6 lg:hidden"
            aria-label="Tarik ke bawah untuk menutup"
          >
            <div className="w-10 h-1 bg-white/35 rounded-full" />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
            <Music className="w-3.5 h-3.5 text-accent" />
            <span>Vanz Music • Sedang Diputar</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowManualSearch(!showManualSearch)}
              className={`p-2 rounded-full hover:bg-white/10 transition text-xs ${
                showManualSearch ? 'text-accent bg-white/10' : 'text-white/60 hover:text-white'
              }`}
              title="Cari Lirik Manual"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition relative"
              title="Salin Tautan Lagu"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-white/70" />}
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-lg">
                  Tersalin!
                </span>
              )}
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${song.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              title="Buka di YouTube"
            >
              <ExternalLink className="w-4 h-4 text-white/70" />
            </a>
          </div>
        </div>

        {/* Manual search dropdown */}
        {showManualSearch && (
          <div className="w-full px-6 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-200 z-20">
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery);
                  }
                }}
                placeholder="Ketik judul lagu & nama artis untuk mencari lirik..."
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={() => loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery)}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold text-sm transition"
            >
              Cari Lirik
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DESKTOP & MOBILE CONTENT BODY                                             */}
        {/* Desktop: Player on Left, Synced Lyrics on Right                            */}
        {/* Mobile: Full Apple Music Player screen with popup lyrics drawer            */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full overflow-hidden max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-2 sm:py-4 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12 items-center justify-center">
          {/* ======================================================================= */}
          {/* PLAYER COLUMN (Desktop Left 5-col / Mobile Full Screen)                  */}
          {/* Matches the user's Apple Music Now Playing screenshot                   */}
          {/* ======================================================================= */}
          <div className="w-full lg:col-span-5 h-full flex flex-col justify-between max-w-md mx-auto py-1 sm:py-3 select-none">
            {/* 1. Large Square Artwork */}
            <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">
              <div className="relative w-[72vw] h-[72vw] max-w-[320px] max-h-[320px] sm:max-w-[360px] sm:max-h-[360px] lg:max-w-[380px] lg:max-h-[380px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.85)] border border-white/15 bg-black/60 shrink-0 group">
                <img
                  src={coverUrl || song.thumbnailUrl}
                  alt={song.title}
                  referrerPolicy="no-referrer"
                  onError={() => setCoverUrl(song.thumbnailUrl)}
                  className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
              </div>
            </div>

            {/* 2. Track Title, Artist, Star & More row */}
            <div className="flex items-center justify-between gap-3 mt-3 sm:mt-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                  {song.title}
                </h2>
                <p className="text-sm sm:text-base text-white/60 font-medium truncate mt-0.5">
                  {song.artist}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 relative">
                {/* Star Favorite Button */}
                <button
                  onClick={handleToggleFav}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition active:scale-90 ${
                    isFavorite
                      ? 'bg-accent-soft text-accent shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                  }`}
                  title={isFavorite ? 'Disukai' : 'Tambah ke Favorit'}
                  aria-label="Suka"
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-accent' : ''}`} />
                </button>

                {/* More Options Menu (...) */}
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition active:scale-90 ${
                    isMoreMenuOpen ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                  }`}
                  title="Menu Opsi"
                  aria-label="Opsi Lainnya"
                >
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Dropdown menu */}
                {isMoreMenuOpen && (
                  <div className="absolute right-0 bottom-12 w-52 bg-[#1b1c24] border border-white/15 rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        onOpenAddToPlaylist(song);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      <ListPlus className="w-4 h-4 text-accent" />
                      <span>Tambah ke Playlist</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleShuffle?.();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      <Shuffle className={`w-4 h-4 ${isShuffle ? 'text-accent' : ''}`} />
                      <span>Mode Acak: {isShuffle ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleRepeat?.();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      {repeatMode === 'one' ? (
                        <Repeat1 className="w-4 h-4 text-accent" />
                      ) : (
                        <Repeat className={`w-4 h-4 ${repeatMode === 'all' ? 'text-accent' : ''}`} />
                      )}
                      <span>
                        Ulangi: {repeatMode === 'one' ? '1 Lagu' : repeatMode === 'all' ? 'Semua' : 'Mati'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleShare();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs text-white/80 hover:text-white hover:bg-white/10 text-left transition"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Salin Tautan Lagu</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Sleek Scrubber Bar & Dolby Atmos Badge */}
            <div className="w-full mt-4 sm:mt-5 space-y-1.5">
              <div
                className="relative h-2 rounded-full bg-white/20 cursor-pointer py-2 flex items-center group w-full"
                onClick={(e) => {
                  if (!duration || !onSeek) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  onSeek(clickPos * duration);
                }}
              >
                <div
                  className="h-1.5 rounded-full bg-white group-hover:bg-accent transition-all duration-75 relative"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Scrubber bottom info */}
              <div className="flex items-center justify-between text-xs text-white/50 font-medium select-none">
                <span>{formatTime(currentTime)}</span>

                {/* Dolby Atmos / Lossless Badge */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-bold tracking-wide text-white/70">
                  <span className="font-black tracking-tighter text-white">DO</span>
                  <span>Dolby Atmos</span>
                </div>

                <span>{formatRemainingTime(remainingSeconds)}</span>
              </div>
            </div>

            {/* 4. Large Playback Controls */}
            <div className="flex items-center justify-center gap-10 sm:gap-12 w-full mt-4 sm:mt-6">
              <button
                onClick={onPrevTrack}
                className="text-white hover:opacity-80 active:scale-90 transition p-2"
                title="Lagu Sebelumnya"
                aria-label="Lagu Sebelumnya"
              >
                <SkipBack className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white" />
              </button>

              <button
                onClick={onTogglePlay}
                className="text-white hover:opacity-90 active:scale-90 transition p-2"
                title={isPlaying ? 'Jeda' : 'Putar'}
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? (
                  <Pause className="w-11 h-11 sm:w-14 sm:h-14 fill-white text-white" />
                ) : (
                  <Play className="w-11 h-11 sm:w-14 sm:h-14 fill-white text-white ml-1" />
                )}
              </button>

              <button
                onClick={onNextTrack}
                className="text-white hover:opacity-80 active:scale-90 transition p-2"
                title="Lagu Berikutnya"
                aria-label="Lagu Berikutnya"
              >
                <SkipForward className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white" />
              </button>
            </div>

            {/* 5. Volume Slider */}
            {onVolumeChange && (
              <div className="flex items-center gap-3 w-full max-w-xs sm:max-w-sm mx-auto mt-4 sm:mt-6">
                <button
                  onClick={onToggleMute}
                  className="text-white/50 hover:text-white transition p-1"
                  aria-label="Mute"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume1 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full bg-white/20 accent-range cursor-pointer"
                  aria-label="Volume"
                />
                <button
                  onClick={() => onVolumeChange(100)}
                  className="text-white/50 hover:text-white transition p-1"
                  aria-label="Volume Maksimum"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 6. Bottom Dock Actions (Lyrics, AirPlay, Queue) */}
            <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm mx-auto mt-4 sm:mt-5 pt-2 border-t border-white/10">
              {/* Lyrics Button (Triggers Mobile Pop-up Sheet) */}
              <button
                onClick={() => setIsMobileLyricsOpen(true)}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-95 flex items-center gap-1.5 group"
                title="Lihat Lirik Lagu"
                aria-label="Buka Lirik"
              >
                <MessageSquareQuote className="w-5 h-5 group-hover:text-accent transition" />
                <span className="text-xs font-semibold text-white/70 group-hover:text-white lg:hidden">
                  Lirik
                </span>
              </button>

              {/* Center AirPlay Output Button */}
              <div
                className="p-2.5 rounded-full text-white/50 hover:text-white transition flex items-center gap-1"
                title="AirPlay / Speaker Aktif"
              >
                <Airplay className="w-5 h-5" />
              </div>

              {/* Right Queue Button */}
              <button
                onClick={() => onToggleQueue?.()}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-95"
                title="Daftar Antrean Musik"
                aria-label="Antrean"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* DESKTOP RIGHT COLUMN: Synced Lyrics Stream                               */}
          {/* User requirement: "dan untuk dekstop liriknya ttp di kanan"             */}
          {/* ======================================================================= */}
          <div className="hidden lg:flex lg:col-span-7 h-full max-h-[720px] flex-col overflow-hidden border-l border-white/10 pl-8 xl:pl-12">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Lirik Lagu Asli
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                {lyricsData?.source && <span>Sumber: {lyricsData.source}</span>}
                <button
                  onClick={() => loadSongLyrics(song.title, song.artist, song.durationSec)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition"
                  title="Muat Ulang Lirik"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLyrics ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Desktop Lyrics Scrolling Stream */}
            <div
              ref={desktopLyricsContainerRef}
              onScroll={handleLyricsScroll}
              className="flex-1 overflow-y-auto py-8 space-y-6 sm:space-y-8 no-scrollbar scroll-smooth"
            >
              {/* Loading State */}
              {isLoadingLyrics && (
                <div className="space-y-6 py-8">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-white/10 rounded-xl animate-pulse"
                      style={{ width: `${55 + (i % 5) * 10}%` }}
                    />
                  ))}
                </div>
              )}

              {/* Real Synced Lyrics */}
              {!isLoadingLyrics && lyricsData?.syncedLyrics && lyricsData.syncedLyrics.length > 0 && (
                <div className="space-y-6 sm:space-y-8 pb-32">
                  {lyricsData.syncedLyrics.map((line, idx) => {
                    const isActive = idx === activeLineIdx;
                    return (
                      <div
                        id={`lyric-line-desktop-${idx}`}
                        key={idx}
                        onClick={() => onSeek?.(line.time)}
                        className={`cursor-pointer transition-all duration-300 font-bold ${
                          isActive
                            ? 'text-white text-3xl xl:text-4xl scale-[1.03] origin-left drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
                            : 'text-white/30 hover:text-white/75 text-2xl xl:text-3xl'
                        }`}
                      >
                        {line.text || '♪'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Plain Lyrics fallback */}
              {!isLoadingLyrics &&
                (!lyricsData?.syncedLyrics || lyricsData.syncedLyrics.length === 0) &&
                lyricsData?.plainLyrics && (
                  <div className="whitespace-pre-line text-xl xl:text-2xl leading-relaxed text-white/80 font-medium pb-32 font-sans select-text">
                    {lyricsData.plainLyrics}
                  </div>
                )}

              {/* Not found state */}
              {!isLoadingLyrics && !lyricsData?.plainLyrics && !lyricsData?.syncedLyrics && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <MessageSquareQuote className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Lirik Tidak Ditemukan Otomatis</h4>
                  <p className="text-xs text-white/50 max-w-sm">
                    Lirik untuk lagu ini belum terindeks otomatis. Anda dapat mencari dengan kata kunci judul lagu dan artis di bawah:
                  </p>
                  <div className="flex items-center gap-2 w-full max-w-sm pt-2">
                    <input
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery);
                        }
                      }}
                      placeholder="Judul lagu & artis..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() =>
                        loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery)
                      }
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold transition"
                    >
                      Cari
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE POP-UP LYRICS SHEET (HP)                                           */}
      {/* User requirement:                                                        */}
      {/* "dan untuk di hp pencet liriknya dan animasi mengulir ke atas pop up      */}
      {/* dan juga dengan background blur"                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileLyricsOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="lg:hidden fixed inset-x-0 bottom-0 top-12 z-50 rounded-t-[32px] bg-[#0c0d13]/85 backdrop-blur-3xl border-t border-white/15 flex flex-col overflow-hidden shadow-[0_-24px_70px_rgba(0,0,0,0.95)]"
          >
            {/* Top Drag Handle Bar */}
            <div
              className="w-full pt-3 pb-2 flex flex-col items-center cursor-pointer select-none"
              onClick={() => setIsMobileLyricsOpen(false)}
            >
              <div className="w-12 h-1.5 bg-white/35 rounded-full hover:bg-white/60 transition" />
            </div>

            {/* Mobile Sheet Header */}
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Lirik Lagu Asli</h3>
                  <p className="text-[11px] text-white/50 truncate max-w-[200px]">
                    {song.title} • {song.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSongLyrics(song.title, song.artist, song.durationSec)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
                  title="Muat Ulang"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingLyrics ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsMobileLyricsOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition active:scale-95"
                  aria-label="Tutup Lirik"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Lyrics Stream Container */}
            <div
              ref={mobileLyricsContainerRef}
              onScroll={handleLyricsScroll}
              className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-6 sm:space-y-8 no-scrollbar scroll-smooth"
            >
              {/* Loading */}
              {isLoadingLyrics && (
                <div className="space-y-6 py-8">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-white/10 rounded-xl animate-pulse"
                      style={{ width: `${60 + (i % 4) * 10}%` }}
                    />
                  ))}
                </div>
              )}

              {/* Synced Lyrics */}
              {!isLoadingLyrics && lyricsData?.syncedLyrics && lyricsData.syncedLyrics.length > 0 && (
                <div className="space-y-6 sm:space-y-8 pb-32">
                  {lyricsData.syncedLyrics.map((line, idx) => {
                    const isActive = idx === activeLineIdx;
                    return (
                      <div
                        id={`lyric-line-mobile-${idx}`}
                        key={idx}
                        onClick={() => {
                          onSeek?.(line.time);
                        }}
                        className={`cursor-pointer transition-all duration-300 font-bold ${
                          isActive
                            ? 'text-white text-2xl sm:text-3xl scale-[1.02] origin-left drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
                            : 'text-white/35 hover:text-white/80 text-xl sm:text-2xl'
                        }`}
                      >
                        {line.text || '♪'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Plain lyrics */}
              {!isLoadingLyrics &&
                (!lyricsData?.syncedLyrics || lyricsData.syncedLyrics.length === 0) &&
                lyricsData?.plainLyrics && (
                  <div className="whitespace-pre-line text-lg sm:text-xl leading-relaxed text-white/85 font-medium pb-32 font-sans select-text">
                    {lyricsData.plainLyrics}
                  </div>
                )}

              {/* Not found */}
              {!isLoadingLyrics && !lyricsData?.plainLyrics && !lyricsData?.syncedLyrics && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <MessageSquareQuote className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Lirik Belum Tersedia</h4>
                  <p className="text-xs text-white/50 max-w-xs">
                    Ketik judul lagu dan artis di bawah untuk mencari lirik secara manual:
                  </p>
                  <div className="flex items-center gap-2 w-full max-w-xs pt-2">
                    <input
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery);
                        }
                      }}
                      placeholder="Judul lagu & artis..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() =>
                        loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery)
                      }
                      className="px-3 py-2 rounded-xl bg-accent text-white text-xs font-bold transition"
                    >
                      Cari
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sheet Bottom Mini Controller Bar */}
            <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{song.title}</p>
                  <p className="text-[11px] text-white/50 truncate">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onPrevTrack}
                  className="p-2 text-white/80 active:scale-95"
                  aria-label="Sebelumnya"
                >
                  <SkipBack className="w-5 h-5 fill-white" />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-95 shadow-md"
                  aria-label={isPlaying ? 'Jeda' : 'Putar'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={onNextTrack}
                  className="p-2 text-white/80 active:scale-95"
                  aria-label="Berikutnya"
                >
                  <SkipForward className="w-5 h-5 fill-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export alias for seamless integration
export const CoverPreviewModal = VideoModal;
