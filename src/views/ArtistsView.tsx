import React from 'react';
import { Mic2, Play, Users } from 'lucide-react';
import { Song } from '../types';
import { TIDAL_ARTIST_RADIOS, ArtistRadioItem } from '../data/tidalData';
import { searchYouTube } from '../services/youtube';

interface ArtistsViewProps {
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ onPlaySong, currentSong, isPlaying }) => {
  const handlePlayArtist = async (artist: ArtistRadioItem) => {
    try {
      const songs = await searchYouTube(artist.query);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      } else {
        onPlaySong({
          id: artist.id,
          title: `${artist.artist} - Best Hits`,
          artist: artist.artist,
          thumbnailUrl: artist.coverImage,
          duration: '04:00',
          durationSec: 240,
        });
      }
    } catch {
      onPlaySong({
        id: artist.id,
        title: `${artist.artist} - Best Hits`,
        artist: artist.artist,
        thumbnailUrl: artist.coverImage,
        duration: '04:00',
        durationSec: 240,
      });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto text-white select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Mic2 className="w-6 h-6 text-cyan-400" />
          <span>Artists</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Artis favorit dan musisi terpopuler di koleksi Anda
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {TIDAL_ARTIST_RADIOS.map((artist) => (
          <div
            key={artist.id}
            onClick={() => handlePlayArtist(artist)}
            className="flex flex-col items-center text-center group cursor-pointer space-y-3"
          >
            {/* Circular Artist Portrait */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-neutral-900 border-2 border-white/10 group-hover:border-cyan-400 shadow-xl transition duration-300">
              <img
                src={artist.coverImage}
                alt={artist.artist}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition truncate max-w-[150px]">
                {artist.artist}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">{artist.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
