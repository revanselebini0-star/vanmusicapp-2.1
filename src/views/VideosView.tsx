import React from 'react';
import { Play, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { Song } from '../types';

interface VideosViewProps {
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
}

const FEATURED_VIDEOS: VideoItem[] = [
  {
    id: 'KluZgGgD1fE',
    title: 'Komang (Official Music Video)',
    artist: 'Raim Laode',
    thumbnail: 'https://i.ytimg.com/vi/KluZgGgD1fE/hqdefault.jpg',
    duration: '03:42',
    views: '158M views',
    category: 'Trending Indonesia',
  },
  {
    id: 'H5v3kku4y6Q',
    title: 'As It Was (Official Video)',
    artist: 'Harry Styles',
    thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    duration: '02:47',
    views: '710M views',
    category: 'Global Hits',
  },
  {
    id: 'kffacxfA7G4',
    title: 'Baby (Official Music Video)',
    artist: 'Justin Bieber',
    thumbnail: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg',
    duration: '03:39',
    views: '3.1B views',
    category: 'Pop Classics',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody (Official Video)',
    artist: 'Queen',
    thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    duration: '06:00',
    views: '1.7B views',
    category: 'Rock Legends',
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Shape of You (Official Music Video)',
    artist: 'Ed Sheeran',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: '04:23',
    views: '6.2B views',
    category: 'Global Hits',
  },
  {
    id: '09R8_2nJtjg',
    title: 'Sugar (Official Music Video)',
    artist: 'Maroon 5',
    thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
    duration: '05:01',
    views: '4.0B views',
    category: 'Pop Classics',
  },
];

export const VideosView: React.FC<VideosViewProps> = ({ onPlaySong, currentSong, isPlaying }) => {
  const handlePlayVideo = (video: VideoItem) => {
    onPlaySong({
      id: video.id,
      title: video.title,
      artist: video.artist,
      thumbnailUrl: video.thumbnail,
      duration: video.duration,
      durationSec: 240,
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto text-white select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Film className="w-6 h-6 text-cyan-400" />
          <span>Music Videos</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Koleksi video musik resmi HD & penampilan langsung artis dunia
        </p>
      </div>

      {/* Featured Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURED_VIDEOS.map((video) => {
          const isCurrent = currentSong?.id === video.id;

          return (
            <div
              key={video.id}
              onClick={() => handlePlayVideo(video)}
              className="group cursor-pointer flex flex-col space-y-2.5"
            >
              {/* 16:9 Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-cyan-400/40 shadow-lg transition duration-300">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                  {video.duration}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px] transition duration-200">
                  <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-400/40">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {isCurrent && isPlaying && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold shadow">
                    Sedang Diputar
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div>
                <h3
                  className={`text-sm font-bold truncate group-hover:text-cyan-400 transition ${
                    isCurrent ? 'text-cyan-400' : 'text-white'
                  }`}
                >
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                  <span className="font-semibold text-white/70">{video.artist}</span>
                  <span>•</span>
                  <span>{video.views}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
