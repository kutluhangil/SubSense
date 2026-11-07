import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Play, Layers, Volume2, VolumeX, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import FeatureGrid from './FeatureGrid';
import MicroDemoRow from './MicroDemoRow';
import FinalCTA from './FinalCTA';

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

type ArtMode = 'horlogerie' | 'sonic' | 'prism';

interface DialJewel {
  day: string;
  angle: number;
  name: string;
  price: string;
  color: string;
  noteTr: string;
  noteEn: string;
}

const DIAL_JEWELS: DialJewel[] = [
  {
    day: '04',
    angle: 38,
    name: 'Netflix Ultra 4K',
    price: '₺299,99',
    color: '#D4AF7A',
    noteTr: 'Gemini Notu: Yıllık kadranda ₺3.600. Aile planına geçişle %50 tasarruf imkanı.',
    noteEn: 'Gemini Note: ₺3,600 annually. Switching to shared family tier saves 50%.'
  },
  {
    day: '12',
    angle: 128,
    name: 'Adobe Creative Cloud',
    price: '₺956,00',
    color: '#E05A47',
    noteTr: 'Gemini Notu: Son 24 günde düşük kullanım. Yıllık taahhüt indirimi aktif edilebilir.',
    noteEn: 'Gemini Note: Low usage in the past 24 days. Loyalty discount eligible.'
  },
  {
    day: '19',
    angle: 222,
    name: 'Claude Pro AI',
    price: '$20,00',
    color: '#10B981',
    noteTr: 'Gemini Notu: ~₺730,80 anlık kur. Yüksek verimlilik — aktif tutulması önerilir.',
    noteEn: 'Gemini Note: ~₺730.80 live FX rate. High utility score — keep active.'
  },
  {
    day: '27',
    angle: 308,
    name: 'Spotify Duo',
    price: '₺79,99',
    color: '#818CF8',
    noteTr: 'Gemini Notu: Bireysel yıllık plana geçişte 2 ay ücretsiz avantajı bulundu.',
    noteEn: 'Gemini Note: Annual billing unlocks 2 months free compared to monthly.'
  }
];

