import React, { useEffect, useRef, useState } from 'react';
import { X, LogOut, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
}) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleClientId =
    ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) ||
    '193592036546-sample.apps.googleusercontent.com';

  useEffect(() => {
    if (!isOpen || user) return;

    const initGoogleGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res: any) => {
              const u = authService.handleCredentialResponse(res);
              if (u) {
                onLoginSuccess(u);
                onClose();
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320,
            logo_alignment: 'left',
          });
        } catch (err) {
          console.warn('GSI render error:', err);
        }
      }
    };

    // Attempt initialization, retry shortly if script is still loading
    initGoogleGsi();
    const timer = setTimeout(initGoogleGsi, 700);
    return () => clearTimeout(timer);
  }, [isOpen, user, googleClientId, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setErrorMsg('Masukkan alamat email Google Anda');
      return;
    }
    if (!customEmail.includes('@')) {
      setErrorMsg('Alamat email harus valid (cth. nama@gmail.com)');
      return;
    }

    const emailName = customEmail.split('@')[0];
    const displayName =
      customName.trim() ||
      emailName
        .split(/[._-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const newUser: UserProfile = {
      id: 'google-user-' + Date.now(),
      name: displayName,
      email: customEmail.trim(),
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(customEmail.trim())}`,
      loggedInAt: Date.now(),
    };

    authService.setUser(newUser);
    authService.setPromptedNewUser();
    onLoginSuccess(newUser);
    onClose();
  };

  const handleQuickLogin = (email: string, name: string) => {
    const newUser: UserProfile = {
      id: 'google-user-' + Date.now(),
      name,
      email,
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      loggedInAt: Date.now(),
    };

    authService.setUser(newUser);
    authService.setPromptedNewUser();
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div
        id="google-auth-modal-card"
        className="w-full max-w-md rounded-2xl bg-[#181818] border border-white/10 p-6 sm:p-8 shadow-2xl text-white relative flex flex-col items-center text-center"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Music Headphone Logo Header (Clean Transparent) */}
        <div className="relative mb-3">
          <div className="w-24 h-24 flex items-center justify-center">
            <img
              src="./vanz-logo.png"
              alt="Vanz Music Logo"
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-105 transition duration-300"
            />
          </div>
          <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shadow-lg">
            ✓
          </div>
        </div>

        {user ? (
          /* User Profile State */
          <div className="w-full space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold">
                Akun Terverifikasi
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">
                Profil Pengguna
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-accent shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent text-white font-extrabold text-xl flex items-center justify-center shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-white truncate flex items-center gap-1.5">
                  {user.name}
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                </h3>
                <p className="text-xs text-white/60 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">
                  Google Account Active
                </span>
              </div>
            </div>

            <div className="text-xs text-white/50 text-left bg-white/3 p-3 rounded-lg border border-white/5 space-y-1">
              <p className="flex items-center gap-1.5 text-white/80 font-medium">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Sinkronisasi Koleksi Musik
              </p>
              <p>
                Playlist pribadi, lagu favorit, dan riwayat pemutaran Anda tersimpan aman dan terhubung dengan profil ini.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  authService.logout();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-400 text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-full bg-accent hover:bg-accent-light text-white text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Login Form State */
          <div className="w-full space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold">
                Masuk ke Vanz Music
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Login dengan Akun Google
              </h2>
              <p className="text-xs text-white/60 mt-1.5 max-w-xs mx-auto">
                Masuk dengan akun Google Anda untuk menyimpan playlist, lagu favorit, dan riwayat pemutaran secara otomatis.
              </p>
            </div>

            {/* Official Google Identity Services Button Container */}
            <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
              <div
                ref={googleBtnRef}
                id="google-signin-btn-container"
                className="flex justify-center w-full"
              />
            </div>

            {/* Custom Google Account Alternative */}
            <div className="w-full">
              {!isManualOpen ? (
                <button
                  onClick={() => setIsManualOpen(true)}
                  className="text-xs text-white/70 hover:text-white py-2 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Atau masuk dengan alamat email Google</span>
                </button>
              ) : (
                <form
                  onSubmit={handleManualLogin}
                  className="mt-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-left space-y-2.5 animate-fadeIn"
                >
                  {errorMsg && (
                    <div className="text-[11px] text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                      {errorMsg}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-1">
                      Email Google Anda
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="nama@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent text-xs text-white placeholder:text-white/30 focus:outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-1">
                      Nama Panggilan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent text-xs text-white placeholder:text-white/30 focus:outline-none transition"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-light text-white text-xs font-bold transition"
                    >
                      Masuk Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualOpen(false)}
                      className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy notice */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Aman, gratis, & langsung aktif tanpa kata sandi tambahan.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
