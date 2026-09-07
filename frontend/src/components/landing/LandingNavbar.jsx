import React from 'react';
import { Shield, Lock, Terminal, Cpu, ArrowRight, ExternalLink } from 'lucide-react';

export function LandingNavbar({ onLaunchApp, isInsideTelegram }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          
          {/* Brand Logo */}
          <div
            onClick={() => scrollTo('hero')}
            className="interactive-cursor flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(0,242,254,0.4)] group-hover:shadow-[0_0_25px_rgba(0,242,254,0.7)] transition-all duration-300">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-wider font-mono">
                  LERMAN
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  RKS CYBER
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
                SENTINEL SECURITY SYSTEM
              </div>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
            <button
              onClick={() => scrollTo('hero')}
              className="interactive-cursor hover:text-cyan-400 transition-colors"
            >
              // Главная
            </button>
            <button
              onClick={() => scrollTo('modules-3d')}
              className="interactive-cursor hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              // 3D Модули
            </button>
            <button
              onClick={() => scrollTo('terminal')}
              className="interactive-cursor hover:text-cyan-400 transition-colors"
            >
              // Терминал
            </button>
            <button
              onClick={() => scrollTo('security')}
              className="interactive-cursor hover:text-cyan-400 transition-colors"
            >
              // Матрица защиты
            </button>
            <button
              onClick={() => scrollTo('specs')}
              className="interactive-cursor hover:text-cyan-400 transition-colors"
            >
              // Метрики
            </button>
          </nav>

          {/* Right Action: Launch App / Console */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>DEFCON-1 ENFORCED</span>
            </div>

            <button
              onClick={onLaunchApp}
              className="interactive-cursor px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_30px_rgba(0,242,254,0.6)] transition-all duration-200 flex items-center gap-2 group"
            >
              <span>{isInsideTelegram ? 'Открыть Mini App' : 'Войти в Консоль'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
