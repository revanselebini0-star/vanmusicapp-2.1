export interface Song {
  id: string; // YouTube Video ID
  title: string;
  artist: string; // Channel Title / Artist name
  channelId?: string;
  thumbnailUrl: string;
  duration?: string; // Formatted '03:45'
  durationSec?: number; // In seconds
  viewCount?: string; // Formatted '1.2M' or number
  publishedAt?: string;
  description?: string;
  addedAt?: number; // Timestamp when added to playlist
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverGradient: string; // Tailwind gradient class or hex colors
  coverImage?: string;
  songs: Song[];
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

export type ViewTab =
  | 'home'
  | 'listen-now'
  | 'explore'
  | 'browse'
  | 'videos'
  | 'radio'
  | 'playlists'
  | 'albums'
  | 'tracks'
  | 'favorites'
  | 'artists'
  | 'search'
  | 'history'
  | 'playlist-detail';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  queueIndex: number;
  playbackRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  loggedInAt: number;
}

export interface ThemeColors {
  hex: string;
  rgb: string;
  lightHex: string;
  darkHex: string;
  glow: string;
  surfaceGlow: string;
  bgGradient: string;
}

