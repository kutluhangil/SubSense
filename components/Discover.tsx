import React, { useState, useRef, useEffect } from 'react';
import { SUBSCRIPTION_CATALOG, BRAND_COLORS } from '../utils/data';
import SubscriptionProfileModal from './SubscriptionProfileModal';
import { ArrowRight } from 'lucide-react';
import { getBrandLogo } from '../utils/logoUtils';

// --- DATA: BENTO GRID LAYOUT ---
const EXPLORE_CARDS = [
  // FEATURED (Row 1-2)
  { id: 'netflix', style: 'netflix', colSpan: 'col-span-2 md:col-span-2 lg:col-span-2', rowSpan: 'row-span-2', color: BRAND_COLORS['netflix'] },
  { id: 'spotify', style: 'spotify', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['spotify'] },
  { id: 'youtubepremium', style: 'youtube', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['youtube'] },
  { id: 'disney+', style: 'disney', colSpan: 'col-span-2', rowSpan: 'row-span-1', color: BRAND_COLORS['disney'] },

  // Row 3 (Mixed)
  { id: 'amazonprimevideo', style: 'prime', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['amazonprimevideo'] },
  { id: 'hbomax', style: 'max', colSpan: 'col-span-1', rowSpan: 'row-span-2', color: BRAND_COLORS['hbomax'] },
  { id: 'appletv+', style: 'appletv', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['appletv+'] },
  { id: 'hulu', style: 'hulu', colSpan: 'col-span-1', rowSpan: 'row-span-2', color: BRAND_COLORS['hulu'] },

  // Row 4
  { id: 'microsoft365', style: 'microsoft', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['microsoft365'] },
  { id: 'canvapro', style: 'canva', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['canvapro'] },

  // Row 5 & Mixed
  { id: 'chatgptplus', style: 'chatgpt', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['chatgpt'] },
  { id: 'adobecreativecloud', style: 'adobe', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['adobe'] },
  { id: 'xboxgamepass', style: 'xbox', colSpan: 'col-span-2', rowSpan: 'row-span-1', color: BRAND_COLORS['xboxgamepass'] },

  // More items - filling the grid
  { id: 'playstationplus', style: 'disney', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-[#00439C]', color: '#00439C' },
  { id: 'googleworkspace', style: 'microsoft', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-blue-50', color: '#4285F4' },
  { id: 'slack', style: 'slack', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['slack'] },
  { id: 'notionplus', style: 'appletv', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: '#000000' },
  { id: 'figma', style: 'canva', colSpan: 'col-span-2', rowSpan: 'row-span-1', customGradient: 'bg-gradient-to-tr from-[#F24E1E] to-[#A259FF]', color: '#F24E1E' },
  { id: 'githubcopilot', style: 'appletv', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: '#000000' },
  { id: 'amazonprime', style: 'prime', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['amazonprime'] },
  { id: 'discordnitro', style: 'max', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-[#5865F2]', color: '#5865F2' },
  { id: 'duolingo', style: 'spotify', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-[#58CC02]', color: '#58CC02' },

  // Remaining items to ensure grid is full and rich
  { id: 'twitchturbo', style: 'max', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-[#9146FF]', color: '#9146FF' },
  { id: 'zoom', style: 'youtube', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['zoom'] },
  { id: 'dropbox', style: 'microsoft', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['dropbox'] },
  { id: 'audible', style: 'prime', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['audible'] },
  { id: 'masterclass', style: 'netflix', colSpan: 'col-span-1', rowSpan: 'row-span-1', color: BRAND_COLORS['masterclass'] },
  { id: 'peacock', style: 'hulu', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-black', color: '#000000' },
  { id: 'paramount+', style: 'disney', colSpan: 'col-span-1', rowSpan: 'row-span-1', customBg: 'bg-[#0064FF]', color: '#0064FF' },
];

interface CardContainerProps {
  children: React.ReactNode;
  className: string;
  colSpan?: string;
  rowSpan?: string;
  onClick: () => void;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className,
  colSpan = 'col-span-1',
  rowSpan = 'row-span-1',
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || window.matchMedia('(pointer: coarse)').matches) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // More subtle movement for premium feel
    const maxRot = isDark ? 2 : 3;
    const lift = -4;
    const scale = 1.02;

    const rotateX = ((y - centerY) / centerY) * -maxRot;
    const rotateY = ((x - centerX) / centerX) * maxRot;

    requestAnimationFrame(() => {
      setTransformStyle(`perspective(1000px) translateY(${lift}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      const glowOpacity = isDark ? 0.08 : 0.15;
      setGlowStyle({
        opacity: 1,
        background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,${glowOpacity}), transparent 70%)`
      });
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setGlowStyle({ opacity: 0 });
  };

  const finalTransform = transformStyle || 'none';

  return (
    <div
      ref={ref}
      className={`${colSpan} ${rowSpan} ${className} relative rounded-2xl will-change-transform h-full w-full overflow-hidden transition-all duration-300`}
      style={{
        transform: finalTransform,
        transition: transformStyle ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: transformStyle ? (isDark ? '0 20px 40px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(0, 0, 0, 0.2)') : undefined,
        zIndex: transformStyle ? 20 : 1
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 mix-blend-overlay" style={glowStyle} />
    </div>
  );
}

export default function Discover() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const handleCardClick = (id: string) => setSelectedServiceId(id);

  const getServiceData = (id: string) => {
    const key = id.toLowerCase();
    const catalogItem = SUBSCRIPTION_CATALOG[key];
    return catalogItem || {
      id: key,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      description: "Manage your subscription efficiently.",
      price: "9.99",
      currency: "USD",
      type: key,
      foundedYear: "Unknown",
      founders: "Unknown",
      headquarters: "Unknown",
      ceo: "Unknown"
    };
  };

  // Find the color for the selected service from our card config or brand map
  const getServiceColor = (id: string) => {
    const card = EXPLORE_CARDS.find(c => c.id === id);
    if (card && card.color) return card.color;
    return BRAND_COLORS[id] || BRAND_COLORS['default'];
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover new services tailored to your digital life.</p>
        </div>
        <button className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
          <span className="material-icons-outlined">menu</span>
        </button>
      </header>

      {/* BENTO GRID LAYOUT */}
      {/* Defined minimum height rows to ensure consistent rhythm, but allow spans */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px] md:auto-rows-[180px]">
        {EXPLORE_CARDS.map((card) => {
          const service = getServiceData(card.id);
          const logoUrl = getBrandLogo(card.id);

          // Common card interior props
          const commonProps = {
            key: card.id,
            onClick: () => handleCardClick(card.id),
            colSpan: card.colSpan,
            rowSpan: card.rowSpan,
            className: "shadow-sm hover:shadow-xl cursor-pointer bg-white dark:bg-gray-900",
          };

          // --- NETFLIX (Cinematic) ---
          if (card.style === 'netflix') {
            return (
              <CardContainer {...commonProps} className="bg-black text-white group relative">
                <div className="absolute inset-0">
                  <img alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ29QXhahgV2gkyou2n_YGIkdkkrsVbFNAX6OpbhzXUxHcH5FNaOrVGdVXw9ztIsWVA_2Ko_WtzYR8o80kfXcL_OsvQuozAyOF-WIoC1_ZJUGuVN_JLxaoDF3_PCR0FrmWUcMZYvh2iFE5pOkSx6fjJ1GWbkCou2q_UxFgZ11R-ha3cPwF9wDpYh4LCYPrGmUQFQH2YD60OQbyEau62TT7wANVBeF2uGwxK4_sZDOXmG1wpmD3yPCv4I795nvk8pKfqFX53n16WkU" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>
                <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                  {logoUrl ? (
                    <img src={logoUrl} alt={service.name} className="h-10 md:h-12 w-auto mb-3 object-contain self-start drop-shadow-lg" />
                  ) : (
                    <h3 className="text-3xl md:text-4xl font-black text-[#E50914] mb-2 uppercase tracking-tighter">{service.name}</h3>
                  )}
                  <p className="text-gray-300 text-xs md:text-sm line-clamp-3 font-medium opacity-90">{service.description}</p>
                </div>
              </CardContainer>
            );
          }

          // --- SPOTIFY (Flat Brand) ---
          if (card.style === 'spotify') {
            return (
              <CardContainer {...commonProps} className={`group ${card.customBg || 'bg-[#1DB954]'}`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  {logoUrl ? (
                    <img src={logoUrl} alt={service.name} className="h-8 w-auto object-contain self-start brightness-0 invert drop-shadow-md" />
                  ) : (
                    <h3 className="text-xl font-bold text-white tracking-tight">{service.name}</h3>
                  )}
                  <p className="text-white/90 text-xs font-medium line-clamp-2">{service.description}</p>
                </div>
              </CardContainer>
            );
          }

          // --- DISNEY (Gradient) ---
          if (card.style === 'disney') {
            const bgClass = card.customBg || 'bg-[#113CCF]';
            return (
              <CardContainer {...commonProps} className={`group ${bgClass}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                <div className="relative z-10 p-5 h-full flex flex-col items-center justify-center text-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt={service.name} className="h-12 w-auto object-contain mb-3 drop-shadow-lg" />
                  ) : (
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-wide font-serif">{service.name}</h3>
                  )}
                  <p className="text-blue-100 text-xs line-clamp-2">{service.description}</p>
                </div>
              </CardContainer>
            );
          }

          // --- YOUTUBE / GENERIC (Light/Dark Clean) ---
          if (card.style === 'youtube' || card.style === 'microsoft' || card.style === 'appletv') {
            const isDarkBg = card.style === 'appletv';
            const bg = isDarkBg ? 'bg-black dark:bg-[#1c1c1e]' : (card.customBg || 'bg-white dark:bg-zinc-800');
            const text = isDarkBg ? 'text-white' : 'text-gray-900 dark:text-white';

            return (
              <CardContainer {...commonProps} className={`group ${bg} border border-gray-100 dark:border-gray-700`}>
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  {logoUrl ? (
                    <img src={logoUrl} alt={service.name} className={`h-8 w-auto object-contain self-start ${isDarkBg ? 'brightness-0 invert' : ''}`} />
                  ) : (
                    <h3 className={`text-xl font-bold ${text} tracking-tight`}>{service.name}</h3>
                  )}
                  <p className={`${isDarkBg ? 'text-gray-400' : 'text-gray-500'} text-xs line-clamp-2`}>{service.description}</p>
                </div>
              </CardContainer>
            );
          }

          // --- PRIME / BRANDED ---
          if (card.style === 'prime' || card.style === 'max' || card.style === 'slac' || card.style === 'hulu') {
            return (
              <CardContainer {...commonProps} className={`group ${card.customBg || 'bg-gray-800'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30"></div>
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  {logoUrl ? (
                    <img src={logoUrl} alt={service.name} className="h-8 md:h-10 w-auto object-contain self-start drop-shadow-md brightness-0 invert" />
                  ) : (
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">{service.name}</h3>
                  )}
                  <p className="text-white/90 text-xs font-medium line-clamp-2">{service.description}</p>
                </div>
              </CardContainer>
            );
          }

          // --- DEFAULT / OTHER ---
          return (
            <CardContainer {...commonProps} className={`group ${card.customBg || 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'} border border-gray-100 dark:border-gray-800`}>
              {card.customGradient && <div className={`absolute inset-0 ${card.customGradient} opacity-20`}></div>}
              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                {logoUrl ? (
                  <img src={logoUrl} alt={service.name} className="h-8 w-auto object-contain self-start" />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                )}
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">{service.description}</p>
              </div>
            </CardContainer>
          );
        })}
      </div>

      <SubscriptionProfileModal
        isOpen={!!selectedServiceId}
        onClose={() => setSelectedServiceId(null)}
        service={selectedServiceId ? getServiceData(selectedServiceId) : null}
        themeColor={selectedServiceId ? getServiceColor(selectedServiceId) : undefined}
        logoUrl={selectedServiceId ? getBrandLogo(selectedServiceId) : undefined}
      />
    </div>
  );
}
