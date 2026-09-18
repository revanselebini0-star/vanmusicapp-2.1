import { Playlist, Song } from '../types';

const PLAYLISTS_KEY = 'apple_music_playlists';
const FAVORITES_KEY = 'apple_music_favorites';
const HISTORY_KEY = 'apple_music_history';

// Default starter playlists for instant delight
const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'fav-1',
    title: 'Favorit Saya',
    description: 'Kumpulan lagu dan video musik terbaik yang Anda sukai.',
    coverGradient: 'from-rose-500 to-red-600',
    songs: [],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'chill-1',
    title: 'Santai Sore & Akustik',
    description: 'Melodi hangat untuk menemani waktu santai, belajar, dan relaksasi.',
    coverGradient: 'from-amber-400 to-orange-600',
    songs: [
      {
        id: '5qap5aO4i9A',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        artist: 'Lofi Girl',
        thumbnailUrl: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
        duration: 'Live',
        durationSec: 0,
        viewCount: '65M',
        addedAt: Date.now() - 10000,
      },
      {
        id: 'jfKfPfyJRdk',
        title: 'lofi hip hop radio - beats to sleep/chill to',
        artist: 'Lofi Girl',
        thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
        duration: 'Live',
        durationSec: 0,
        viewCount: '34M',
        addedAt: Date.now() - 20000,
      },
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    isDefault: false,
  },
  {
    id: 'top-indo-1',
    title: 'Top Hits Indonesia',
    description: 'Daftar lagu pop dan indie Indonesia terpopuler pilihan Vanz Music.',
    coverGradient: 'from-fuchsia-600 to-pink-500',
    songs: [
      {
        id: 'KluZgGgD1fE',
        title: 'Komang - Raim Laode (Official Music Video)',
        artist: 'Raim Laode',
        thumbnailUrl: 'https://i.ytimg.com/vi/KluZgGgD1fE/hqdefault.jpg',
        duration: '03:42',
        durationSec: 222,
        viewCount: '150M',
        addedAt: Date.now() - 30000,
      },
      {
        id: '9bZkp7q19f0',
        title: 'Sial - Mahalini (Official Music Video)',
        artist: 'HITS Records',
        thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
        duration: '04:03',
        durationSec: 243,
        viewCount: '120M',
        addedAt: Date.now() - 40000,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    isDefault: false,
  },
];

export const GRADIENT_PRESETS = [
  'from-rose-500 to-pink-600',
  'from-red-600 to-orange-500',
  'from-amber-400 to-orange-600',
  'from-emerald-500 to-teal-700',
  'from-cyan-500 to-blue-600',
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-indigo-800',
  'from-fuchsia-500 to-rose-600',
  'from-zinc-700 to-zinc-900',
];

class LocalDatabase {
  // --- PLAYLISTS ---
  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(PLAYLISTS_KEY);
      if (!data) {
        this.savePlaylists(DEFAULT_PLAYLISTS);
        return DEFAULT_PLAYLISTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PLAYLISTS;
    }
  }

  savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (err) {
      console.error('Gagal menyimpan playlist ke database lokal:', err);
    }
  }

  createPlaylist(title: string, description: string = '', coverGradient?: string): Playlist {
    const playlists = this.getPlaylists();
    const randomGradient =
      coverGradient ||
      GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];

    const newPlaylist: Playlist = {
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim() || 'Playlist Baru',
      description: description.trim(),
      coverGradient: randomGradient,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
    };

    playlists.unshift(newPlaylist);
    this.savePlaylists(playlists);
    return newPlaylist;
  }

  updatePlaylist(
    id: string,
    updates: Partial<Pick<Playlist, 'title' | 'description' | 'coverGradient' | 'coverImage'>>
  ): Playlist | null {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex((p) => p.id === id);
    if (index === -1) return null;

    playlists[index] = {
      ...playlists[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.savePlaylists(playlists);
    return playlists[index];
  }

  deletePlaylist(id: string): boolean {
    const playlists = this.getPlaylists();
    const filtered = playlists.filter((p) => p.id !== id);
    if (filtered.length !== playlists.length) {
      this.savePlaylists(filtered);
      return true;
    }
    return false;
  }

  addSongToPlaylist(playlistId: string, song: Song): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;

    // Avoid duplicate song in same playlist
    if (playlist.songs.some((s) => s.id === song.id)) {
      return false;
    }

    playlist.songs.unshift({
      ...song,
      addedAt: Date.now(),
    });
    playlist.updatedAt = Date.now();
    this.savePlaylists(playlists);
    return true;
  }

  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;

    const initialLen = playlist.songs.length;
    playlist.songs = playlist.songs.filter((s) => s.id !== songId);
    if (playlist.songs.length !== initialLen) {
      playlist.updatedAt = Date.now();
      this.savePlaylists(playlists);
      return true;
    }
    return false;
  }

  // --- FAVORITES ---
  getFavorites(): Song[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveFavorites(songs: Song[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(songs));
    } catch (err) {
      console.error('Gagal menyimpan favorit:', err);
    }
  }

  toggleFavorite(song: Song): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((s) => s.id === song.id);
    let isNowFav = false;

    if (index >= 0) {
      favorites.splice(index, 1);
      isNowFav = false;
    } else {
      favorites.unshift({ ...song, addedAt: Date.now() });
      isNowFav = true;
    }

    this.saveFavorites(favorites);

    // Sync with default Favorit playlist if exists
    const playlists = this.getPlaylists();
    const favPlaylist = playlists.find((p) => p.isDefault || p.title === 'Favorit Saya');
    if (favPlaylist) {
      if (isNowFav) {
        if (!favPlaylist.songs.some((s) => s.id === song.id)) {
          favPlaylist.songs.unshift({ ...song, addedAt: Date.now() });
        }
      } else {
        favPlaylist.songs = favPlaylist.songs.filter((s) => s.id !== song.id);
      }
      this.savePlaylists(playlists);
    }

    return isNowFav;
  }

  isFavorite(songId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((s) => s.id === songId);
  }

  // --- HISTORY ---
  getHistory(): Song[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addToHistory(song: Song): void {
    try {
      let history = this.getHistory();
      // Remove previous occurrence
      history = history.filter((s) => s.id !== song.id);
      // Put at top
      history.unshift({ ...song, addedAt: Date.now() });
      // Keep max 50 items
      if (history.length > 50) history = history.slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Gagal menyimpan riwayat putar:', err);
    }
  }

  clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  // --- EXPORT & IMPORT ---
  exportData(): string {
    const data = {
      playlists: this.getPlaylists(),
      favorites: this.getFavorites(),
      history: this.getHistory(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.playlists)) {
        this.savePlaylists(data.playlists);
        if (Array.isArray(data.favorites)) this.saveFavorites(data.favorites);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal mengimpor data:', err);
      return false;
    }
  }
}

export const db = new LocalDatabase();
