import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Trash2,
  Edit2,
  Music,
  Plus,
  Clock,
  ListMusic,
  Save,
  Check,
} from 'lucide-react';
import { Playlist, Song } from '../types';
import { SongRow } from '../components/SongItems';
import { db } from '../services/db';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAll: (songs: Song[], shuffle?: boolean) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onPlaylistUpdated: () => void;
  onPlaylistDeleted: () => void;
  onNavigateToBrowse: () => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAll,
  onOpenAddToPlaylist,
  onToggleFavorite,
  onPlaylistUpdated,
  onPlaylistDeleted,
  onNavigateToBrowse,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || '');

  // Calculate total duration in seconds
  const totalSeconds = playlist.songs.reduce((acc, s) => acc + (s.durationSec || 210), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const durationText =
    totalHours > 0 ? `${totalHours} jam ${totalMinutes} menit` : `${totalMinutes} menit`;

  const handleSaveEdit = () => {
    if (!title.trim()) return;
    db.updatePlaylist(playlist.id, { title, description });
    setIsEditing(false);
    onPlaylistUpdated();
  };

  const handleDeletePlaylist = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus playlist "${playlist.title}"?`)) {
      db.deletePlaylist(playlist.id);
      onPlaylistDeleted();
    }
  };

  const handleRemoveSong = (songId: string) => {
    db.removeSongFromPlaylist(playlist.id, songId);
    onPlaylistUpdated();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Apple Music styled Playlist Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-6 md:gap-8 pb-6 border-b border-white/5">
        {/* Large Gradient Artwork */}
        <div
          className={`w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br ${playlist.coverGradient} flex items-center justify-center shadow-2xl shadow-black/60 shrink-0 border border-white/10 relative group`}
        >
          <Music className="w-14 h-14 sm:w-20 sm:h-20 text-white/80" />
        </div>

        {/* Playlist Meta Details */}
        <div className="flex-1 text-center md:text-left min-w-0 w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Daftar Putar Pribadi
          </span>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl sm:text-2xl font-bold bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-accent"
                placeholder="Judul Playlist"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-xs bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-accent resize-none"
                placeholder="Deskripsi..."
              />
              <div className="flex gap-2 justify-center md:justify-start">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-1 mb-2 truncate">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-xs sm:text-sm text-white/60 line-clamp-2 max-w-xl mb-3">
                  {playlist.description}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-white/40 font-medium">
                <span className="text-white/80 font-semibold">{playlist.songs.length} lagu</span>
                {playlist.songs.length > 0 && <span>• {durationText}</span>}
                <span>• Tersimpan di database lokal</span>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={() => onPlayAll(playlist.songs, false)}
              disabled={playlist.songs.length === 0}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-accent hover:bg-accent-light disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent flex items-center gap-2 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Putar Semua</span>
            </button>

            <button
              onClick={() => onPlayAll(playlist.songs, true)}
              disabled={playlist.songs.length === 0}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm border border-white/10 flex items-center gap-2 active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4" />
              <span>Acak</span>
            </button>

            {!playlist.isDefault && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition"
                  title="Ubah Nama/Deskripsi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeletePlaylist}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 transition"
                  title="Hapus Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Songs Table */}
      <div className="space-y-2">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white/3 rounded-2xl border border-white/5 p-6">
            <ListMusic className="w-12 h-12 mx-auto text-white/20" />
            <h3 className="text-base font-semibold text-white/70">Playlist Ini Masih Kosong</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Cari lagu atau telusuri musik trending, lalu klik tombol '+' untuk menambahkannya ke playlist ini.
            </p>
            <button
              onClick={onNavigateToBrowse}
              className="mt-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-light transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Telusuri Musik Trending
            </button>
          </div>
        ) : (
          <div className="bg-[#181820]/40 rounded-2xl border border-white/5 p-2 divide-y divide-white/5">
            {playlist.songs.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
                onPlay={onPlaySong}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
                onRemove={handleRemoveSong}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
