export interface ArtistRadioItem {
  id: string;
  artist: string;
  genre: string;
  coverImage: string;
  bgGradient: string;
  query: string;
}

export interface SuggestedAlbumItem {
  id: string;
  title: string;
  artist: string;
  year: string;
  coverImage: string;
  isExplicit?: boolean;
  query: string;
}

export interface RecommendedTrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  coverImage: string;
  isExplicit?: boolean;
  youtubeQuery: string;
  videoId?: string;
}

export const TIDAL_ARTIST_RADIOS: ArtistRadioItem[] = [
  {
    id: 'radio-judas-priest',
    artist: 'Judas Priest',
    genre: 'Heavy Metal',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-blue-900/60 to-slate-900/80',
    query: 'Judas Priest greatest hits',
  },
  {
    id: 'radio-exodus',
    artist: 'Exodus',
    genre: 'Thrash Metal',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-amber-950/60 to-zinc-900/80',
    query: 'Exodus thrash metal songs',
  },
  {
    id: 'radio-iron-maiden',
    artist: 'Iron Maiden',
    genre: 'Classic Metal',
    coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-red-950/60 to-neutral-900/80',
    query: 'Iron Maiden greatest hits',
  },
  {
    id: 'radio-pantera',
    artist: 'Pantera',
    genre: 'Groove Metal',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-yellow-950/60 to-stone-900/80',
    query: 'Pantera greatest hits',
  },
  {
    id: 'radio-anthrax',
    artist: 'Anthrax',
    genre: 'Thrash Metal',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-stone-900/70 to-zinc-950/80',
    query: 'Anthrax greatest hits',
  },
  {
    id: 'radio-black-label',
    artist: 'Black Label Society',
    genre: 'Hard Rock',
    coverImage: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-amber-900/50 to-neutral-900/80',
    query: 'Black Label Society best songs',
  },
  {
    id: 'radio-testament',
    artist: 'Testament',
    genre: 'Thrash Metal',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-red-900/50 to-zinc-900/80',
    query: 'Testament thrash metal',
  },
  {
    id: 'radio-alter-bridge',
    artist: 'Alter Bridge',
    genre: 'Alternative Metal',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    bgGradient: 'from-rose-950/60 to-slate-900/80',
    query: 'Alter Bridge Pawns and Kings',
  },
];

export const TIDAL_SUGGESTED_ALBUMS: SuggestedAlbumItem[] = [
  {
    id: 'album-exodus-british',
    title: "British Disaster: The Battle of '89",
    artist: 'Exodus',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    isExplicit: true,
    query: "Exodus British Disaster The Battle of '89 full album",
  },
  {
    id: 'album-another-michael',
    title: 'Pick Me Up, Turn Me Upside Down',
    artist: 'Another Michael',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    isExplicit: true,
    query: 'Another Michael Pick Me Up Turn Me Upside Down album',
  },
  {
    id: 'album-ateez-golden',
    title: 'GOLDEN HOUR : Part.1',
    artist: 'ATEEZ',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    isExplicit: false,
    query: 'ATEEZ Golden Hour Part 1 full album',
  },
  {
    id: 'album-winnetka-shalala',
    title: 'Sha La La',
    artist: 'Winnetka Bowling League',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    isExplicit: false,
    query: 'Winnetka Bowling League Sha La La',
  },
  {
    id: 'album-project-freedom',
    title: 'Project Freedom',
    artist: 'Jordan Hamilton',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    isExplicit: true,
    query: 'Jordan Hamilton Project Freedom album',
  },
  {
    id: 'album-whats-the-point',
    title: "What's The Point",
    artist: 'Ruby Waters',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    isExplicit: true,
    query: 'Ruby Waters Whats The Point album',
  },
  {
    id: 'album-duo-shum',
    title: 'Duo Shum',
    artist: 'Lisa Strauss, Anastasia Kobekina',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    isExplicit: false,
    query: 'Duo Shum Lisa Strauss Anastasia Kobekina',
  },
];

export const TIDAL_RECOMMENDED_TRACKS: RecommendedTrackItem[] = [
  {
    id: 'track-dont-want-you',
    title: 'dont want you',
    artist: 'Yuto.',
    album: 'dont want you',
    duration: '2:20',
    durationSec: 140,
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    isExplicit: false,
    youtubeQuery: 'Yuto dont want you',
  },
  {
    id: 'track-sol',
    title: 'SOL',
    artist: 'Tokischa',
    album: 'SOL',
    duration: '2:52',
    durationSec: 172,
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
    isExplicit: true,
    youtubeQuery: 'Tokischa SOL official',
  },
  {
    id: 'track-pawns-and-kings',
    title: 'Pawns & Kings',
    artist: 'Alter Bridge',
    album: 'Pawns & Kings',
    duration: '4:18',
    durationSec: 258,
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    isExplicit: false,
    youtubeQuery: 'Alter Bridge Pawns & Kings official audio',
  },
  {
    id: 'track-painkiller',
    title: 'Painkiller',
    artist: 'Judas Priest',
    album: 'Painkiller',
    duration: '6:06',
    durationSec: 366,
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    isExplicit: false,
    youtubeQuery: 'Judas Priest Painkiller official',
  },
  {
    id: 'track-walk',
    title: 'Walk',
    artist: 'Pantera',
    album: 'Vulgar Display of Power',
    duration: '5:15',
    durationSec: 315,
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    isExplicit: true,
    youtubeQuery: 'Pantera Walk official music video',
  },
  {
    id: 'track-the-trooper',
    title: 'The Trooper',
    artist: 'Iron Maiden',
    album: 'Piece of Mind',
    duration: '4:12',
    durationSec: 252,
    coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
    isExplicit: false,
    youtubeQuery: 'Iron Maiden The Trooper official video',
  },
];
