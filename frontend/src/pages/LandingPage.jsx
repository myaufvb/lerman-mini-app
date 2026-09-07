import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield,
  ShieldCheck,
  Lock,
  Flame,
  FileVideo,
  Send,
  Radio,
  Cpu,
  Zap,
  Activity,
  KeyRound,
  Terminal,
  Server,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

import { CustomCursor } from '../components/landing/CustomCursor';
import { TiltCard } from '../components/landing/TiltCard';
import { Pinned3DCardsSection } from '../components/landing/Pinned3DCardsSection';
import { InteractiveTerminal } from '../components/landing/InteractiveTerminal';
import { LandingNavbar } from '../components/landing/LandingNavbar';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage({ onLaunchApp, isInsideTelegram }) {
  const heroRef = useRef(null);

  // Initialize Lenis smooth scroll and synchronize with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Interactive Cursor Follower with Lerp Smoothing */}
      <CustomCursor />

      {/* Top Cyber Navigation Bar */}
      <LandingNavbar onLaunchApp={onLaunchApp} isInsideTelegram={isInsideTelegram} />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden"
      >
        {/* Ambient Neon Background Spheres */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px]" />

        {/* Cyber Grid Overlay */}
        <div className="pointer-events-none absolute inset-0 cyber-grid-overlay opacity-35" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Top Status Capsule */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.2)] mb-8 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#00f2fe]" />
            <span className="text-xs font-mono tracking-widest text-cyan-300 font-bold uppercase">
              РКС КИБЕРБЕЗОПАСНОСТЬ • LERMAN SENTINEL v4.2
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 max-w-5xl">
            Непреклонный щит <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              для критической инфраструктуры
            </span>
          </h1>

          {/* Hero Lead Paragraph */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-light mb-10">
            Единая экосистема активного мониторинга серверов 24/7, сейфа доступов с шифрованием{' '}
            <span className="text-cyan-400 font-mono font-medium">AES-256-GCM</span>, одноразовых ссылок
            с самоуничтожением и мгновенной реакцией в Telegram.
          </p>

          {/* Hero CTA Action Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-16">
            <button
              onClick={onLaunchApp}
              className="interactive-cursor w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-base shadow-[0_0_35px_rgba(0,242,254,0.45)] hover:shadow-[0_0_50px_rgba(0,242,254,0.7)] transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <span>{isInsideTelegram ? 'Открыть Mini App' : 'Запустить Консоль Управления'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('modules-3d')}
              className="interactive-cursor w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white font-mono text-sm transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-xl"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Смотреть 3D Модули</span>
              <ChevronDown className="w-4 h-4 text-slate-400 animate-bounce" />
            </button>
          </div>

          {/* Hero Key Stats Bar */}
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <TiltCard maxTilt={10} className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1 text-cyan-400">
                99.99%
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Uptime SLA
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sentinel проверка каждые 60с
              </div>
            </TiltCard>

            <TiltCard maxTilt={10} className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1 text-emerald-400">
                256-bit
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                AES-GCM Шифрование
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Zero-Knowledge Master PIN
              </div>
            </TiltCard>

            <TiltCard maxTilt={10} className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1 text-purple-400">
                &lt; 38 ms
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Edge Latency
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Глобальные точки пинга
              </div>
            </TiltCard>

            <TiltCard maxTilt={10} className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1 text-amber-400">
                0 sec
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Пуш в Telegram
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Мгновенный сигнал при 502
              </div>
            </TiltCard>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PINNED 3D CARDS SECTION (GSAP SCROLLTRIGGER CENTERPIECE)               */}
      {/* ========================================================================= */}
      <Pinned3DCardsSection onLaunchApp={onLaunchApp} />

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE LIVE TERMINAL SECTION                                      */}
      {/* ========================================================================= */}
      <section id="terminal" className="py-24 relative overflow-hidden bg-[#050914] border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
              <Terminal className="w-3.5 h-3.5" />
              <span>LIVE INTERACTION CONSOLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Интерактивный хакерский терминал
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Проверьте работу ядра безопасности прямо сейчас. Кликайте по чипам быстрых команд или вводите системные инструкции с клавиатуры.
            </p>
          </div>

          {/* Interactive Hacker Console */}
          <InteractiveTerminal />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECURITY BENTO GRID (CURSOR SPOTLIGHT & 3D TILT CARDS)                 */}
      {/* ========================================================================= */}
      <section id="security" className="py-24 relative bg-[#040711]">
        {/* Cyber grid background */}
        <div className="pointer-events-none absolute inset-0 cyber-grid-overlay opacity-25" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>SECURITY MATRIX & FEATURES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Экосистема тотального контроля
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Все элементы карточек реагируют на перемещение вашего курсора с расчетом угла наклона и фотометрических бликов в 3D.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Large Span */}
            <TiltCard
              maxTilt={12}
              className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-cyan-500/30 hover:border-cyan-400/60 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  PING CYCLE: 60 SEC
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Автономный страж доступности серверов
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Sentinel непрерывно сканирует статус ваших API, баз данных и веб-приложений. При возникновении 502, таймаута или аномального скачка задержки, система инициирует тревожный каскад в Telegram с отчетом трассировки.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">RECOVERY</div>
                  <div className="text-emerald-400 font-bold mt-0.5">Auto-Notify</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">MANUAL PING</div>
                  <div className="text-cyan-400 font-bold mt-0.5">1-Click Check</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">METRICS</div>
                  <div className="text-purple-400 font-bold mt-0.5">Latency ms</div>
                </div>
              </div>
            </TiltCard>

            {/* Card 2: Vault */}
            <TiltCard
              maxTilt={14}
              className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-indigo-500/30 hover:border-indigo-400/60 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Зашифрованный Сейф (Vault)
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Пароли, root-токены и SSH-ключи шифруются по стандарту AES-256-GCM. Раздел заблокирован персональным Master PIN кодом.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/20 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Master PIN:</span>
                <span className="text-indigo-400 font-bold tracking-widest">•••• LOCKED</span>
              </div>
            </TiltCard>

            {/* Card 3: Burn Secret */}
            <TiltCard
              maxTilt={14}
              className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-amber-500/30 hover:border-amber-400/60 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  One-Time Secret
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Ссылки с самоуничтожением после первого открытия. Никаких следов в базах данных или кэше серверов.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Burn status:</span>
                <span className="text-amber-400 font-bold">1 View / 0 Bytes</span>
              </div>
            </TiltCard>

            {/* Card 4: Media */}
            <TiltCard
              maxTilt={14}
              className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-purple-500/30 hover:border-purple-400/60 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                  <FileVideo className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Медиатека & Форензика
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Защищенная загрузка фото багов, видеозаписей демонстраций инцидентов и схем с полноэкранным видеоплеером.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Player:</span>
                <span className="text-purple-400 font-bold">HTML5 High Bitrate</span>
              </div>
            </TiltCard>

            {/* Card 5: Telegram Bot */}
            <TiltCard
              maxTilt={14}
              className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Telegram Mini App & Bot
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Поддержка тикетов клиентов, мгновенный пуш в чат с кнопками «В работу» и «Решено» прямо из Telegram.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Telegram Sync:</span>
                <span className="text-emerald-400 font-bold">Bi-directional Webhook</span>
              </div>
            </TiltCard>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SPECS & ARCHITECTURE SECTION                                           */}
      {/* ========================================================================= */}
      <section id="specs" className="py-24 relative bg-[#060a16] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>SYSTEM ARCHITECTURE SPECS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Технические спецификации платформы
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Построена на современных стандартах криптографии и сетевой устойчивости.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Spec Box 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Криптографический контур
              </h4>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Алгоритм симметричного шифра:</span>
                  <span className="text-cyan-400 font-bold">AES-256-GCM (AEAD)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Деривация мастер-ключа:</span>
                  <span className="text-cyan-400 font-bold">PBKDF2 / Argon2id</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Защита от подделки токенов:</span>
                  <span className="text-cyan-400 font-bold">HMAC-SHA-256 Signature</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Одноразовое удаление (Burn):</span>
                  <span className="text-cyan-400 font-bold">Zero-fill Memory Purge</span>
                </li>
              </ul>
            </div>

            {/* Spec Box 2 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                Сетевой и мониторинговый кластер
              </h4>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Частота проверок Sentinel:</span>
                  <span className="text-emerald-400 font-bold">60 секунд (автоматически)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Детектируемые аномалии:</span>
                  <span className="text-emerald-400 font-bold">502, 503, 504, DNS, Timeout</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Шлюз нотификаций:</span>
                  <span className="text-emerald-400 font-bold">Telegram Bot API (Webhooks)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Поддержка платформ:</span>
                  <span className="text-emerald-400 font-bold">Web, Telegram iOS/Android, Desktop</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION & FOOTER                                                */}
      {/* ========================================================================= */}
      <footer className="py-20 relative bg-[#03060d] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] mx-auto mb-6 shadow-[0_0_35px_rgba(0,242,254,0.4)]">
            <div className="w-full h-full rounded-[23px] bg-slate-950 flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Возьмите инфраструктуру под защиту
          </h3>

          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            Подключите ваши веб-ресурсы, защитите учетные данные и получайте мгновенные предупреждения при малейших сбоях.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onLaunchApp}
              className="interactive-cursor px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-base shadow-[0_0_35px_rgba(0,242,254,0.4)] hover:shadow-[0_0_50px_rgba(0,242,254,0.7)] transition-all duration-300 flex items-center gap-3"
            >
              <span>{isInsideTelegram ? 'Открыть Mini App' : 'Войти в Систему'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
            <div>
              © 2026 РКС Кибербезопасность от Лермана. Все права защищены.
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ACTIVE
              </span>
              <span>•</span>
              <span>DEFCON-1 STATUS</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