export default function Hero({ onOpenDemo, onOpenAuth }: HeroProps) {
  const { t, currentLanguage } = useLanguage();
  const isTr = currentLanguage === 'tr';

  const [artMode, setArtMode] = useState<ArtMode>('horlogerie');
  const [activeJewel, setActiveJewel] = useState<number>(0);
  const [noiseGate, setNoiseGate] = useState<boolean>(false);
  const [prismExploded, setPrismExploded] = useState<boolean>(false);
  const [prismTilt, setPrismTilt] = useState<{ rx: number; rz: number }>({ rx: 54, rz: -34 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAuth = (mode: 'login' | 'signup') => {
    if (onOpenAuth) onOpenAuth(mode);
  };

  const handleDemo = () => {
    if (onOpenDemo) {
      onOpenDemo();
    } else {
      window.open('https://sub-sense-ashy.vercel.app', '_blank', 'noopener,noreferrer');
    }
  };

  // Acoustic Strings Physics Loop when 'sonic' mode is active
  useEffect(() => {
    if (artMode !== 'sonic') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let prevY: number | null = null;

    const strings = [
      { name: 'Netflix 4K', cost: '₺299', yRatio: 0.16, amp: 12, vel: 0, waste: false },
      { name: isTr ? 'Kullanılmayan Spor Uygulaması (Parazit)' : 'Unused Fitness App (Static)', cost: '₺450', yRatio: 0.34, amp: 20, vel: 0, waste: true },
      { name: 'Claude Pro ($20)', cost: '₺730', yRatio: 0.52, amp: 0, vel: 0, waste: false },
      { name: isTr ? 'Çift Müzik Denemesi (Parazit)' : 'Duplicate Music Trial (Static)', cost: '₺199', yRatio: 0.70, amp: -15, vel: 0, waste: true },
      { name: 'Spotify Duo + iCloud', cost: '₺476', yRatio: 0.87, amp: 0, vel: 0, waste: false },
    ];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const my = e.clientY - rect.top;
      if (prevY !== null) {
        strings.forEach((s) => {
          if (noiseGate && s.waste) return;
          const sy = s.yRatio * rect.height;
          if ((prevY! < sy && my >= sy) || (prevY! > sy && my <= sy)) {
            s.vel = Math.max(Math.min((my - prevY!) * 1.35, 32), -32);
          }
        });
      }
      prevY = my;
    };

    canvas.addEventListener('mousemove', onMove);

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      strings.forEach((s) => {
        const y = s.yRatio * h;
        const muted = noiseGate && s.waste;

        if (muted) {
          s.amp *= 0.82;
          s.vel *= 0.82;
        } else {
          const force = -0.18 * s.amp;
          s.vel = (s.vel + force) * 0.92;
          s.amp += s.vel;
          if (s.waste && Math.abs(s.amp) < 1.5) {
            s.amp = Math.sin(Date.now() * 0.022) * 2.4;
          }
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(w * 0.5, y + s.amp, w, y);
        ctx.strokeStyle = muted
          ? 'rgba(148, 163, 184, 0.22)'
          : s.waste
          ? '#F97316'
          : '#D4AF7A';
        ctx.lineWidth = muted ? 1 : s.waste ? 2.2 : 1.6;
        if (muted) ctx.setLineDash([4, 6]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "500 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = muted
          ? 'rgba(148, 163, 184, 0.38)'
          : s.waste
          ? '#FB923C'
          : 'rgba(241, 245, 249, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText(muted ? `${s.name} [MUTED]` : s.name, 10, y - 8);
        ctx.textAlign = 'right';
        ctx.fillText(muted ? '₺0' : `${s.cost}/ay`, w - 10, y - 8);
      });

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [artMode, noiseGate, isTr]);

  const currentJewel = DIAL_JEWELS[activeJewel];

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] dark:bg-[#09090B] text-stone-900 dark:text-[#F2ECE1] overflow-hidden transition-colors duration-500">
      
      {/* Subtle Ambient Sculpture Glows & Fine Grain */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-[620px] h-[620px] rounded-full bg-amber-500/[0.07] dark:bg-[#D4AF7A]/[0.07] blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.05] dark:bg-indigo-500/[0.06] blur-[140px]" />
        {/* Fine architectural hairlines */}
        <div className="max-w-7xl mx-auto h-full border-x border-stone-900/[0.05] dark:border-white/[0.04]" />
      </div>

      {/* HERO ATELIER STAGE */}
      <div className="relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Editorial Masthead Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 lg:mb-14 border-b border-stone-900/10 dark:border-[#D4AF7A]/20">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-amber-700 dark:bg-[#D4AF7A]" />
              <span className="text-xs uppercase tracking-[0.24em] text-amber-800 dark:text-[#D4AF7A] font-mono">
                {isTr ? 'N° 01 — FİNANSAL SANAT & ZEKA' : 'N° 01 — L’ART DE L’ÉCONOMIE'}
              </span>
            </div>

            {/* Interactive Installation Switcher Pill */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-stone-900/[0.05] dark:bg-white/[0.05] border border-stone-900/10 dark:border-white/10 backdrop-blur-xl text-xs font-mono">
              <button
                onClick={() => setArtMode('horlogerie')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                  artMode === 'horlogerie'
                    ? 'bg-stone-900 dark:bg-[#D4AF7A] text-white dark:text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>{isTr ? 'I. Horlogerie Kadran' : 'I. Horlogerie Dial'}</span>
              </button>
              <button
                onClick={() => setArtMode('sonic')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                  artMode === 'sonic'
                    ? 'bg-stone-900 dark:bg-[#D4AF7A] text-white dark:text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Volume2 size={13} />
                <span>{isTr ? 'II. Akustik Teller' : 'II. Acoustic Strings'}</span>
              </button>
              <button
                onClick={() => setArtMode('prism')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                  artMode === 'prism'
                    ? 'bg-stone-900 dark:bg-[#D4AF7A] text-white dark:text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>{isTr ? 'III. 3B Prizma' : 'III. 3D Prism'}</span>
              </button>
            </div>
          </div>

          {/* Main Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Sculptural Editorial Typography */}
            <div className="lg:col-span-6 text-left space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-800/20 dark:border-[#D4AF7A]/30 bg-amber-500/5 dark:bg-[#D4AF7A]/10 text-xs text-amber-900 dark:text-[#D4AF7A]">
                <Sparkles size={13} />
                <span>{t('hero.tagline')}</span>
              </div>

              <h1
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-5xl sm:text-6xl xl:text-[5.1rem] leading-[0.96] font-normal tracking-tight text-stone-900 dark:text-[#F2ECE1]"
              >
                {isTr ? (
                  <>
                    Zamanın ve <br />
                    <em className="italic text-amber-700 dark:text-[#D4AF7A]">her kuruşun</em> <br />
                    sessiz ihtişamı.
                  </>
                ) : (
                  <>
                    The quiet luxury <br />
                    of knowing <br />
                    <em className="italic text-amber-700 dark:text-[#D4AF7A]">every coin.</em>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 dark:text-[#F2ECE1]/65 leading-relaxed max-w-xl font-light">
                {t('hero.take_control_desc')}
              </p>

              {/* Haute Couture Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => handleAuth('signup')}
                  className="group px-8 py-4 rounded-full bg-stone-900 dark:bg-[#D4AF7A] text-white dark:text-stone-950 font-semibold text-sm tracking-wide uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                >
                  <span>{t('hero.start_tracking_free')}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={handleDemo}
                  className="px-7 py-4 rounded-full border border-stone-900/20 dark:border-[#F2ECE1]/20 text-stone-800 dark:text-[#F2ECE1] font-medium text-sm tracking-wide uppercase flex items-center justify-center gap-2 hover:border-amber-700 dark:hover:border-[#D4AF7A] transition-colors"
                >
                  <Play size={14} />
                  <span>{t('hero.view_live_demo')}</span>
                </button>
              </div>

              {/* Editorial Telemetry Footnote */}
              <div className="pt-8 border-t border-stone-900/10 dark:border-white/10 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="italic text-3xl text-amber-700 dark:text-[#D4AF7A]">
                    20+
                  </p>
                  <p className="font-mono text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    {isTr ? 'Canlı Döviz' : 'Live Currencies'}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="italic text-3xl text-stone-900 dark:text-[#F2ECE1]">
                    0,00
                  </p>
                  <p className="font-mono text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    {isTr ? 'Banka Şifresi' : 'Bank Logins'}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="italic text-3xl text-stone-900 dark:text-[#F2ECE1]">
                    100%
                  </p>
                  <p className="font-mono text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    {isTr ? 'Özel Kasa' : 'Private Vault'}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Art Installation Stage */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              
              {/* INSTALLATION I: HORLOGERIE MECHANICAL TOURBILLON DIAL */}
              {artMode === 'horlogerie' && (
                <div className="flex flex-col items-center">
                  <div className="relative w-[330px] h-[330px] sm:w-[440px] sm:h-[440px] flex items-center justify-center select-none">
                    {/* Outer Rotating Precision Bezel */}
                    <svg viewBox="0 0 500 500" className="w-full h-full absolute inset-0 animate-[spin_90s_linear_infinite] pointer-events-none">
                      <circle cx="250" cy="250" r="236" fill="none" stroke="#D4AF7A" strokeOpacity="0.4" strokeWidth="1" />
                      <circle cx="250" cy="250" r="218" fill="none" stroke="#D4AF7A" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 8" />
                      <circle cx="250" cy="250" r="172" fill="none" stroke="#D4AF7A" strokeOpacity="0.15" strokeWidth="0.75" />
                      <g stroke="#D4AF7A" strokeOpacity="0.45">
                        <line x1="250" y1="14" x2="250" y2="28" strokeWidth="1.5" />
                        <line x1="250" y1="472" x2="250" y2="486" strokeWidth="1.5" />
                        <line x1="14" y1="250" x2="28" y2="250" strokeWidth="1.5" />
                        <line x1="472" y1="250" x2="486" y2="250" strokeWidth="1.5" />
                      </g>
                    </svg>

                    {/* Watch Hand Pointer */}
                    <div
                      className="absolute w-[1.5px] h-[140px] sm:h-[180px] bg-gradient-to-t from-transparent via-amber-600 dark:via-[#D4AF7A] to-amber-400 origin-bottom bottom-1/2 transition-transform duration-700 ease-out pointer-events-none"
                      style={{ transform: `rotate(${currentJewel.angle}deg)` }}
                    />

                    {/* 4 Interactive Ruby/Gold Jewel Nodes */}
                    <button
                      onMouseEnter={() => setActiveJewel(0)}
                      onClick={() => setActiveJewel(0)}
                      className="absolute top-[10%] right-[16%] group flex flex-col items-center cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#D4AF7A] ring-4 ring-[#D4AF7A]/25 group-hover:scale-125 transition-transform shadow-[0_0_16px_#D4AF7A]" />
                      <span className="mt-1.5 font-mono text-xs bg-stone-900 text-[#F2ECE1] px-2.5 py-0.5 rounded border border-[#D4AF7A]/40">
                        04 · Netflix
                      </span>
                    </button>

                    <button
                      onMouseEnter={() => setActiveJewel(1)}
                      onClick={() => setActiveJewel(1)}
                      className="absolute bottom-[15%] right-[8%] group flex flex-col items-center cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#E05A47] ring-4 ring-[#E05A47]/25 group-hover:scale-125 transition-transform shadow-[0_0_16px_#E05A47]" />
                      <span className="mt-1.5 font-mono text-xs bg-stone-900 text-[#F2ECE1] px-2.5 py-0.5 rounded border border-[#E05A47]/40">
                        12 · Adobe CC
                      </span>
                    </button>

                    <button
                      onMouseEnter={() => setActiveJewel(2)}
                      onClick={() => setActiveJewel(2)}
                      className="absolute bottom-[13%] left-[12%] group flex flex-col items-center cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/25 group-hover:scale-125 transition-transform shadow-[0_0_16px_#34d399]" />
                      <span className="mt-1.5 font-mono text-xs bg-stone-900 text-[#F2ECE1] px-2.5 py-0.5 rounded border border-emerald-400/40">
                        19 · Claude AI
                      </span>
                    </button>

                    <button
                      onMouseEnter={() => setActiveJewel(3)}
                      onClick={() => setActiveJewel(3)}
                      className="absolute top-[16%] left-[8%] group flex flex-col items-center cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-400 ring-4 ring-indigo-400/25 group-hover:scale-125 transition-transform shadow-[0_0_16px_#818cf8]" />
                      <span className="mt-1.5 font-mono text-xs bg-stone-900 text-[#F2ECE1] px-2.5 py-0.5 rounded border border-indigo-400/40">
                        27 · Spotify
                      </span>
                    </button>

                    {/* Central Tourbillon Aperture */}
                    <div className="relative z-10 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-stone-950 text-[#F2ECE1] border border-[#D4AF7A]/45 shadow-[inset_0_0_40px_rgba(212,175,122,0.14),0_25px_60px_rgba(0,0,0,0.65)] flex flex-col items-center justify-center p-6 text-center">
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF7A]">
                        {isTr ? `GÜN ${currentJewel.day} / 30` : `DAY ${currentJewel.day} / 30`}
                      </span>
                      <h3
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        className="text-2xl sm:text-3xl text-[#F2ECE1] mt-1 font-medium"
                      >
                        {currentJewel.name}
                      </h3>
                      <p className="font-mono text-base sm:text-lg text-[#D4AF7A] mt-0.5">
                        {currentJewel.price} <span className="text-xs text-[#F2ECE1]/50">/ {isTr ? 'ay' : 'mo'}</span>
                      </p>
                      <div className="w-10 h-[1px] bg-[#D4AF7A]/30 my-2" />
                      <p className="text-xs text-[#F2ECE1]/70 font-light leading-snug">
                        {isTr ? currentJewel.noteTr : currentJewel.noteEn}
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-amber-800/70 dark:text-[#D4AF7A]/70 tracking-widest uppercase mt-2">
                    {isTr ? '✦ Kadran taşlarının üzerine gelerek kalibreyi test edin' : '✦ Hover over the dial jewels to test the caliber'}
                  </p>
                </div>
              )}

              {/* INSTALLATION II: SONIC FREQUENCY STRINGS */}
              {artMode === 'sonic' && (
                <div className="w-full rounded-[28px] bg-stone-950 text-[#EAEAE6] p-6 sm:p-8 border border-[#D4AF7A]/25 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
                        {isTr ? 'AKUSTİK HARCAMA REZONANSI' : 'ACOUSTIC OUTFLOW RESONANCE'}
                      </span>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="font-mono text-3xl font-bold text-white">
                          {noiseGate ? '₺1.505,00' : '₺2.154,00'}
                        </span>
                        <span className={`font-mono text-xs ${noiseGate ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {noiseGate
                            ? isTr ? '✦ 2 Parazit Susturuldu (-₺649/ay)' : '✦ 2 Static Subs Muted (-₺649/mo)'
                            : isTr ? '2 Parazit Frekans Tespit Edildi' : '2 Static Frequencies Detected'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setNoiseGate(!noiseGate)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        noiseGate
                          ? 'bg-emerald-500 text-stone-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                          : 'bg-orange-500 text-white font-semibold shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      }`}
                    >
                      {noiseGate ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{noiseGate ? 'AI Noise Gate: ON' : 'AI Noise Gate: OFF'}</span>
                    </button>
                  </div>

                  <div className="relative w-full h-[290px] mt-3">
                    <canvas ref={canvasRef} className="w-full h-full cursor-ns-resize block" />
                  </div>

                  <p className="font-mono text-xs text-stone-400 pt-3 border-t border-white/10 text-center">
                    {isTr
                      ? '↕ Fareyi tellerin üzerinden geçirerek titreştirin · AI Noise Gate ile gereksizleri susturun'
                      : '↕ Pluck strings with your cursor · Toggle AI Noise Gate to mute unused trials'}
                  </p>
                </div>
              )}

              {/* INSTALLATION III: 3D OBSIDIAN PRISM MONOLITH */}
              {artMode === 'prism' && (
                <div
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const nx = (e.clientX - rect.left) / rect.width - 0.5;
                    const ny = (e.clientY - rect.top) / rect.height - 0.5;
                    setPrismTilt({ rx: 54 - ny * 14, rz: -34 + nx * 18 });
                  }}
                  className="w-full flex flex-col items-center justify-center py-6 select-none"
                  style={{ perspective: '1300px' }}
                >
                  <div
                    className="relative w-72 sm:w-80 h-[350px] flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `rotateX(${prismTilt.rx}deg) rotateZ(${prismTilt.rz}deg)`
                    }}
                  >
                    {/* Layer 3 (Bottom): Net Protected Wealth */}
                    <div
                      className="absolute w-72 sm:w-80 h-48 rounded-3xl bg-emerald-950/75 border border-emerald-400/40 p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl transition-transform duration-700"
                      style={{ transform: `translateZ(${prismExploded ? -115 : -65}px)` }}
                    >
                      <div className="flex justify-between items-center font-mono text-xs text-emerald-300">
                        <span>03 // NET WEALTH</span>
                        <span>+₺5.120/YR</span>
                      </div>
                      <div className="text-white font-semibold text-base">
                        {isTr ? 'Korunan Yıllık Servet' : 'Protected Annual Wealth'}
                      </div>
                    </div>

                    {/* Layer 2 (Middle): Gemini Price Hike & FX Matrix */}
                    <div
                      className="absolute w-72 sm:w-80 h-48 rounded-3xl bg-indigo-950/75 border border-indigo-400/40 p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl transition-transform duration-700"
                      style={{ transform: `translateZ(${prismExploded ? 0 : 0}px)` }}
                    >
                      <div className="flex justify-between items-center font-mono text-xs text-indigo-300">
                        <span>02 // GEMINI & FX LENS</span>
                        <span>20+ KUR</span>
                      </div>
                      <div className="text-xs text-white/85 font-mono">
                        {isTr ? '⚡ Zam Radarı & Anlık Merkez Kur' : '⚡ Price Hike Radar & Live FX'}
                      </div>
                    </div>

                    {/* Layer 1 (Top): Master Glass Surface */}
                    <div
                      className="absolute w-72 sm:w-80 h-48 rounded-3xl bg-stone-900/90 border border-[#D4AF7A]/50 p-6 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-transform duration-700"
                      style={{ transform: `translateZ(${prismExploded ? 115 : 65}px)` }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-[#D4AF7A]">01 // MASTER SURFACE</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 uppercase font-mono">
                          {isTr ? 'Aylık Konsolide Akış' : 'Consolidated Monthly Flow'}
                        </p>
                        <p className="text-3xl font-bold text-white font-mono mt-1">₺2.340,00</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-300 pt-2 border-t border-white/10">
                        <span>{isTr ? '8 Aktif Abonelik' : '8 Active Subscriptions'}</span>
                        <span className="text-[#D4AF7A] font-medium">Aboneyim Atelier</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPrismExploded(!prismExploded)}
                    className="mt-6 px-5 py-2 rounded-full bg-stone-900 dark:bg-white/10 text-white border border-stone-700 dark:border-white/20 font-mono text-xs uppercase tracking-wider hover:border-[#D4AF7A] transition-colors cursor-pointer"
                  >
                    {prismExploded
                      ? isTr ? '✦ Katmanları Birleştir' : '✦ Collapse Layers'
                      : isTr ? '✦ Katmanları Uzayda Ayır (Explode 3D)' : '✦ Explode 3D Layers'}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* 3. Feature Overview Grid */}
      <div className="relative z-10 bg-white/60 dark:bg-stone-950/60 backdrop-blur-sm border-t border-stone-200/60 dark:border-white/10">
        <FeatureGrid />
      </div>

      {/* 4. Micro Demo Strip */}
      <MicroDemoRow />

      {/* 6. Final CTA Section */}
      <div className="relative z-10">
        <FinalCTA onStart={() => handleAuth('signup')} onDemo={handleDemo} />
      </div>
    </div>
  );
}
