import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { GRADIENT_PRESETS, db } from '../services/db';
import { Playlist, Song } from '../types';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (playlist: Playlist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPl = db.createPlaylist(title, description, selectedGradient);
    onCreated(newPl);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        id="create-playlist-modal-card"
        className="w-full max-w-md rounded-2xl bg-[#1c1c22] border border-white/10 p-6 shadow-2xl text-white relative"
      >
        <button
          id="close-create-playlist-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold tracking-tight mb-1">Daftar Putar Baru</h3>
        <p className="text-sm text-white/50 mb-6">
          Buat playlist kustom yang tersimpan otomatis di database lokal perangkat Anda.
        </p>

        {/* Preview Cover */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-24 h-24 rounded-xl bg-gradient-to-br ${selectedGradient} flex items-center justify-center shadow-lg border border-white/10 shrink-0`}
          >
            <Music className="w-10 h-10 text-white/80" />
          </div>
          <div className="flex-1">
            <span className="text-xs uppercase tracking-wider text-white/40 block mb-2 font-semibold">
              Pilih Warna Tema
            </span>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map((grad, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} border transition-all ${
                    selectedGradient === grad
                      ? 'scale-110 border-white ring-2 ring-white/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Judul Playlist
            </label>
            <input
              type="text"
              id="playlist-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Favorit Akhir Pekan, Workout, Coding Beats"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#fa243c] focus:outline-none text-white placeholder:text-white/30 text-sm transition"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="playlist-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan catatan singkat tentang playlist ini..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#fa243c] focus:outline-none text-white placeholder:text-white/30 text-sm resize-none transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              id="cancel-create-playlist-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="save-playlist-submit-btn"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#fa243c] hover:bg-[#e01e35] disabled:opacity-50 disabled:hover:bg-[#fa243c] text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Buat Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddToPlaylistModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onPlaylistUpdated?: () => void;
  onRequestCreatePlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  song,
  onClose,
  onPlaylistUpdated,
  onRequestCreatePlaylist,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => db.getPlaylists());
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen || !song) return null;

  const handleToggleSongInPlaylist = (playlist: Playlist) => {
    const isAlreadyIn = playlist.songs.some((s) => s.id === song.id);
    let success = false;
    if (isAlreadyIn) {
      success = db.removeSongFromPlaylist(playlist.id, song.id);
      setNotification(`Dihapus dari "${playlist.title}"`);
    } else {
      success = db.addSongToPlaylist(playlist.id, song);
      setNotification(`Ditambahkan ke "${playlist.title}"`);
    }

    if (success) {
      setPlaylists(db.getPlaylists());
      onPlaylistUpdated?.();
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        id="add-to-playlist-modal-card"
        className="w-full max-w-sm rounded-2xl bg-[#1c1c22] border border-white/10 p-5 shadow-2xl text-white relative"
      >
        <button
          id="close-add-playlist-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold tracking-tight mb-1">Tambahkan ke Playlist</h3>
        <p className="text-xs text-white/50 mb-3 truncate">
          Lagu: <span className="text-white font-medium">{song.title}</span>
        </p>

        {notification && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#fa243c]/20 border border-[#fa243c]/40 text-xs text-rose-300 font-medium animate-fadeIn">
            {notification}
          </div>
        )}

        {/* Playlist selection list */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 mb-4">
          {playlists.map((pl) => {
            const hasSong = pl.songs.some((s) => s.id === song.id);
            return (
              <button
                key={pl.id}
                id={`add-to-playlist-${pl.id}`}
                onClick={() => handleToggleSongInPlaylist(pl)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition border ${
                  hasSong
                    ? 'bg-white/10 border-white/20'
                    : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pl.coverGradient} flex items-center justify-center shrink-0 text-white shadow`}
                >
                  <Music className="w-5 h-5 opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{pl.title}</h4>
                  <p className="text-xs text-white/40">{pl.songs.length} lagu</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-bold ${
                    hasSong
                      ? 'bg-[#fa243c] border-[#fa243c] text-white'
                      : 'border-white/30 text-transparent'
                  }`}
                >
                  ✓
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <button
            id="create-new-from-add-modal-btn"
            onClick={() => {
              onClose();
              onRequestCreatePlaylist();
            }}
            className="text-xs font-semibold text-[#fa243c] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Playlist Baru
          </button>
          <button
            id="done-add-playlist-btn"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
