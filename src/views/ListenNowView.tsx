import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Heart,
  Radio,
} from 'lucide-react';
import { Song, Playlist } from '../types';
import {
  TIDAL_ARTIST_RADIOS,
  TIDAL_SUGGESTED_ALBUMS,
  TIDAL_RECOMMENDED_TRACKS,
  ArtistRadioItem,
  SuggestedAlbumItem,
  RecommendedTrackItem,
} from '../data/tidalData';
import { TidalDiamonds } from '../components/TidalDiamonds';
import { db } from '../services/db';
import { searchYouTube } from '../services/youtube';

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
  onSelectGenre?: (genre: string) => void;
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
  onSelectGenre,
}) => {
  const radioScrollRef = useRef<HTMLDivElement>(null);
  const albumScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePlayArtistRadio = async (radio: ArtistRadioItem) => {
    try {
      const songs = await searchYouTube(radio.query);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      }
    } catch {
      // Fallback: create song from radio
      onPlaySong({
        id: radio.id,
        title: `${radio.artist} - Best Hits`,
        artist: radio.artist,
        thumbnailUrl: radio.coverImage,
        duration: '03:45',
        durationSec: 225,
      });
    }
  };

  const handlePlayAlbum = async (album: SuggestedAlbumItem) => {
    try {
      const songs = await searchYouTube(album.query);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      }
    } catch {
      onPlaySong({
        id: album.id,
        title: album.title,
        artist: album.artist,
        thumbnailUrl: album.coverImage,
        duration: '04:12',
        durationSec: 252,
      });
    }
  };

  const handlePlayRecommendedTrack = async (track: RecommendedTrackItem) => {
    try {
      const songs = await searchYouTube(track.youtubeQuery);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      } else {
        onPlaySong({
          id: track.id,
          title: track.title,
          artist: track.artist,
          thumbnailUrl: track.coverImage,
          duration: track.duration,
          durationSec: track.durationSec,
        });
      }
    } catch {
      onPlaySong({
        id: track.id,
        title: track.title,
        artist: track.artist,
        thumbnailUrl: track.coverImage,
        duration: track.duration,
        durationSec: track.durationSec,
      });
    }
  };

  // Convert recommended track to Song object for favorites/playlist
  const toSongObject = (track: RecommendedTrackItem): Song => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    thumbnailUrl: track.coverImage,
    duration: track.duration,
    durationSec: track.durationSec,
  });

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1400px] mx-auto text-white select-none">
      {/* ========================================================================= */}
      {/* SECTION 1: Radio stations for you                                         */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Radio stations for you
          </h2>

          <div className="flex items-center gap-2">
            {/* Arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scrollContainer(radioScrollRef, 'left')}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
                aria-label="Scroll Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(radioScrollRef, 'right')}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
                aria-label="Scroll Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View All */}
            <button
              onClick={onNavigateToBrowse}
              className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition"
            >
              View All
            </button>
          </div>
        </div>

        {/* Radio Cards Horizontal Slider */}
        <div
          ref={radioScrollRef}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {TIDAL_ARTIST_RADIOS.map((radio) => (
            <div
              key={radio.id}
              onClick={() => handlePlayArtistRadio(radio)}
              className="w-40 sm:w-44 shrink-0 flex flex-col group cursor-pointer"
            >
              {/* Card Container */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg group-hover:border-cyan-400/40 transition duration-300">
                {/* Background Artwork */}
                <img
                  src={radio.coverImage}
                  alt={radio.artist}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* Tidal 3-Diamonds logo on top-right */}
                <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/40 backdrop-blur-sm">
                  <TidalDiamonds className="text-cyan-400 w-3.5 h-3.5" />
                </div>

                {/* Card Inner Typography */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-[10px] font-semibold text-white/60 tracking-wider">
                    Artist Radio
                  </p>
                  <h3 className="text-sm font-extrabold text-white truncate drop-shadow-md">
                    {radio.artist}
                  </h3>
                </div>

                {/* Play hover button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition duration-200">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-400/50">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Subtitle below card */}
              <div className="pt-2">
                <p className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition">
                  {radio.artist}
                </p>
                <p className="text-[11px] text-white/50 truncate">Artist Radio</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: Suggested new albums for you                                   */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Suggested new albums for you
          </h2>

          <div className="flex items-center gap-2">
            {/* Arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scrollContainer(albumScrollRef, 'left')}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
                aria-label="Scroll Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(albumScrollRef, 'right')}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition border border-white/5"
                aria-label="Scroll Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View All */}
            <button
              onClick={onNavigateToBrowse}
              className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition"
            >
              View All
            </button>
          </div>
        </div>

        {/* Albums Horizontal Slider */}
        <div
          ref={albumScrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {TIDAL_SUGGESTED_ALBUMS.map((album) => (
            <div
              key={album.id}
              onClick={() => handlePlayAlbum(album)}
              className="w-36 sm:w-44 shrink-0 flex flex-col group cursor-pointer"
            >
              {/* Square Album Cover */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shadow-md group-hover:border-cyan-400/40 transition duration-300">
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition duration-200">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-400/50">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title, Artist, Year with Explicit Badge */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition">
                    {album.title}
                  </h3>
                  {album.isExplicit && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-white/20 text-[9px] font-black text-white/90">
                      E
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/60 truncate mt-0.5">{album.artist}</p>
                <p className="text-[10px] text-white/40">{album.year}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: Recommended new tracks (Table View)                            */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Recommended new tracks
          </h2>

          <button
            onClick={onNavigateToBrowse}
            className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition"
          >
            View All
          </button>
        </div>

        {/* Tracks Table */}
        <div className="w-full overflow-x-auto">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 py-2 text-[11px] font-extrabold tracking-wider uppercase text-white/40 border-b border-white/5 select-none">
            <div className="col-span-6 sm:col-span-5">Title</div>
            <div className="col-span-3 sm:col-span-3">Artist</div>
            <div className="hidden sm:block sm:col-span-3">Album</div>
            <div className="col-span-3 sm:col-span-1 text-right">Time</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-white/5">
            {/* 1. Curated Tidal screenshot tracks */}
            {TIDAL_RECOMMENDED_TRACKS.map((track) => {
              const songObj = toSongObject(track);
              const isFav = db.isFavorite(track.id);
              const isThisPlaying = currentSong?.title.toLowerCase() === track.title.toLowerCase();

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 gap-2 sm:gap-4 items-center px-3 py-2.5 rounded-lg transition group ${
                    isThisPlaying ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Column: Title + Cover + [E] badge */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => handlePlayRecommendedTrack(track)}
                      className="relative w-9 h-9 rounded overflow-hidden shrink-0 bg-neutral-900 cursor-pointer shadow-sm"
                    >
                      <img
                        src={track.coverImage}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex items-center gap-1.5">
                      <span
                        onClick={() => handlePlayRecommendedTrack(track)}
                        className={`text-xs sm:text-sm font-semibold truncate cursor-pointer transition ${
                          isThisPlaying
                            ? 'text-cyan-400 font-bold'
                            : 'text-white group-hover:text-cyan-400'
                        }`}
                      >
                        {track.title}
                      </span>
                      {track.isExplicit && (
                        <span className="shrink-0 px-1 py-0.2 rounded bg-white/20 text-[9px] font-black text-white/90">
                          E
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column: Artist */}
                  <div className="col-span-3 sm:col-span-3 text-xs text-white/60 truncate font-medium">
                    {track.artist}
                  </div>

                  {/* Column: Album */}
                  <div className="hidden sm:block sm:col-span-3 text-xs text-white/40 truncate">
                    {track.album}
                  </div>

                  {/* Column: Time & Hover Actions */}
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2 text-xs text-white/40">
                    {/* Add to Playlist button */}
                    <button
                      onClick={() => onOpenAddToPlaylist(songObj)}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Tambah ke Playlist"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Favorite button */}
                    <button
                      onClick={() => onToggleFavorite(songObj)}
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        isFav
                          ? 'text-cyan-400 opacity-100'
                          : 'text-white/40 hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title="Suka"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-cyan-400' : ''}`} />
                    </button>

                    {/* Time */}
                    <span className="tabular-nums font-mono text-[11px]">{track.duration}</span>
                  </div>
                </div>
              );
            })}

            {/* 2. Seamlessly also include trending hits from the API */}
            {trendingSongs.slice(0, 8).map((song) => {
              const isFav = db.isFavorite(song.id);
              const isThisPlaying = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  className={`grid grid-cols-12 gap-2 sm:gap-4 items-center px-3 py-2.5 rounded-lg transition group ${
                    isThisPlaying ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Title + Cover */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => onPlaySong(song)}
                      className="relative w-9 h-9 rounded overflow-hidden shrink-0 bg-neutral-900 cursor-pointer shadow-sm"
                    >
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <span
                      onClick={() => onPlaySong(song)}
                      className={`text-xs sm:text-sm font-semibold truncate cursor-pointer transition ${
                        isThisPlaying
                          ? 'text-cyan-400 font-bold'
                          : 'text-white group-hover:text-cyan-400'
                      }`}
                    >
                      {song.title}
                    </span>
                  </div>

                  {/* Artist */}
                  <div className="col-span-3 sm:col-span-3 text-xs text-white/60 truncate font-medium">
                    {song.artist}
                  </div>

                  {/* Album / Channel */}
                  <div className="hidden sm:block sm:col-span-3 text-xs text-white/40 truncate">
                    Single Release
                  </div>

                  {/* Time & Actions */}
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2 text-xs text-white/40">
                    <button
                      onClick={() => onOpenAddToPlaylist(song)}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Tambah ke Playlist"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleFavorite(song)}
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        isFav
                          ? 'text-cyan-400 opacity-100'
                          : 'text-white/40 hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title="Suka"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-cyan-400' : ''}`} />
                    </button>

                    <span className="tabular-nums font-mono text-[11px]">{song.duration || '03:30'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
