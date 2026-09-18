import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  ListPlus,
  Share2,
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
  ExternalLink,
  ChevronDown,
  Check,
  Music,
  Mic2,
  Search,
  RefreshCw,
  Sliders,
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
}) => {
  const [copied, setCopied] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [activeTabMobile, setActiveTabMobile] = useState<'cover' | 'lyrics'>('cover');

  // Lyrics state
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [userIsScrolling, setUserIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<any>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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
        onClose();
      }
      // Spacebar for play/pause toggle when open and not typing
      if (e.key === ' ' && isOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        onTogglePlay?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onTogglePlay]);

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
        const el = document.getElementById(`lyric-line-${currentIdx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, lyricsData, activeLineIdx, userIsScrolling]);

  // Handle user manual scroll
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="cover-preview-modal"
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-[#0d0d12] text-white select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Full Screen Ambient Dynamic Glow Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <img
          src={coverUrl || song.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover blur-[140px] scale-150 transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </div>

      {/* 2. Main Full Screen Layout (Contains Header, Body, and Footer) */}
      <div className="relative w-full h-full flex flex-col z-10 overflow-hidden">
        {/* ========================================================================= */}
        {/* CHILD 1: TOP HEADER BAR (CSS selector 1 target)                           */}
        {/* ========================================================================= */}
        <div className="w-full px-4 sm:px-8 py-3.5 sm:py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20 backdrop-blur-md">
          {/* Left: Minimize button & Apple Music label */}
          <div className="flex items-center gap-3">
            <button
              id="full-screen-minimize-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition active:scale-95"
              title="Perkecil Tampilan (Esc)"
              aria-label="Perkecil"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
              <Music className="w-3.5 h-3.5 text-[#fa243c]" />
              <span>Vanz Music • Sedang Diputar</span>
            </div>
          </div>

          {/* Center: Mobile View Switcher (Cover vs Lyrics) */}
          <div className="flex lg:hidden items-center p-1 rounded-xl bg-white/10 border border-white/10">
            <button
              onClick={() => setActiveTabMobile('cover')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTabMobile === 'cover'
                  ? 'bg-white text-black shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Foto Sampul
            </button>
            <button
              onClick={() => setActiveTabMobile('lyrics')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                activeTabMobile === 'lyrics'
                  ? 'bg-white text-black shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Mic2 className="w-3 h-3" />
              <span>Lirik Asli</span>
            </button>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualSearch(!showManualSearch)}
              className={`p-2 rounded-full hover:bg-white/10 transition text-xs ${
                showManualSearch ? 'text-[#fa243c] bg-white/10' : 'text-white/60 hover:text-white'
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
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold whitespace-nowrap shadow">
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
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Manual search bar dropdown if toggled */}
        {showManualSearch && (
          <div className="w-full px-6 py-3 bg-[#181822] border-b border-white/10 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-200">
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
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#fa243c]"
              />
            </div>
            <button
              onClick={() => loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery)}
              className="px-4 py-2 rounded-xl bg-[#fa243c] hover:bg-[#e01e35] text-white font-semibold text-sm transition"
            >
              Cari Lirik
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHILD 2: FULL SCREEN CONTENT BODY (CSS selector 2 target)                  */}
        {/* Side-by-side on desktop (Cover on Left, Real Lyrics on Right)             */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full overflow-hidden flex flex-col lg:grid lg:grid-cols-12 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-4 sm:py-6 gap-6 sm:gap-10 items-center">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT: Grand Album Cover Photo & Track Info (Hidden on mobile if lyrics)  */}
          {/* ----------------------------------------------------------------------- */}
          <div
            className={`w-full lg:col-span-5 flex flex-col items-center lg:items-start justify-center h-full overflow-y-auto no-scrollbar ${
              activeTabMobile === 'lyrics' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* High-Resolution Album Artwork */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/15 bg-black/60 shrink-0 group">
              <img
                src={coverUrl || song.thumbnailUrl}
                alt={song.title}
                referrerPolicy="no-referrer"
                onError={() => setCoverUrl(song.thumbnailUrl)}
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Song Metadata */}
            <div className="w-full mt-6 text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight line-clamp-2">
                {song.title}
              </h1>
              <p className="text-base sm:text-lg text-white/65 font-medium mt-1 truncate">
                {song.artist}
              </p>

              {/* Quality & Duration Pill */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-3">
                <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/70">
                  Lossless Audio
                </span>
                {song.duration && (
                  <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50">
                    {song.duration}
                  </span>
                )}
                {lyricsData?.syncedLyrics && (
                  <span className="px-3 py-0.5 rounded-full bg-[#fa243c]/20 border border-[#fa243c]/30 text-xs font-semibold text-[#fa243c]">
                    Lirik Sinkron
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Audio Scrubber & Controls */}
            <div className="hidden lg:flex flex-col w-full mt-6 space-y-4">
              {/* Scrubber */}
              <div className="w-full space-y-1.5">
                <div
                  className="relative h-2 rounded-full bg-white/15 cursor-pointer py-2 flex items-center group"
                  onClick={(e) => {
                    if (!duration || !onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickPos = (e.clientX - rect.left) / rect.width;
                    onSeek(clickPos * duration);
                  }}
                >
                  <div
                    className="h-1 rounded-full bg-[#fa243c] group-hover:h-1.5 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Desktop Player Buttons */}
              <div className="flex items-center justify-between w-full pt-1">
                {/* Shuffle */}
                <button
                  onClick={onToggleShuffle}
                  className={`p-2 rounded-full hover:bg-white/10 transition ${
                    isShuffle ? 'text-[#fa243c]' : 'text-white/40 hover:text-white'
                  }`}
                  title={isShuffle ? 'Mode Acak Aktif' : 'Acak Lagu'}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                {/* Prev */}
                <button
                  onClick={onPrevTrack}
                  className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                {/* Big Play / Pause */}
                <button
                  onClick={onTogglePlay}
                  className="w-14 h-14 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center shadow-2xl transition"
                  title={isPlaying ? 'Jeda' : 'Putar'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={onNextTrack}
                  className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                {/* Repeat */}
                <button
                  onClick={onToggleRepeat}
                  className={`p-2 rounded-full hover:bg-white/10 transition ${
                    repeatMode !== 'off' ? 'text-[#fa243c]' : 'text-white/40 hover:text-white'
                  }`}
                  title={
                    repeatMode === 'one'
                      ? 'Ulangi 1 Lagu'
                      : repeatMode === 'all'
                      ? 'Ulangi Semua Lagu'
                      : 'Ulangi Nonaktif'
                  }
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>

              {/* Volume & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFav}
                    className={`p-2 rounded-xl transition ${
                      isFavorite
                        ? 'text-[#fa243c] bg-[#fa243c]/15'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFavorite ? 'Disukai' : 'Suka'}
                  >
                    <Heart className="w-5 h-5" fill={isFavorite ? '#fa243c' : 'none'} />
                  </button>
                  <button
                    onClick={() => onOpenAddToPlaylist(song)}
                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
                    title="Tambah ke Playlist"
                  >
                    <ListPlus className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume slider */}
                {onVolumeChange && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onToggleMute}
                      className="text-white/50 hover:text-white p-1"
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
                      className="w-24 h-1 rounded-full bg-white/20 accent-[#fa243c] cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT: Real Lyrics View (Lirik Lagu Asli)                                */}
          {/* ----------------------------------------------------------------------- */}
          <div
            className={`w-full lg:col-span-7 h-full flex flex-col overflow-hidden ${
              activeTabMobile === 'cover' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Lyrics Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-[#fa243c]" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Lirik Lagu Asli
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                {lyricsData?.source && <span>Sumber: {lyricsData.source}</span>}
                <button
                  onClick={() => loadSongLyrics(song.title, song.artist, song.durationSec)}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
                  title="Muat Ulang Lirik"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLyrics ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Lyrics Scrolling Stream */}
            <div
              ref={lyricsContainerRef}
              onScroll={handleLyricsScroll}
              className="flex-1 overflow-y-auto py-6 sm:py-10 space-y-5 sm:space-y-7 no-scrollbar scroll-smooth"
            >
              {/* Loading State */}
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

              {/* Real Synced Lyrics */}
              {!isLoadingLyrics && lyricsData?.syncedLyrics && lyricsData.syncedLyrics.length > 0 && (
                <div className="space-y-5 sm:space-y-7 pb-24">
                  {lyricsData.syncedLyrics.map((line, idx) => {
                    const isActive = idx === activeLineIdx;
                    return (
                      <div
                        id={`lyric-line-${idx}`}
                        key={idx}
                        onClick={() => onSeek?.(line.time)}
                        className={`cursor-pointer transition-all duration-300 font-bold ${
                          isActive
                            ? 'text-white text-2xl sm:text-3xl md:text-4xl scale-[1.02] origin-left drop-shadow-[0_4px_24px_rgba(255,255,255,0.3)]'
                            : 'text-white/30 hover:text-white/70 text-xl sm:text-2xl md:text-3xl'
                        }`}
                      >
                        {line.text || '♪'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Real Plain Lyrics (if synced not available) */}
              {!isLoadingLyrics &&
                (!lyricsData?.syncedLyrics || lyricsData.syncedLyrics.length === 0) &&
                lyricsData?.plainLyrics && (
                  <div className="whitespace-pre-line text-lg sm:text-xl md:text-2xl leading-relaxed text-white/80 font-medium pb-24 font-sans select-text">
                    {lyricsData.plainLyrics}
                  </div>
                )}

              {/* No Lyrics Found State */}
              {!isLoadingLyrics && !lyricsData?.plainLyrics && !lyricsData?.syncedLyrics && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Mic2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Lirik Tidak Ditemukan Otomatis</h4>
                  <p className="text-xs sm:text-sm text-white/50 max-w-sm">
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#fa243c]"
                    />
                    <button
                      onClick={() =>
                        loadSongLyrics(song.title, song.artist, song.durationSec, manualQuery)
                      }
                      className="px-4 py-2 rounded-xl bg-[#fa243c] hover:bg-[#e01e35] text-white text-xs font-bold transition"
                    >
                      Cari
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHILD 3: FOOTER BAR (CSS selector 3 target) - Mobile Controls Bar         */}
        {/* ========================================================================= */}
        <div className="w-full lg:hidden border-t border-white/10 bg-black/50 backdrop-blur-xl px-4 py-3 shrink-0 flex flex-col gap-2">
          {/* Mobile Scrubber */}
          <div className="w-full space-y-1">
            <div
              className="relative h-1.5 rounded-full bg-white/20 cursor-pointer py-1.5 flex items-center"
              onClick={(e) => {
                if (!duration || !onSeek) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                onSeek(clickPos * duration);
              }}
            >
              <div
                className="h-1 rounded-full bg-[#fa243c]"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleToggleFav}
              className={`p-2 rounded-full transition ${
                isFavorite ? 'text-[#fa243c]' : 'text-white/50'
              }`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? '#fa243c' : 'none'} />
            </button>

            <button onClick={onPrevTrack} className="p-2 text-white/80 active:scale-95">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-12 h-12 rounded-full bg-white text-black active:scale-95 flex items-center justify-center shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button onClick={onNextTrack} className="p-2 text-white/80 active:scale-95">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={() => onOpenAddToPlaylist(song)}
              className="p-2 text-white/50 hover:text-white"
            >
              <ListPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export alias for seamless integration
export const CoverPreviewModal = VideoModal;
