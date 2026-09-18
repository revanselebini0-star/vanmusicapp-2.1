import React, { useState, useMemo } from 'react';
import {
  Play,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  ListPlus,
  Heart,
  Share2,
  Clock,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { Song, UserProfile } from '../types';
import {
  APPLE_MUSIC_RECENT_TRACKS,
  APPLE_MUSIC_NEW_RELEASES,
} from '../data/appleMusicData';
import { db } from '../services/db';
import { REGIONS } from './TopBar';

interface AppleMusicMobileViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  activeTabTitle?: string;
  trendingSongs: Song[];
  isLoadingTrending?: boolean;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  history?: Song[];
  onToggleFavorite?: (song: Song) => void;
}

const COUNTRY_DETAILS: Record<
  string,
  { name: string; heroTitle: string; subtitle: string; caption: string; badge: string }
> = {
  ID: {
    name: 'Indonesia',
    heroTitle: "Today's Hits Indonesia",
    subtitle: 'Apple Music Hits Nusantara',
    caption: 'Dengarkan lagu-lagu pop dan viral terhangat tanah air dalam kualitas Spatial Audio.',
    badge: 'Spatial Audio',
  },
  US: {
    name: 'Amerika Serikat',
    heroTitle: "Today's Top Hits USA",
    subtitle: 'Billboard Hot 100 & Viral Hits',
    caption: 'Trek hits nomor satu di Amerika dengan kejernihan audio tanpa kompromi.',
    badge: 'Lossless',
  },
  KR: {
    name: 'Korea Selatan',
    heroTitle: 'K-Pop Wave Essentials',
    subtitle: 'MelOn & K-Chart Hot Picks',
    caption: 'Koleksi comeback idol dan rilisan K-Pop terpopuler minggu ini.',
    badge: 'Spatial Audio',
  },
  JP: {
    name: 'Jepang',
    heroTitle: 'J-Pop & Anime Spotlight',
    subtitle: 'Oricon Chart & Tokyo Beats',
    caption: 'Trek J-Pop, soundtrack anime, dan artis Jepang paling viral saat ini.',
    badge: 'Hi-Res',
  },
  GB: {
    name: 'Inggris',
    heroTitle: 'UK Top 40 Essentials',
    subtitle: 'Official UK Singles & Indie London',
    caption: 'Hits radio BBC dan rilisan Britpop paling digemari pekan ini.',
    badge: 'Spatial Audio',
  },
};

