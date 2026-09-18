import { Song } from '../types';

export const YOUTUBE_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_YOUTUBE_API_KEY) ||
  'AIzaSyDuRLZTBQx7on7XMjBhIJDaAP5Rbky0Q_I';

// In-memory cache to save API quota and provide instantaneous real-time UI
const cache = new Map<string, { data: Song[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

// Clean up YouTube titles (removes "[Official Music Video]", "(MV)", HTML entities, etc.)
export function cleanTitle(rawTitle: string): { title: string; subtitle?: string } {
  let text = rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  // If title has artist - song format (e.g. "Adele - Easy On Me (Official Video)")
  // Strip common redundant suffixes
  text = text
    .replace(/\s*[\(\[]\s*(Official\s*(Music\s*)?Video|Official\s*Audio|Lyric\s*Video|MV|HD|4K|Visualizer|Audio)\s*[\)\]]/gi, '')
    .replace(/\s*\|\s*(Official\s*Music\s*Video|MV)\s*$/gi, '')
    .trim();

  return { title: text };
}

// Convert ISO 8601 duration string (e.g. PT3M45S) to readable format "03:45"
export function parseDuration(isoDuration: string): { formatted: string; seconds: number } {
  if (!isoDuration) return { formatted: '--:--', seconds: 0 };
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return { formatted: '--:--', seconds: 0 };

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (hours > 0) {
    const paddedM = String(minutes).padStart(2, '0');
    const paddedS = String(seconds).padStart(2, '0');
    return { formatted: `${hours}:${paddedM}:${paddedS}`, seconds: totalSeconds };
  } else {
    const paddedM = String(minutes).padStart(2, '0');
    const paddedS = String(seconds).padStart(2, '0');
    return { formatted: `${paddedM}:${paddedS}`, seconds: totalSeconds };
  }
}

// Format view counts nicely: 1542000 -> "1.5M"
export function formatViews(viewCount?: string | number): string {
  if (!viewCount) return '';
  const num = typeof viewCount === 'string' ? parseInt(viewCount, 10) : viewCount;
  if (isNaN(num)) return '';

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace('.0', '') + 'K';
  }
  return num.toString();
}

// Premium Curated Backup Songs in case of quota limits
export const FALLBACK_TRENDING: Song[] = [
  {
    id: 'KluZgGgD1fE',
    title: 'Komang',
    artist: 'Raim Laode',
    thumbnailUrl: 'https://i.ytimg.com/vi/KluZgGgD1fE/hqdefault.jpg',
    duration: '03:42',
    durationSec: 222,
    viewCount: '158M',
    description: 'Raim Laode - Komang',
  },
  {
    id: '9bZkp7q19f0',
    title: 'Sial',
    artist: 'Mahalini',
    thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    duration: '04:03',
    durationSec: 243,
    viewCount: '124M',
    description: 'Mahalini - Sial',
  },
  {
    id: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    thumbnailUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    duration: '02:47',
    durationSec: 167,
    viewCount: '780M',
    description: 'Harry Styles - As It Was',
  },
  {
    id: 'kffacxfA7G4',
    title: 'Baby Doll',
    artist: 'Justin Bieber',
    thumbnailUrl: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg',
    duration: '03:15',
    durationSec: 195,
    viewCount: '450M',
    description: 'Top Hits',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    duration: '04:41',
    durationSec: 281,
    viewCount: '8.4B',
    description: 'Global Latin Pop Sensation',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    duration: '05:59',
    durationSec: 359,
    viewCount: '1.7B',
    description: 'Queen - Legendary Rock Anthem',
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    thumbnailUrl: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    duration: '04:30',
    durationSec: 270,
    viewCount: '5.1B',
    description: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
  },
  {
    id: '09R8_2nJtjg',
    title: 'Sugar',
    artist: 'Maroon 5',
    thumbnailUrl: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
    duration: '05:01',
    durationSec: 301,
    viewCount: '4.0B',
    description: 'Maroon 5 - Sugar',
  },
];

export async function fetchTrendingMusic(regionCode: string = 'ID'): Promise<Song[]> {
  const cacheKey = `trending_${regionCode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Try primary YouTube Data API v3 mostPopular music chart
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${regionCode}&videoCategoryId=10&maxResults=30&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const songs: Song[] = data.items.map((item: any) => {
        const { formatted, seconds } = parseDuration(item.contentDetails?.duration || '');
        const { title } = cleanTitle(item.snippet?.title || '');
        return {
          id: item.id,
          title,
          artist: item.snippet?.channelTitle || 'Artis',
          channelId: item.snippet?.channelId,
          thumbnailUrl:
            item.snippet?.thumbnails?.maxres?.url ||
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          duration: formatted,
          durationSec: seconds,
          viewCount: formatViews(item.statistics?.viewCount),
          publishedAt: item.snippet?.publishedAt,
          description: item.snippet?.description,
        };
      });

      cache.set(cacheKey, { data: songs, timestamp: Date.now() });
      return songs;
    }

    // Secondary fallback: if category 10 isn't available for this region, search for top trending music
    const fallbackSearchSongs = await searchYouTubeMusic(`trending music ${regionCode}`, false);
    if (fallbackSearchSongs.length > 0) {
      cache.set(cacheKey, { data: fallbackSearchSongs, timestamp: Date.now() });
      return fallbackSearchSongs;
    }

    return FALLBACK_TRENDING;
  } catch (err) {
    console.warn('Gagal memuat musik trending dari YouTube API, memakai curated fallback:', err);
    return FALLBACK_TRENDING;
  }
}

export async function searchYouTubeMusic(query: string, useCache: boolean = true): Promise<Song[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = `search_${cleanQuery.toLowerCase()}`;
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    // 1. Perform search query
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=25&q=${encodeURIComponent(
      cleanQuery
    )}&key=${YOUTUBE_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      // If no music-category results, retry without videoCategoryId=10 constraint
      const fallbackUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(
        cleanQuery + ' music'
      )}&key=${YOUTUBE_API_KEY}`;
      const fbRes = await fetch(fallbackUrl);
      const fbData = await fbRes.json();
      if (!fbData.items || fbData.items.length === 0) return [];
      searchData.items = fbData.items;
    }

    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) return [];

    // 2. Fetch video details for durations and view counts
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    const detailMap = new Map<string, any>();
    if (detailsData.items) {
      detailsData.items.forEach((item: any) => detailMap.set(item.id, item));
    }

    const songs: Song[] = searchData.items
      .map((item: any) => {
        const id = item.id?.videoId;
        if (!id) return null;
        const details = detailMap.get(id);
        const { formatted, seconds } = parseDuration(details?.contentDetails?.duration || '');
        const { title } = cleanTitle(item.snippet?.title || '');

        return {
          id,
          title,
          artist: item.snippet?.channelTitle || 'Artis',
          channelId: item.snippet?.channelId,
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: formatted !== '--:--' ? formatted : '03:30',
          durationSec: seconds || 210,
          viewCount: formatViews(details?.statistics?.viewCount),
          publishedAt: item.snippet?.publishedAt,
          description: item.snippet?.description,
        };
      })
      .filter((s: any): s is Song => Boolean(s));

    cache.set(cacheKey, { data: songs, timestamp: Date.now() });
    return songs;
  } catch (err) {
    console.error('Error saat melakukan pencarian YouTube music:', err);
    // Filter fallback list if matching
    const matching = FALLBACK_TRENDING.filter(
      (s) =>
        s.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    return matching.length > 0 ? matching : FALLBACK_TRENDING.slice(0, 4);
  }
}

export const searchYouTube = searchYouTubeMusic;
