import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Player } from './components/Player';
import { YouTubeEngine } from './components/YouTubeEngine';
import { QueueDrawer } from './components/QueueDrawer';
import { VideoModal } from './components/VideoModal';
import { CreatePlaylistModal, AddToPlaylistModal } from './components/PlaylistModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ListenNowView } from './views/ListenNowView';
import { BrowseView } from './views/BrowseView';
import { SearchView } from './views/SearchView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { FavoritesView } from './views/FavoritesView';
import { HistoryView } from './views/HistoryView';
import { ViewTab, Song, Playlist, PlayerState, RepeatMode } from './types';
import { db } from './services/db';
import { fetchTrendingMusic, searchYouTubeMusic } from './services/youtube';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<ViewTab>('listen-now');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Region & Trending state
  const [selectedRegion, setSelectedRegion] = useState<string>('ID');
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);

  // Real-time Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Database States
  const [playlists, setPlaylists] = useState<Playlist[]>(() => db.getPlaylists());
  const [favorites, setFavorites] = useState<Song[]>(() => db.getFavorites());
  const [history, setHistory] = useState<Song[]>(() => db.getHistory());

  // Player State
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    repeatMode: 'off',
    isShuffle: false,
    queue: [],
    queueIndex: 0,
    playbackRate: 1,
  });

  // UI Modals & Drawers
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Fetch Trending Music on mount and when region changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTrending(true);

    fetchTrendingMusic(selectedRegion)
      .then((songs) => {
        if (isMounted) {
          setTrendingSongs(songs);
          setIsLoadingTrending(false);

          // If no current song, cue first trending song as default
          setPlayerState((prev) => {
            if (!prev.currentSong && songs.length > 0) {
              return {
                ...prev,
                currentSong: songs[0],
                queue: songs,
                queueIndex: 0,
              };
            }
            return prev;
          });
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingTrending(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRegion]);

  // 2. Real-time Search with Debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      searchYouTubeMusic(q)
        .then((songs) => {
          setSearchResults(songs);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 380);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Refresh playlists and favorites from DB
  const refreshDbData = useCallback(() => {
    setPlaylists(db.getPlaylists());
    setFavorites(db.getFavorites());
    setHistory(db.getHistory());
  }, []);

  // --- Audio Player Handlers ---
  const handlePlaySong = (song: Song, customQueue?: Song[]) => {
    db.addToHistory(song);
    setHistory(db.getHistory());

    setPlayerState((prev) => {
      const activeQueue = customQueue || (prev.queue.length > 0 ? prev.queue : [song]);
      let idx = activeQueue.findIndex((s) => s.id === song.id);
      if (idx === -1) {
        activeQueue.push(song);
        idx = activeQueue.length - 1;
      }

      return {
        ...prev,
        currentSong: song,
        isPlaying: true,
        currentTime: 0,
        duration: song.durationSec || 210,
        queue: activeQueue,
        queueIndex: idx,
      };
    });
  };

  const handlePlayAll = (songs: Song[], shuffle: boolean = false) => {
    if (!songs || songs.length === 0) return;
    let queueSongs = [...songs];
    if (shuffle) {
      queueSongs = queueSongs.sort(() => Math.random() - 0.5);
    }
    handlePlaySong(queueSongs[0], queueSongs);
    showToast(`Memutar ${queueSongs.length} lagu ${shuffle ? '(Mode Acak)' : ''}`);
  };

  const handleTogglePlay = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleNextTrack = () => {
    setPlayerState((prev) => {
      const { queue, queueIndex, repeatMode, isShuffle } = prev;
      if (queue.length === 0) return prev;

      if (repeatMode === 'one') {
        return { ...prev, currentTime: 0, isPlaying: true };
      }

      let nextIndex = queueIndex + 1;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return { ...prev, isPlaying: false };
        }
      }

      const nextSong = queue[nextIndex];
      if (nextSong) {
        db.addToHistory(nextSong);
        setHistory(db.getHistory());
      }

      return {
        ...prev,
        currentSong: nextSong,
        queueIndex: nextIndex,
        currentTime: 0,
        isPlaying: true,
        duration: nextSong?.durationSec || 210,
      };
    });
  };

  const handlePrevTrack = () => {
    setPlayerState((prev) => {
      const { queue, queueIndex, currentTime } = prev;
      if (currentTime > 4) {
        return { ...prev, currentTime: 0 };
      }
      if (queue.length === 0) return prev;

      let prevIndex = queueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }
      const prevSong = queue[prevIndex];
      return {
        ...prev,
        currentSong: prevSong,
        queueIndex: prevIndex,
        currentTime: 0,
        isPlaying: true,
        duration: prevSong?.durationSec || 210,
      };
    });
  };

  const handleSeek = (seconds: number) => {
    setPlayerState((prev) => ({ ...prev, currentTime: seconds }));
  };

  const handleVolumeChange = (vol: number) => {
    setPlayerState((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
  };

  const handleToggleMute = () => {
    setPlayerState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleToggleShuffle = () => {
    setPlayerState((prev) => {
      const newShuffle = !prev.isShuffle;
      showToast(newShuffle ? 'Mode Acak Aktif' : 'Mode Acak Nonaktif');
      return { ...prev, isShuffle: newShuffle };
    });
  };

  const handleToggleRepeat = () => {
    setPlayerState((prev) => {
      let nextMode: RepeatMode = 'off';
      if (prev.repeatMode === 'off') nextMode = 'all';
      else if (prev.repeatMode === 'all') nextMode = 'one';
      else nextMode = 'off';

      const label =
        nextMode === 'one'
          ? 'Ulangi 1 Lagu'
          : nextMode === 'all'
          ? 'Ulangi Semua Lagu'
          : 'Ulangi Nonaktif';
      showToast(label);
      return { ...prev, repeatMode: nextMode };
    });
  };

  const handleToggleFavorite = (song: Song) => {
    const isNow = db.toggleFavorite(song);
    refreshDbData();
    showToast(isNow ? `"${song.title}" ditambahkan ke Favorit` : `Dihapus dari Favorit`);
  };

  const handleSelectPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setCurrentTab('playlist-detail');
  };

  const handleSelectGenre = (genreQuery: string) => {
    setSearchQuery(genreQuery);
    setSelectedPlaylistId(null);
    setCurrentTab('search');
  };

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-[#ffffff] font-sans antialiased select-none">
      {/* Background YouTube Audio Engine (invisible headless player) */}
      <YouTubeEngine
        currentSong={playerState.currentSong}
        isPlaying={playerState.isPlaying}
        volume={playerState.volume}
        isMuted={playerState.isMuted}
        onTimeUpdate={(cur, dur) => {
          setPlayerState((prev) => ({
            ...prev,
            currentTime: cur,
            duration: dur > 0 ? dur : prev.duration,
          }));
        }}
        onEnded={handleNextTrack}
        onError={(err) => showToast(err)}
      />

      {/* Main Container: Split Panels in modern Spotify desktop style */}
      <div className="flex flex-1 min-h-0 overflow-hidden md:p-2 md:gap-2">
        {/* Left Sidebar (Desktop + Mobile Slide-over Drawer) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setSelectedPlaylistId(null);
            setCurrentTab(tab);
          }}
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={handleSelectPlaylist}
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          onPlaylistDataChanged={refreshDbData}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area Panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative md:rounded-lg bg-[#121212]">
          {/* Top Bar with real-time search & mobile menu toggle */}
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            currentTab={currentTab}
            onOpenSearchTab={() => {
              setSelectedPlaylistId(null);
              setCurrentTab('search');
            }}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          {/* Dynamic View Panel */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-44 md:pb-6 select-text">
            {currentTab === 'listen-now' && !selectedPlaylistId && (
            <ListenNowView
              trendingSongs={trendingSongs}
              isLoading={isLoadingTrending}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
              onNavigateToBrowse={() => setCurrentTab('browse')}
              playlists={playlists}
              onSelectPlaylist={handleSelectPlaylist}
            />
          )}

          {currentTab === 'browse' && !selectedPlaylistId && (
            <BrowseView
              trendingSongs={trendingSongs}
              isLoading={isLoadingTrending}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
              onSelectGenre={handleSelectGenre}
            />
          )}

          {currentTab === 'search' && !selectedPlaylistId && (
            <SearchView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentTab === 'favorites' && !selectedPlaylistId && (
            <FavoritesView
              favorites={favorites}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
              onNavigateToBrowse={() => setCurrentTab('browse')}
            />
          )}

          {currentTab === 'history' && !selectedPlaylistId && (
            <HistoryView
              history={history}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
              onClearHistory={() => {
                db.clearHistory();
                refreshDbData();
                showToast('Riwayat pemutaran dibersihkan');
              }}
              onNavigateToBrowse={() => setCurrentTab('browse')}
            />
          )}

          {currentTab === 'playlist-detail' && activePlaylist && (
            <PlaylistDetailView
              playlist={activePlaylist}
              currentSong={playerState.currentSong}
              isPlaying={playerState.isPlaying}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onOpenAddToPlaylist={setSongToAddToPlaylist}
              onToggleFavorite={handleToggleFavorite}
              onPlaylistUpdated={refreshDbData}
              onPlaylistDeleted={() => {
                setSelectedPlaylistId(null);
                setCurrentTab('listen-now');
                refreshDbData();
                showToast('Playlist berhasil dihapus');
              }}
              onNavigateToBrowse={() => setCurrentTab('browse')}
            />
          )}
        </main>
      </div>
    </div>

      {/* Full-width Spotify Bottom Player Bar */}
      <Player
        playerState={playerState}
        onPlaySong={handlePlaySong}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onOpenAddToPlaylist={setSongToAddToPlaylist}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isQueueOpen={isQueueOpen}
        onToggleVideoModal={() => setIsVideoModalOpen(!isVideoModalOpen)}
        isVideoModalOpen={isVideoModalOpen}
      />

      {/* Up Next Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={playerState.queue}
        currentSong={playerState.currentSong}
        onPlaySong={handlePlaySong}
        onRemoveFromQueue={(idx) => {
          setPlayerState((prev) => {
            const q = [...prev.queue];
            q.splice(idx, 1);
            return { ...prev, queue: q };
          });
        }}
        onClearQueue={() => {
          setPlayerState((prev) => ({
            ...prev,
            queue: prev.currentSong ? [prev.currentSong] : [],
            queueIndex: 0,
          }));
        }}
      />

      {/* Expanded Full Screen Album Cover & Real Lyrics Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        song={playerState.currentSong}
        onOpenAddToPlaylist={setSongToAddToPlaylist}
        isPlaying={playerState.isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        currentTime={playerState.currentTime}
        duration={playerState.duration}
        onSeek={handleSeek}
        isShuffle={playerState.isShuffle}
        repeatMode={playerState.repeatMode}
        volume={playerState.volume}
        isMuted={playerState.isMuted}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreated={(newPl) => {
          refreshDbData();
          handleSelectPlaylist(newPl.id);
          showToast(`Playlist "${newPl.title}" berhasil dibuat!`);
        }}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={Boolean(songToAddToPlaylist)}
        song={songToAddToPlaylist}
        onClose={() => setSongToAddToPlaylist(null)}
        onPlaylistUpdated={refreshDbData}
        onRequestCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedPlaylistId(null);
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onOpenLibraryMenu={() => setIsMobileMenuOpen(true)}
        favoriteCount={favorites.length}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-40 md:bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#1c1c24]/95 border border-white/15 text-white text-xs font-semibold shadow-2xl backdrop-blur-lg animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
