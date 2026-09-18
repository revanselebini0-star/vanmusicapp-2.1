import { Song } from '../types';

export interface AppleMusicHeroItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  caption: string;
  imageUrl: string;
  badge?: string;
  songToPlay?: Partial<Song>;
}

export const APPLE_MUSIC_HEROES: AppleMusicHeroItem[] = [
  {
    id: 'hero-1',
    category: 'DAFTAR PUTAR YANG DIPERBARUI',
    title: "Today's Hits",
    subtitle: 'Apple Music Hits',
    caption: 'Rasakan audio spasial hits terhangat dari PinkPantheress, Sabrina Carpenter, dan Billie Eilish.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    badge: 'Spatial Audio',
    songToPlay: {
      id: 'ekr2nIex040',
      title: 'PinkPantheress - Boy’s a liar',
      artist: 'PinkPantheress',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      duration: '02:11',
      durationSec: 131,
    },
  },
  {
    id: 'hero-2',
    category: 'ALBUM BARU',
    title: 'New Music Daily',
    subtitle: 'The Weeknd & Playboi Carti',
    caption: 'Dengarkan trek eksklusif terbaru dengan kejernihan lossless tanpa kompromi.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    badge: 'Lossless',
    songToPlay: {
      id: 'fHI8X480mxo',
      title: 'Timeless',
      artist: 'The Weeknd & Playboi Carti',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      duration: '04:16',
      durationSec: 256,
    },
  },
  {
    id: 'hero-3',
    category: 'EKSKLUSIF APPLE MUSIC',
    title: 'A-List Pop',
    subtitle: 'Kompilasi Pop Global Terbaik',
    caption: 'Trek hits dunia nomor 1 minggu ini diracik khusus untuk telinga Anda.',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    badge: 'Hi-Res',
    songToPlay: {
      id: 'ekr2nIex040',
      title: 'APT.',
      artist: 'ROSÉ & Bruno Mars',
      thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
      duration: '02:50',
      durationSec: 170,
    },
  },
];

export const APPLE_MUSIC_RECENT_TRACKS: Song[] = [
  {
    id: 'sb56p3gB2zQ',
    title: 'Dis Badman',
    artist: 'Sammy Virji, Champion & IRAH',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80',
    duration: '03:15',
    durationSec: 195,
  },
  {
    id: 'V1Pl8CzNzCw',
    title: 'Victory Lap Four',
    artist: 'Fred again., Skepta, PlaqueBoyMax',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
    duration: '02:48',
    durationSec: 168,
  },
  {
    id: 'JFcgOboQZ08',
    title: 'ESPÍRITU',
    artist: 'Jotaerre',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&auto=format&fit=crop&q=80',
    duration: '03:04',
    durationSec: 184,
  },
  {
    id: 'kXYiU_JCYtU',
    title: 'Schizo (And The Little Girl)',
    artist: 'Schizo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
    duration: '04:12',
    durationSec: 252,
  },
  {
    id: 'fHI8X480mxo',
    title: 'APT.',
    artist: 'ROSÉ & Bruno Mars',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=200&auto=format&fit=crop&q=80',
    duration: '02:50',
    durationSec: 170,
  },
  {
    id: 'L0MK7qz13bU',
    title: 'Taste',
    artist: 'Sabrina Carpenter',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    duration: '02:37',
    durationSec: 157,
  },
  {
    id: 'eVTXPUF4Oz4',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80',
    duration: '04:11',
    durationSec: 251,
  },
  {
    id: 'd9eCg_2tF7k',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    duration: '03:30',
    durationSec: 210,
  },
];

export interface AppleMusicAlbum {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year: string;
  genre: string;
  explicit?: boolean;
}

export const APPLE_MUSIC_NEW_RELEASES: AppleMusicAlbum[] = [
  {
    id: 'am-alb-1',
    title: 'Short n’ Sweet',
    artist: 'Sabrina Carpenter',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    year: '2024',
    genre: 'Pop',
    explicit: true,
  },
  {
    id: 'am-alb-2',
    title: 'HIT ME HARD AND SOFT',
    artist: 'Billie Eilish',
    coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    year: '2024',
    genre: 'Alternative',
    explicit: false,
  },
  {
    id: 'am-alb-3',
    title: 'GNX',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    year: '2024',
    genre: 'Hip-Hop/Rap',
    explicit: true,
  },
  {
    id: 'am-alb-4',
    title: 'Chromakopia',
    artist: 'Tyler, The Creator',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    year: '2024',
    genre: 'Hip-Hop',
    explicit: true,
  },
];
