import React, { useEffect, useRef } from 'react';
import { Song, PlayerState } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

interface YouTubeEngineProps {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
  onError: (errorMsg: string) => void;
  onPlayerReady?: () => void;
}

export const YouTubeEngine: React.FC<YouTubeEngineProps> = ({
  currentSong,
  isPlaying,
  volume,
  isMuted,
  onTimeUpdate,
  onEnded,
  onError,
}) => {
  const playerRef = useRef<any>(null);
  const isApiLoadedRef = useRef(false);
  const timerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isApiLoadedRef.current = true;
      initPlayer();
      return;
    }

    // Load API script
    const existingScript = document.getElementById('youtube-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      isApiLoadedRef.current = true;
      initPlayer();
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initPlayer = () => {
    if (!window.YT || !window.YT.Player || !containerRef.current) return;
    if (playerRef.current) return; // already initialized

    try {
      playerRef.current = new window.YT.Player('yt-audio-player-mount', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(isMuted ? 0 : volume);
            if (currentSong) {
              event.target.loadVideoById(currentSong.id);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (event.data === 0) {
              onEnded();
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player error code:', event.data);
            // Error codes: 2 (invalid param), 5 (HTML5 error), 100 (not found), 101/150 (not allowed embedded)
            if (event.data === 101 || event.data === 150) {
              onError('Video ini tidak mengizinkan pemutaran eksternal. Melewati lagu...');
              setTimeout(() => onEnded(), 1500);
            }
          },
        },
      });
    } catch (err) {
      console.error('Gagal menginisialisasi YouTube Player:', err);
    }
  };

  // When currentSong changes
  useEffect(() => {
    if (!currentSong) return;

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(currentSong.id);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentSong?.id]);

  // Sync Play / Pause
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn('Play/Pause state error:', e);
    }
  }, [isPlaying]);

  // Sync Volume & Mute
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
    try {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    } catch (e) {}
  }, [volume, isMuted]);

  // Time update tick
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === 'function' &&
        typeof playerRef.current.getDuration === 'function'
      ) {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || currentSong?.durationSec || 0;
          onTimeUpdate(cur, dur);
        } catch (e) {}
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSong]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <div id="yt-audio-player-mount" />
    </div>
  );
};
