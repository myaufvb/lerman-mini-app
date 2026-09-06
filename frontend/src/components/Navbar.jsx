import React from 'react';
import { Shield, Lock, Unlock, Image, RefreshCw, Smartphone } from 'lucide-react';

export function Navbar({ 
  user, 
  currentUser,
  onLogout,
  isInsideTelegram, 
  hasMasterPin, 
  isVaultUnlocked, 
  onLockVault, 
  onOpenWallpaperModal, 
  onRefresh, 
  isLoading 
}) {
  return (
    <header className="sticky top-0 z-40 w-full apple-liquid-panel border-b border-white/10 px-4 py-3 animate-ios-slide-down">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#070b14]/90 rounded-[14px] flex items-center justify-center backdrop-blur-md">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase drop-shadow-sm">
                Lerman Mini App
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm shadow-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cyber Security & Projects Hub
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Обновить данные"
            className="apple-glass-button p-2 rounded-xl text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Wallpaper button */}
          <button
            onClick={onOpenWallpaperModal}
            title="Обои и фон"
            className="apple-glass-button p-2 rounded-xl text-slate-300 hover:text-cyan-400"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* User badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-sm shadow-cyan-500/30">
              {currentUser?.name?.[0] || currentUser?.login?.[0] || user?.first_name?.[0] || 'L'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium text-slate-300 truncate max-w-[90px]">
                {currentUser?.name || currentUser?.login || user?.first_name || 'Admin'}
              </span>
              {currentUser?.role === 'developer' ? (
                <span className="text-[9px] font-extrabold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                  ⚡ DEVELOPER
                </span>
              ) : (
                <span className="text-[9px] text-blue-400 font-semibold">
                  👤 CLIENT
                </span>
              )}
            </div>
            {/* Mobile role pill */}
            <span className="sm:hidden text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-white/10 border border-white/15">
              {currentUser?.role === 'developer' ? '⚡ DEV' : '👤 USER'}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Выйти из аккаунта"
                className="apple-glass-button px-2.5 py-1.5 rounded-xl text-rose-400 text-xs font-semibold hover:text-rose-300"
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
