export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  plainLyrics?: string;
  syncedLyrics?: LyricLine[];
  source: string;
  trackName?: string;
  artistName?: string;
  instrumental?: boolean;
}

const lyricsCache = new Map<string, LyricsData | null>();

/**
 * Clean title by removing YouTube noise like (Official Music Video), [MV], etc.
 */
export function cleanTitle(title: string): string {
  return title
    .replace(/[\(\[\{].*?(official|video|audio|lyric|mv|hd|hq|remastered|version|visualizer|clip|feat|ft\.).*?[\)\]\}]/gi, '')
    .replace(/\b(official music video|official video|official lyric video|official audio|music video|lyric video)\b/gi, '')
    .replace(/[\|•\-–].*?(official|video|audio|lyrics?).*?$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse standard LRC formatted lyrics string into time-coded lines
 */
export function parseLrc(lrcContent: string): LyricLine[] {
  if (!lrcContent) return [];
  const lines = lrcContent.split('\n');
  const result: LyricLine[] = [];

  const timeRegex = /\[(\d{2,}):(\d{2}(?:\.\d{1,3})?)\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      const text = trimmed.replace(timeRegex, '').trim();
      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const totalSeconds = minutes * 60 + seconds;
        result.push({
          time: totalSeconds,
          text: text || '♪',
        });
      }
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Fetch real song lyrics from LRCLIB open database
 */
export async function fetchLyrics(
  title: string,
  artist: string,
  durationSec?: number,
  customQuery?: string
): Promise<LyricsData | null> {
  const query = customQuery || `${cleanTitle(title)} ${artist}`.trim();
  const cacheKey = query.toLowerCase();

  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey) || null;
  }

  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AppleMusicCloneApp/1.0 (web app client)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      // Fallback: try searching just with cleaned title
      const cleaned = cleanTitle(title);
      if (cleaned && cleaned !== query) {
        const fallbackUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleaned)}`;
        const fbRes = await fetch(fallbackUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (Array.isArray(fbData) && fbData.length > 0) {
            return processRecord(fbData[0], cacheKey);
          }
        }
      }
      lyricsCache.set(cacheKey, null);
      return null;
    }

    // Try finding the record that best matches duration if durationSec is provided
    let bestRecord = data[0];
    if (durationSec && durationSec > 0) {
      const matched = data.find((r: any) => Math.abs((r.duration || 0) - durationSec) <= 5);
      if (matched) {
        bestRecord = matched;
      }
    }

    return processRecord(bestRecord, cacheKey);
  } catch (err) {
    console.warn('Gagal memuat lirik:', err);
    return null;
  }
}

function processRecord(record: any, cacheKey: string): LyricsData {
  const parsedSynced = record.syncedLyrics ? parseLrc(record.syncedLyrics) : undefined;
  const result: LyricsData = {
    plainLyrics: record.plainLyrics,
    syncedLyrics: parsedSynced && parsedSynced.length > 0 ? parsedSynced : undefined,
    source: 'LRCLIB',
    trackName: record.trackName,
    artistName: record.artistName,
    instrumental: Boolean(record.instrumental),
  };

  lyricsCache.set(cacheKey, result);
  return result;
}
