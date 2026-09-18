import React from 'react';
import { Disc3, Play } from 'lucide-react';
import { Song } from '../types';
import { TIDAL_SUGGESTED_ALBUMS, SuggestedAlbumItem } from '../data/tidalData';
import { searchYouTube } from '../services/youtube';

interface AlbumsViewProps {
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ onPlaySong, currentSong, isPlaying }) => {
  const handlePlayAlbum = async (album: SuggestedAlbumItem) => {
    try {
      const songs = await searchYouTube(album.query);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      } else {
        onPlaySong({
          id: album.id,
          title: album.title,
          artist: album.artist,
          thumbnailUrl: album.coverImage,
          duration: '04:12',
          durationSec: 252,
        });
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

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto text-white select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Disc3 className="w-6 h-6 text-cyan-400" />
          <span>Albums</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Koleksi rilis album terbaru berkualitas tinggi (FLAC / MAX)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {TIDAL_SUGGESTED_ALBUMS.map((album) => (
          <div
            key={album.id}
            onClick={() => handlePlayAlbum(album)}
            className="group cursor-pointer flex flex-col space-y-2"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-cyan-400/40 shadow-md transition duration-300">
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-11 h-11 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <div>
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
              <p className="text-xs text-white/60 truncate mt-0.5">{album.artist}</p>
              <p className="text-[11px] text-white/40">{album.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
