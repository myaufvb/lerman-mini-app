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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-cyber-900 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                Lerman Mini App
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Wallpaper button */}
          <button
            onClick={onOpenWallpaperModal}
            title="Обои и фон"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Vault Lock indicator */}
          {hasMasterPin && (
            <button
              onClick={onLockVault}
              title={isVaultUnlocked ? 'Сейф разблокирован (нажмите для блокировки)' : 'Сейф заблокирован'}
              className={`p-2 rounded-xl border transition-colors ${
                isVaultUnlocked
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              {isVaultUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          )}

          {/* User badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400">
              {currentUser?.name?.[0] || currentUser?.login?.[0] || user?.first_name?.[0] || 'L'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-300">
              {currentUser?.name || currentUser?.login || user?.first_name || 'Admin'}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Выйти из аккаунта"
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
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