export const AppleMusicMobileView: React.FC<AppleMusicMobileViewProps> = ({
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenAddToPlaylist,
  user,
  onOpenAuthModal,
  activeTabTitle = 'Baru',
  trendingSongs = [],
  isLoadingTrending = false,
  selectedRegion = 'ID',
  onRegionChange,
  history = [],
  onToggleFavorite,
}) => {
  const [selectedActionSong, setSelectedActionSong] = useState<Song | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const countryInfo = COUNTRY_DETAILS[selectedRegion] || COUNTRY_DETAILS['ID'];

  const handleToggleFav = (song: Song) => {
    if (onToggleFavorite) {
      onToggleFavorite(song);
    } else {
      db.toggleFavorite(song);
    }
  };

  const handleShare = (song: Song) => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${song.id}`);
    setCopiedId(song.id);
    setTimeout(() => {
      setCopiedId(null);
      setSelectedActionSong(null);
    }, 1500);
  };

  // =========================================================================
  // 1. DYNAMIC POSTER RECOMMENDATIONS BASED ON COUNTRY (Sesuai Negara)
  // =========================================================================
  const dynamicPosters = useMemo(() => {
    const defaultArtworks = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    ];

    if (trendingSongs.length > 0) {
      const topPicks = trendingSongs.slice(0, 4);
      return topPicks.map((song, idx) => {
        let category = 'DAFTAR PUTAR YANG DIPERBARUI';
        let mainTitle = countryInfo.heroTitle;
        let subTitle = `${song.title} • ${song.artist}`;
        let badge = countryInfo.badge;

        if (idx === 1) {
          category = `REKOMENDASI ${countryInfo.name.toUpperCase()}`;
          mainTitle = song.title;
          subTitle = song.artist;
          badge = 'Lossless';
        } else if (idx === 2) {
          category = 'PILIHAN EDITOR';
          mainTitle = 'Hits Terhangat';
          subTitle = `${song.title} - ${song.artist}`;
          badge = 'Spatial Audio';
        } else if (idx === 3) {
          category = 'AUDIO SPASIAL';
          mainTitle = 'Rilisan Populer';
          subTitle = `${song.artist}`;
          badge = 'Hi-Res Lossless';
        }

        return {
          id: `poster-${song.id}-${idx}`,
          category,
          title: mainTitle,
          subtitle: subTitle,
          caption: `Rekomendasi terbaik dari ${countryInfo.name}. Putar lagu "${song.title}" sekarang.`,
          imageUrl: song.thumbnailUrl || defaultArtworks[idx % defaultArtworks.length],
          badge,
          song,
        };
      });
    }

    // Fallback if loading
    return [
      {
        id: 'poster-fb-1',
        category: 'DAFTAR PUTAR YANG DIPERBARUI',
        title: countryInfo.heroTitle,
        subtitle: countryInfo.subtitle,
        caption: countryInfo.caption,
        imageUrl: defaultArtworks[0],
        badge: countryInfo.badge,
        song: APPLE_MUSIC_RECENT_TRACKS[0],
      },
      {
        id: 'poster-fb-2',
        category: `REKOMENDASI ${countryInfo.name.toUpperCase()}`,
        title: 'New Music Spotlight',
        subtitle: 'Pilihan Musik Terkini',
        caption: `Koleksi lagu populer terhangat pilihan pendengar di ${countryInfo.name}.`,
        imageUrl: defaultArtworks[1],
        badge: 'Lossless',
        song: APPLE_MUSIC_RECENT_TRACKS[1],
      },
    ];
  }, [trendingSongs, countryInfo]);

  // =========================================================================
  // 2. BANYAK LAGU "TERAKHIR DI DENGAR" (Combined history + recent tracks)
  // =========================================================================
  const allRecentList: Song[] = useMemo(() => {
    const seenIds = new Set<string>();
    const combined: Song[] = [];

    // Add user's real playback history first
    history.forEach((s) => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        combined.push(s);
      }
    });

    // Add curated recent tracks to ensure plenty of songs (banyak lagu)
    APPLE_MUSIC_RECENT_TRACKS.forEach((s) => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        combined.push(s);
      }
    });

    // Also add some trending songs if needed so there are lots of tracks
    trendingSongs.slice(0, 8).forEach((s) => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        combined.push(s);
      }
    });

    return combined;
  }, [history, trendingSongs]);

  // Chunk "Terakhir Di Dengar" into groups of 4 for swipeable multi-row columns
  const chunkedRecentTracks: Song[][] = useMemo(() => {
    const chunks: Song[][] = [];
    for (let i = 0; i < allRecentList.length; i += 4) {
      chunks.push(allRecentList.slice(i, i + 4));
    }
    return chunks;
  }, [allRecentList]);

  // =========================================================================
  // 3. LAGU-LAGU POPULER (Top Charts by Country)
  // =========================================================================
  const popularTracks = useMemo(() => {
    if (trendingSongs.length > 0) {
      return trendingSongs;
    }
    return APPLE_MUSIC_RECENT_TRACKS;
  }, [trendingSongs]);

  const chunkedPopularTracks: Song[][] = useMemo(() => {
    const chunks: Song[][] = [];
    for (let i = 0; i < popularTracks.length; i += 4) {
      chunks.push(popularTracks.slice(i, i + 4));
    }
    return chunks;
  }, [popularTracks]);

  return (
    <div className="md:hidden pb-36 px-4 pt-3 text-white select-none">
      {/* ========================================================================= */}
      {/* 1. APPLE MUSIC LARGE DISPLAY HEADER + COUNTRY SELECTOR                     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            {activeTabTitle}
          </h1>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">
            Rekomendasi Musik {countryInfo.name}
          </p>
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenAuthModal}
          className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-neutral-800 flex items-center justify-center shadow-sm active:scale-95 transition"
          aria-label="Profil Pengguna"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          )}
        </button>
      </div>

      {/* Country Switcher Pills (Sesuai Negara) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4">
        <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1 pl-1 shrink-0">
          <Globe className="w-3.5 h-3.5 text-[#fa2d48]" />
          Negara:
        </span>
        {REGIONS.map((region) => {
          const isSelected = selectedRegion === region.code;
          return (
            <button
              key={region.code}
              onClick={() => onRegionChange(region.code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
                isSelected
                  ? 'bg-[#fa2d48] text-white shadow-md'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/15'
              }`}
            >
              <span>{region.flag}</span>
              <span>{region.name}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO FEATURED POSTER CAROUSEL (DIPERBARUI SESUAI NEGARA)               */}
      {/* ========================================================================= */}
      <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 pb-4">
        {dynamicPosters.map((poster) => (
          <div
            key={poster.id}
            className="w-[86vw] max-w-[340px] shrink-0 snap-start flex flex-col"
          >
            {/* Header info */}
            <div className="mb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                {poster.category}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug truncate">
                {poster.title}
              </h2>
              <p className="text-sm font-medium text-neutral-400 leading-tight truncate">
                {poster.subtitle}
              </p>
            </div>

            {/* Artwork Card */}
            <div
              onClick={() => onPlaySong(poster.song)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-white/10 group cursor-pointer active:scale-[0.98] transition duration-200"
            >
              <img
                src={poster.imageUrl}
                alt={poster.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

              {/* Flag & Spatial Audio Badge */}
              <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{poster.badge}</span>
              </div>

              {/* Overlay Country Badge */}
              <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md">
                {countryInfo.name}
              </div>

              {/* Bottom Caption & Play button */}
              <div className="absolute bottom-3.5 inset-x-3.5 flex items-end justify-between gap-2">
                <p className="text-xs text-neutral-200 font-medium leading-snug line-clamp-2 drop-shadow">
                  {poster.caption}
                </p>

                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION: BANYAK LAGU "TERAKHIR DI DENGAR"                               */}
      {/* ========================================================================= */}
      <div className="mt-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Terakhir Di Dengar
            </h2>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            {allRecentList.length} Lagu
          </span>
        </div>

        {/* Swipeable Columns (4 songs per column) */}
        <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 pb-2">
          {chunkedRecentTracks.map((group, colIdx) => (
            <div
              key={colIdx}
              className="w-[86vw] max-w-[340px] shrink-0 snap-start flex flex-col divide-y divide-white/5"
            >
              {group.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                const isTrackPlaying = isCurrent && isPlaying;
                const isExplicit =
                  song.title.toLowerCase().includes('explicit') ||
                  song.title.includes('Lap Four') ||
                  song.title.includes('ESPÍRITU');

                return (
                  <div
                    key={`recent-${song.id}-${colIdx}`}
                    className="flex items-center justify-between py-2 group active:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition"
                  >
                    {/* Song artwork + info */}
                    <div
                      onClick={() => onPlaySong(song)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-white/10 shadow-sm">
                        <img
                          src={song.thumbnailUrl}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isTrackPlaying ? (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#fa2d48] animate-ping" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Titles */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3
                            className={`text-sm font-semibold truncate leading-snug ${
                              isCurrent ? 'text-[#fa2d48]' : 'text-white'
                            }`}
                          >
                            {song.title}
                          </h3>
                          {isExplicit && (
                            <span className="shrink-0 text-[9px] font-bold bg-neutral-600/60 text-neutral-300 px-1 rounded">
                              E
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 truncate leading-normal mt-0.5 font-normal">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* More Options Button */}
                    <button
                      onClick={() => setSelectedActionSong(song)}
                      className="p-2 text-neutral-400 hover:text-white active:scale-90 transition shrink-0"
                      aria-label="Opsi Lainnya"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION: LAGU-LAGU POPULER SESUAI NEGARA                               */}
      {/* ========================================================================= */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Lagu Populer ({countryInfo.name})
            </h2>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
          {isLoadingTrending && (
            <span className="text-[11px] text-[#fa2d48] animate-pulse">Memuat...</span>
          )}
        </div>

        {/* Multi-column 4-row layout with Ranking Numbers (#1, #2, ...) */}
        <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 pb-2">
          {chunkedPopularTracks.map((group, colIdx) => (
            <div
              key={`pop-col-${colIdx}`}
              className="w-[86vw] max-w-[340px] shrink-0 snap-start flex flex-col divide-y divide-white/5"
            >
              {group.map((song, rowIdx) => {
                const globalRank = colIdx * 4 + rowIdx + 1;
                const isCurrent = currentSong?.id === song.id;
                const isTrackPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`pop-${song.id}-${colIdx}-${rowIdx}`}
                    className="flex items-center justify-between py-2 group active:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition"
                  >
                    {/* Rank Number */}
                    <span
                      className={`w-6 text-center text-sm font-black shrink-0 ${
                        globalRank <= 3 ? 'text-[#fa2d48]' : 'text-neutral-500'
                      }`}
                    >
                      {globalRank}
                    </span>

                    {/* Song artwork + info */}
                    <div
                      onClick={() => onPlaySong(song)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer ml-1"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-white/10 shadow-sm">
                        <img
                          src={song.thumbnailUrl}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isTrackPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#fa2d48] animate-ping" />
                          </div>
                        )}
                      </div>

                      {/* Titles */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3
                            className={`text-sm font-semibold truncate leading-snug ${
                              isCurrent ? 'text-[#fa2d48]' : 'text-white'
                            }`}
                          >
                            {song.title}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-400 truncate leading-normal mt-0.5 font-normal">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* More Options Button */}
                    <button
                      onClick={() => setSelectedActionSong(song)}
                      className="p-2 text-neutral-400 hover:text-white active:scale-90 transition shrink-0"
                      aria-label="Opsi Lainnya"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECTION: RILISAN BARU > (ALBUM GRID)                                    */}
      {/* ========================================================================= */}
      <div className="mt-6">
        <div className="flex items-center gap-1 mb-2.5 cursor-pointer">
          <h2 className="text-lg font-bold text-white tracking-tight">Rilisan Baru</h2>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 pb-3">
          {APPLE_MUSIC_NEW_RELEASES.map((album) => (
            <div
              key={album.id}
              onClick={() => {
                onPlaySong({
                  id: 'eVTXPUF4Oz4',
                  title: `${album.title} - Album`,
                  artist: album.artist,
                  thumbnailUrl: album.coverUrl,
                  duration: '03:45',
                  durationSec: 225,
                });
              }}
              className="w-[140px] shrink-0 snap-start cursor-pointer active:scale-95 transition"
            >
              <div className="w-[140px] h-[140px] rounded-xl overflow-hidden shadow-md border border-white/10 relative group">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-current drop-shadow-md" />
                </div>
              </div>

              <div className="mt-1.5">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-semibold text-white truncate leading-snug">
                    {album.title}
                  </h4>
                  {album.explicit && (
                    <span className="text-[8px] font-bold bg-neutral-600/70 text-neutral-300 px-0.5 rounded">
                      E
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 truncate leading-snug mt-0.5">
                  {album.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SONG ACTION BOTTOM SHEET MODAL                                          */}
      {/* ========================================================================= */}
      {selectedActionSong && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-3 animate-in fade-in"
          onClick={() => setSelectedActionSong(null)}
        >
          <div
            className="w-full max-w-sm bg-[#1c1c1e] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <img
                src={selectedActionSong.thumbnailUrl}
                alt={selectedActionSong.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {selectedActionSong.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {selectedActionSong.artist}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  onPlaySong(selectedActionSong);
                  setSelectedActionSong(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm text-white hover:bg-white/10 text-left transition"
              >
                <Play className="w-4 h-4 text-[#fa2d48]" />
                <span>Putar Sekarang</span>
              </button>

              <button
                onClick={() => {
                  handleToggleFav(selectedActionSong);
                  setSelectedActionSong(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm text-white hover:bg-white/10 text-left transition"
              >
                <Heart className="w-4 h-4 text-[#fa2d48]" />
                <span>
                  {db.isFavorite(selectedActionSong.id)
                    ? 'Hapus dari Favorit'
                    : 'Tambah ke Favorit'}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenAddToPlaylist(selectedActionSong);
                  setSelectedActionSong(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm text-white hover:bg-white/10 text-left transition"
              >
                <ListPlus className="w-4 h-4 text-[#fa2d48]" />
                <span>Tambah ke Daftar Putar</span>
              </button>

              <button
                onClick={() => handleShare(selectedActionSong)}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm text-white hover:bg-white/10 text-left transition"
              >
                <Share2 className="w-4 h-4 text-[#fa2d48]" />
                <span>
                  {copiedId === selectedActionSong.id
                    ? 'Tautan Tersalin!'
                    : 'Bagikan Lagu'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setSelectedActionSong(null)}
              className="mt-3 w-full py-2.5 rounded-xl bg-white/10 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
