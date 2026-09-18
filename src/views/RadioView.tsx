import React from 'react';
import { Radio, Play, Sparkles } from 'lucide-react';
import { Song } from '../types';
import { TIDAL_ARTIST_RADIOS, ArtistRadioItem } from '../data/tidalData';
import { TidalDiamonds } from '../components/TidalDiamonds';
import { searchYouTube } from '../services/youtube';

interface RadioViewProps {
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

const GENRE_RADIOS = [
  {
    id: 'radio-metal',
    title: 'Heavy Metal Radio',
    subtitle: 'Megadeth, Metallica, Iron Maiden',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    query: 'heavy metal greatest hits playlist',
  },
  {
    id: 'radio-rock',
    title: 'Classic Rock Mix',
    subtitle: 'Queen, Led Zeppelin, AC/DC',
    cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    query: 'classic rock legends playlist',
  },
  {
    id: 'radio-pop',
    title: 'Global Pop Radio',
    subtitle: 'Taylor Swift, Dua Lipa, Harry Styles',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    query: 'global pop radio hits',
  },
  {
    id: 'radio-lofi',
    title: 'Chill Lofi Beats',
    subtitle: 'Study, relax, coding concentration',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    query: 'lofi hip hop radio beats to relax study to',
  },
];

export const RadioView: React.FC<RadioViewProps> = ({ onPlaySong, currentSong, isPlaying }) => {
  const handlePlayQuery = async (query: string, title: string, artist: string, cover: string) => {
    try {
      const songs = await searchYouTube(query);
      if (songs.length > 0) {
        onPlaySong(songs[0]);
      } else {
        onPlaySong({
          id: query,
          title,
          artist,
          thumbnailUrl: cover,
          duration: '03:45',
          durationSec: 225,
        });
      }
    } catch {
      onPlaySong({
        id: query,
        title,
        artist,
        thumbnailUrl: cover,
        duration: '03:45',
        durationSec: 225,
      });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1400px] mx-auto text-white select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Radio className="w-6 h-6 text-cyan-400" />
          <span>Mixes & Radio</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Stasiun radio non-stop yang dipersonalisasi berdasarkan artis dan genre favorit Anda
        </p>
      </div>

      {/* Artist Radios Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Artist Radios</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {TIDAL_ARTIST_RADIOS.map((radio) => (
            <div
              key={radio.id}
              onClick={() => handlePlayQuery(radio.query, `${radio.artist} Radio`, radio.artist, radio.coverImage)}
              className="group cursor-pointer flex flex-col space-y-2"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-cyan-400/40 shadow-lg transition duration-300">
                <img
                  src={radio.coverImage}
                  alt={radio.artist}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                <div className="absolute top-2 right-2 p-1 rounded bg-black/40 backdrop-blur-sm">
                  <TidalDiamonds className="text-cyan-400 w-3.5 h-3.5" />
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-[10px] font-semibold text-white/60">Artist Radio</p>
                  <h3 className="text-sm font-extrabold text-white truncate">{radio.artist}</h3>
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-white truncate group-hover:text-cyan-400">
                {radio.artist}
              </p>
              <p className="text-[11px] text-white/50">{radio.genre}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genre Mixes Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Personalized Mixes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENRE_RADIOS.map((mix) => (
            <div
              key={mix.id}
              onClick={() => handlePlayQuery(mix.query, mix.title, 'Vanz Mix', mix.cover)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 transition cursor-pointer group flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <img
                src={mix.cover}
                alt={mix.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition duration-500 pointer-events-none"
              />
              <div className="relative z-10 flex items-center justify-between">
                <span className="p-2 rounded-lg bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
                  <Radio className="w-4 h-4" />
                </span>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">
                  {mix.title}
                </h3>
                <p className="text-xs text-white/50 mt-1 line-clamp-2">{mix.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
