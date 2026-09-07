import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, 
  Lock, 
  Flame, 
  FileVideo, 
  Send, 
  Radio, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  KeyRound, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CARDS_DATA = [
  {
    id: 'sentinel',
    step: '01',
    category: 'TELEMETRY & UPTIME',
    title: 'Sentinel Uptime 24/7 & Global Latency Engine',
    tagline: 'Автономный мониторинг инфраструктуры каждые 60 секунд с мгновенной детекцией 502 Bad Gateway и таймаутов.',
    badge: 'Real-time Ping',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    accentColor: '#00f2fe',
    accentGlow: 'rgba(0, 242, 254, 0.25)',
    icon: Radio,
    metrics: [
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Latency avg', value: '38 ms' },
      { label: 'Check Interval', value: '60 sec' },
    ],
    preview: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-slate-300 font-semibold">https://api.lerman.rks/v2</span>
          </div>
          <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">200 OK • 24ms</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-slate-300 font-semibold">Database Cluster (Primary)</span>
          </div>
          <span className="text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">14ms • HEALTHY</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-slate-300 font-semibold">Telegram Webhook Gateway</span>
          </div>
          <span className="text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Active • 0 drops</span>
        </div>
      </div>
    )
  },
  {
    id: 'vault',
    step: '02',
    category: 'CRYPTOGRAPHY & VAULT',
    title: 'AES-256-GCM Military Grade Vault',
    tagline: 'Изолированное хранилище паролей, SSH-ключей и API-токенов. Zero-knowledge архитектура и защита Master PIN кодом.',
    badge: 'Hardware Encrypted',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    accentColor: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    icon: Lock,
    metrics: [
      { label: 'Cipher Suite', value: 'AES-256-GCM' },
      { label: 'Key Derivation', value: 'PBKDF2 / SHA-512' },
      { label: 'Zero Knowledge', value: '100% Client-side' },
    ],
    preview: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <KeyRound className="w-3.5 h-3.5" /> ROOT_PRODUCTION_SECRET
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">LOCKED</span>
          </div>
          <div className="mt-2 text-slate-500 tracking-widest text-sm select-none">
            ••••••••••••••••••••••••••••••••
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Auth Tag: 9f8a...4b12</span>
            <span className="text-emerald-400">PIN Verified</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Copy 1-Click</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auto-Clear RAM</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'burn',
    step: '03',
    category: 'EPHEMERAL PRIVACY',
    title: 'Burn-on-Read Self-Destruct Secrets',
    tagline: 'Генерация защищенных одноразовых ссылок для передачи конфиденциальных доступов. Данные уничтожаются безвозвратно после 1 открытия.',
    badge: 'Auto Purge',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    accentColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    icon: Flame,
    metrics: [
      { label: 'Read Limit', value: '1 View Only' },
      { label: 'TTL Lifetime', value: 'Max 24h' },
      { label: 'Trace Retention', value: '0 Bytes' },
    ],
    preview: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> ONE-TIME LINK READY
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">BURN ON OPEN</span>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] truncate">
            https://rks.lerman.security/secret#9a8c2f1e4...
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Expires in: 59m 40s</span>
            <span className="text-amber-400/90 font-medium">Memory Safe</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'media',
    step: '04',
    category: 'SECURE MEDIA & LOGS',
    title: 'Encrypted Media Vault & Forensics',
    tagline: 'Защищенное медиа-хранилище фото и видеозаписей инцидентов, багов, серверных логов и схем с полноэкранным плеером.',
    badge: 'Lossless Streaming',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    accentColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
    icon: FileVideo,
    metrics: [
      { label: 'Compression', value: 'Lossless' },
      { label: 'Formats', value: 'MP4, WEBM, PNG' },
      { label: 'Access Control', value: 'Project Key' },
    ],
    preview: (
      <div className="space-y-3 font-mono text-xs">
        <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950/80 p-3">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <FileVideo className="w-3.5 h-3.5" /> incident_proof_ddos_trace.mp4
            </span>
            <span className="text-[10px] text-slate-500">14.2 MB</span>
          </div>
          <div className="h-20 w-full rounded-lg bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 flex items-center justify-center border border-purple-500/20 relative">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
              ▶
            </div>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] text-slate-400">
              <span>00:14 / 01:30</span>
              <span className="text-purple-400">1080p 60fps</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'bot',
    step: '05',
    category: 'TELEGRAM AUTOMATION',
    title: 'Autonomous Telegram Security Bot',
    tagline: 'Двусторонняя связка с Telegram-ботом: мгновенные тревожные сигналы об инцидентах и интерактивное реагирование кнопками прямо в чате.',
    badge: 'Instant Push',
    badgeColor: 'text-neon border-emerald-500/30 bg-emerald-500/10',
    accentColor: '#00ffcc',
    accentGlow: 'rgba(0, 255, 204, 0.25)',
    icon: Send,
    metrics: [
      { label: 'Notification Lag', value: '< 1.2 sec' },
      { label: 'Inline Actions', value: 'Supported' },
      { label: 'Mini App Link', value: 'Direct URL' },
    ],
    preview: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(0,255,204,0.15)]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
              TG
            </div>
            <span className="text-slate-300 font-bold text-xs">Lerman Security Sentinel Bot</span>
            <span className="ml-auto text-[10px] text-slate-500">just now</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed">
            🚨 <span className="text-rose-400 font-bold">[CRITICAL ALERT]</span> Проект <span className="text-cyan-400 font-bold">API Gateway</span> вернул 502! Задержка превысила 5000ms.
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="py-1.5 text-center bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded text-cyan-300 text-[11px] font-semibold cursor-pointer">
              ⚡ В работу
            </div>
            <div className="py-1.5 text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-[11px] font-semibold cursor-pointer">
              📱 Открыть в App
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export function Pinned3DCardsSection({ onLaunchApp }) {
  const containerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardElementsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const cards = cardElementsRef.current.filter(Boolean);
    if (!container || cards.length === 0) return;

    // Reset initial 3D transforms for all cards
    cards.forEach((card, i) => {
      if (i === 0) {
        gsap.set(card, {
          yPercent: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          opacity: 1,
          zIndex: 10
        });
      } else {
        gsap.set(card, {
          yPercent: 120,
          z: -180,
          rotateX: 20,
          rotateY: 0,
          scale: 0.88,
          opacity: 0,
          zIndex: 10 - i
        });
      }
    });

    const totalSteps = cards.length - 1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${cards.length * 90}%`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const index = Math.min(
            cards.length - 1,
            Math.floor(self.progress * cards.length)
          );
          setActiveCardIndex(index);
        }
      }
    });

    // Animate transition between each card in 3D space
    for (let i = 0; i < totalSteps; i++) {
      const currentCard = cards[i];
      const nextCard = cards[i + 1];

      // Current card flies backwards and disappears upwards
      tl.to(
        currentCard,
        {
          yPercent: -100,
          z: -260,
          rotateX: -25,
          scale: 0.82,
          opacity: 0,
          filter: 'blur(8px)',
          ease: 'power2.inOut',
          duration: 1
        },
        i
      );

      // Next card enters from depth and front
      tl.to(
        nextCard,
        {
          yPercent: 0,
          z: 0,
          rotateX: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          duration: 1
        },
        i + 0.15
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) {
          st.kill();
        }
      });
    };
  }, []);

  const activeData = CARDS_DATA[activeCardIndex] || CARDS_DATA[0];

  return (
    <section
      ref={containerRef}
      id="modules-3d"
      className="relative w-full min-h-screen bg-[#060a15] text-slate-100 flex items-center justify-center overflow-hidden border-y border-cyan-500/10"
    >
      {/* Dynamic Ambient Background Glow that shifts with active card color */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700 opacity-20 blur-[130px]"
        style={{
          background: `radial-gradient(circle at 65% 50%, ${activeData.accentColor}, transparent 60%)`
        }}
      />

      {/* Cyber Grid Pattern Backdrop */}
      <div className="pointer-events-none absolute inset-0 cyber-grid-overlay opacity-30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: Context, dynamic card info & timeline indicators */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          
          {/* Section Subtitle Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
              3D Interactive Core Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Глубокая защита <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              каждого байта данных
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            Прокручивайте страницу, чтобы исследовать 5 фундаментальных слоев платформы безопасности. Интеллектуальный контроль, шифрование и моментальное реагирование в одном интерфейсе.
          </p>

          {/* Stepper / Timeline indicators */}
          <div className="flex items-center gap-3 mb-8">
            {CARDS_DATA.map((c, idx) => (
              <div
                key={c.id}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeCardIndex
                    ? 'w-10 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_#00f2fe]'
                    : idx < activeCardIndex
                    ? 'w-2.5 h-2 bg-cyan-700/60'
                    : 'w-2.5 h-2 bg-slate-800'
                }`}
              />
            ))}
            <span className="ml-2 font-mono text-xs text-slate-400">
              {activeData.step} / 05
            </span>
          </div>

          {/* Active Card Specs Summary box */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl transition-all duration-500">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${activeData.badgeColor}`}>
                {activeData.badge}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">
                {activeData.category}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {activeData.title}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {activeData.tagline}
            </p>

            {/* Micro Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
              {activeData.metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</span>
                  <span className="text-xs font-bold font-mono text-slate-200">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick CTA */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={onLaunchApp}
              className="interactive-cursor px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(0,242,254,0.35)] transition-all duration-200 flex items-center gap-2"
            >
              <span>Попробовать модуль</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Scroll to flip 3D stack
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D Perspective Stage with Stacked Cards */}
        <div className="w-full lg:w-7/12 h-[520px] sm:h-[560px] relative flex items-center justify-center perspective-1200">
          
          <div
            ref={cardsContainerRef}
            className="relative w-full max-w-[460px] h-[480px] sm:h-[500px] preserve-3d"
          >
            {CARDS_DATA.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  ref={(el) => (cardElementsRef.current[idx] = el)}
                  className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-7 flex flex-col justify-between preserve-3d will-change-transform border transition-shadow duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(13, 20, 36, 0.95) 0%, rgba(7, 11, 20, 0.98) 100%)',
                    borderColor: `${card.accentColor}33`,
                    boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px -10px ${card.accentGlow}`
                  }}
                >
                  {/* Holographic Header Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                        style={{
                          background: `radial-gradient(circle, ${card.accentColor}22 0%, rgba(15, 23, 42, 0.8) 100%)`,
                          borderColor: `${card.accentColor}55`,
                          color: card.accentColor
                        }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                          {card.category}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    <div className="font-mono text-xl sm:text-2xl font-black text-slate-700">
                      {card.step}
                    </div>
                  </div>

                  {/* Card Main Body / Dynamic Interactive Visualization */}
                  <div className="my-4 flex-1 flex flex-col justify-center">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70 backdrop-blur-md">
                      {card.preview}
                    </div>
                  </div>

                  {/* Card Bottom Meta Bar */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Module Status: <strong className="text-emerald-400">READY</strong>
                    </span>
                  </div>

                  {/* Cyber Edge Specular Accent */}
                  <div
                    className="pointer-events-none absolute top-0 left-10 right-10 h-[1px] opacity-60"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)`
                    }}
                  />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
