import React from 'react';
import { Play, Sparkles, Flame, Heart, Compass, Radio } from 'lucide-react';
import { Song, Playlist } from '../types';
import { SongCard, SongRow } from '../components/SongItems';

interface ListenNowViewProps {
  trendingSongs: Song[];
  isLoading: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onNavigateToBrowse: () => void;
  playlists: Playlist[];
  onSelectPlaylist: (id: string) => void;
}

export const ListenNowView: React.FC<ListenNowViewProps> = ({
  trendingSongs,
  isLoading,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onNavigateToBrowse,
  playlists,
  onSelectPlaylist,
}) => {
  const featuredSong = trendingSongs[0];
  const topPicks = trendingSongs.slice(1, 7);
  const quickMix = trendingSongs.slice(7, 15);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      {/* Top Section Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#fa243c]">
          Vanz Music Rekomendasi
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
          Dengarkan Sekarang
        </h2>
      </div>

      {/* Hero Featured Card */}
      {featuredSong && (
        <div
          id="hero-featured-card"
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/60 via-purple-950/40 to-[#181822] border border-white/10 p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-center gap-5 sm:gap-8 shadow-2xl group"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#fa243c]/20 blur-[100px] pointer-events-none" />

          {/* Album artwork */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/15 shrink-0 bg-black/60">
            <img
              src={featuredSong.thumbnailUrl}
              alt={featuredSong.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-white/90 uppercase tracking-wider">
              Sorotan
            </div>
          </div>

          {/* Hero details */}
          <div className="flex-1 text-center md:text-left z-10 w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Lagu Pilihan Hari Ini
            </span>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-1 mb-2 line-clamp-2">
              {featuredSong.title}
            </h3>
            <p className="text-sm sm:text-base text-white/70 font-medium mb-3 sm:mb-4">{featuredSong.artist}</p>
            <p className="text-xs text-white/50 line-clamp-2 max-w-xl mb-5 sm:mb-6">
              {featuredSong.description ||
                'Dengarkan alunan musik berkualitas tinggi dan nikmati tampilan foto sampul album secara penuh.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 sm:gap-4">
              <button
                id="hero-play-btn"
                onClick={() => onPlaySong(featuredSong)}
                className="px-6 py-3 rounded-full bg-[#fa243c] hover:bg-[#e01e35] text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {currentSong?.id === featuredSong.id && isPlaying ? 'Jeda Musik' : 'Putar Sekarang'}
                </span>
              </button>

              <button
                onClick={() => onOpenAddToPlaylist(featuredSong)}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition text-center"
              >
                Tambah ke Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section: Trending Lagu Populer */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#fa243c]" />
              Lagu Sedang Tren
            </h3>
            <p className="text-xs text-white/50">Daftar musik paling banyak diputar saat ini</p>
          </div>
          <button
            onClick={onNavigateToBrowse}
            className="text-xs font-semibold text-[#fa243c] hover:underline"
          >
            Lihat Semua →
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {topPicks.map((song) => (
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
        )}
      </section>

      {/* Section: Playlist Personal Anda */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Daftar Putar Pribadi Anda</h3>
            <p className="text-xs text-white/50">Tersimpan aman di database lokal peramban Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group cursor-pointer p-3 rounded-2xl bg-[#1a1a22]/60 hover:bg-[#22222d] border border-white/5 hover:border-white/10 transition duration-300"
            >
              <div
                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${pl.coverGradient} flex items-center justify-center shadow-lg mb-3 relative overflow-hidden group-hover:scale-105 transition`}
              >
                <Radio className="w-10 h-10 text-white/80" />
              </div>
              <h4 className="text-sm font-semibold text-white truncate">{pl.title}</h4>
              <p className="text-xs text-white/40 mt-0.5">{pl.songs.length} lagu</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Quick Mix List */}
      {quickMix.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight">Pilihan Hari Ini</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickMix.map((song, i) => (
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
        </section>
      )}
    </div>
  );
};
