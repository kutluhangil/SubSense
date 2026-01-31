
import React, { useState } from 'react';
import { SUBSCRIPTION_CATALOG, ALL_SUBSCRIPTIONS } from '../utils/data';
import SubscriptionProfileModal from './SubscriptionProfileModal';
import { ArrowRight } from 'lucide-react';

// This data mapping ensures we use the EXACT visual style requested for specific brands
// while allowing us to populate the grid with 30+ items using variations of these styles.
const EXPLORE_CARDS = [
  // Row 1 Visuals
  { id: 'netflix', style: 'netflix', height: 'h-[420px]' },
  { id: 'spotify', style: 'spotify', height: 'h-[220px]' },
  { id: 'youtubepremium', style: 'youtube', height: 'h-[240px]' },
  { id: 'disney+', style: 'disney', height: 'h-[380px]' },
  
  // Row 2 Visuals
  { id: 'amazonprimevideo', style: 'prime', height: 'h-[200px]' },
  { id: 'hbomax', style: 'max', height: 'h-[260px]' },
  { id: 'appletv+', style: 'appletv', height: 'h-[220px]' },
  { id: 'hulu', style: 'hulu', height: 'h-[340px]' },

  // Row 3 Visuals
  { id: 'microsoft365', style: 'microsoft', height: 'h-[240px]' },
  { id: 'canvapro', style: 'canva', height: 'h-[280px]' },
  { id: 'chatgptplus', style: 'chatgpt', height: 'h-[200px]' },
  { id: 'adobecreativecloud', style: 'adobe', height: 'h-[300px]' },
  { id: 'xboxgamepass', style: 'xbox', height: 'h-[240px]' },

  // Expansion Items (Reusing styles for scale)
  { id: 'playstationplus', style: 'disney', height: 'h-[320px]', customBg: 'bg-[#00439C]' }, // PS Plus
  { id: 'googleworkspace', style: 'microsoft', height: 'h-[220px]', customBg: 'bg-blue-50' },
  { id: 'slack', style: 'slack', height: 'h-[260px]' },
  { id: 'notionplus', style: 'appletv', height: 'h-[240px]' }, // Notion fits Apple style (minimal)
  { id: 'figma', style: 'canva', height: 'h-[280px]', customGradient: 'bg-gradient-to-tr from-[#F24E1E] to-[#A259FF]' },
  { id: 'githubcopilot', style: 'appletv', height: 'h-[220px]' }, // GitHub fits dark style
  { id: 'amazonprime', style: 'prime', height: 'h-[200px]' },
  { id: 'discordnitro', style: 'max', height: 'h-[240px]', customBg: 'bg-[#5865F2]' },
  { id: 'duolingo', style: 'spotify', height: 'h-[220px]', customBg: 'bg-[#58CC02]' },
  { id: 'masterclass', style: 'netflix', height: 'h-[360px]' },
  { id: 'audible', style: 'prime', height: 'h-[200px]' },
  { id: 'midjourney', style: 'appletv', height: 'h-[240px]' },
  { id: 'zoom', style: 'youtube', height: 'h-[220px]' },
  { id: 'dropbox', style: 'microsoft', height: 'h-[200px]' },
  { id: 'twitchturbo', style: 'max', height: 'h-[240px]', customBg: 'bg-[#9146FF]' },
  { id: 'peacock', style: 'hulu', height: 'h-[280px]', customBg: 'bg-black' },
  { id: 'paramount+', style: 'disney', height: 'h-[300px]', customBg: 'bg-[#0064FF]' },
];

export default function Discover() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setSelectedServiceId(id);
  };

  const getServiceData = (id: string) => {
    const key = id.toLowerCase();
    return SUBSCRIPTION_CATALOG[key] || {
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

  return (
    <div className="animate-in fade-in duration-500">
        <style>{`
            .masonry-grid {
                column-count: 1;
                column-gap: 1.5rem;
            }
            @media (min-width: 768px) {
                .masonry-grid {
                    column-count: 2;
                }
            }
            @media (min-width: 1024px) {
                .masonry-grid {
                    column-count: 3;
                }
            }
            @media (min-width: 1280px) {
                .masonry-grid {
                    column-count: 4;
                }
            }
            .masonry-item {
                break-inside: avoid;
                margin-bottom: 1.5rem;
            }
        `}</style>

      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover new services tailored to your digital life.</p>
        </div>
        <button className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
          <span className="material-icons-outlined">menu</span>
        </button>
      </header>

      <div className="masonry-grid">
        {EXPLORE_CARDS.map((card) => {
          const service = getServiceData(card.id);
          
          // --- TEMPLATE: NETFLIX STYLE (Cinematic) ---
          if (card.style === 'netflix') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-black">
                  <img alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ29QXhahgV2gkyou2n_YGIkdkkrsVbFNAX6OpbhzXUxHcH5FNaOrVGdVXw9ztIsWVA_2Ko_WtzYR8o80kfXcL_OsvQuozAyOF-WIoC1_ZJUGuVN_JLxaoDF3_PCR0FrmWUcMZYvh2iFE5pOkSx6fjJ1GWbkCou2q_UxFgZ11R-ha3cPwF9wDpYh4LCYPrGmUQFQH2YD60OQbyEau62TT7wANVBeF2uGwxK4_sZDOXmG1wpmD3yPCv4I795nvk8pKfqFX53n16WkU"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                </div>
                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                  <div className="flex-1 flex items-end">
                    <h3 className="text-4xl font-black text-[#E50914] uppercase tracking-tighter mb-2">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-6 font-medium leading-relaxed opacity-90">{service.description}</p>
                    <div className="flex items-center text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: SPOTIFY STYLE (Color Overlay) ---
          if (card.style === 'spotify') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${card.customBg || 'bg-[#1DB954]'}`}>
                  <img alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9ISkwsBtvU_KO9P1o89YaxZhiFraAAhgwS59O-NsoMO9FNkF8kRCLeHJeDNfJ8QltxlINDQDoW07OeTOl_JrDaIZNBvXMbChVU9qkCbOXEBqFAo8eib2wP0IM77Hp5_MrQygujAObkUVDco190uoFoie1dArA9bmyLPDBZr1v-Y50H_u_AQOAM4UlL-lbulChnJCn8uNw3Idk6gO8UxFslcinemiQHfIxYrq_6twFzVhLpxa7m3BjVBNuetE4eqe3xHYAiOWQaBI"/>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: YOUTUBE STYLE (Clean/Light) ---
          if (card.style === 'youtube') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight condensed">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-gray-900 dark:text-white opacity-60 group-hover:opacity-100 transition-opacity">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: DISNEY STYLE (Deep Blue/Gradient) ---
          if (card.style === 'disney') {
            const bgClass = card.customBg || 'bg-[#113CCF]';
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${bgClass}`}>
                  <img alt="" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY-L5CQ7QZ85SjnVmOhmITG76HlSINjAJ2taa0sUohRi8sFVTMOCWKUyBUHCL62Z4YUg0TEYHjQSV81ylxjlMvFwLxfr5mBwadL2KLJW-O6kvjGCxLkSzltZ2BuOOlvbjQ3qnSvmR0cpzRnsaInIJG_kZc1RespkfPnET116L0uPihelh6EKU20h8hJBb5em4UQkWCPAUbbmBCLWsX4EGF5GIW6xr5CRRp7AJ1TMR8ml_Z-6D0eFse1SaCEX9D3j1tznsY3iNxxGQ"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b30] to-transparent"></div>
                </div>
                <div className="relative z-10 p-6 flex flex-col justify-between h-full text-center items-center">
                  <div className="flex-1 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white tracking-wide font-serif">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="inline-flex items-center text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: PRIME STYLE (Gradient Brand) ---
          if (card.style === 'prime') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-[#00A8E1]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A8E1] to-[#002F6C]"></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="text-white font-bold text-3xl italic tracking-tight">{service.name.toLowerCase()}</div>
                  <div>
                    <p className="text-white/90 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: MAX STYLE (Dark Purple/Black) ---
          if (card.style === 'max') {
            const bgClass = card.customBg || 'bg-purple-900';
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${bgClass}`}>
                  <img alt="" className="w-full h-full object-cover opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF5GL4xU6ZzE7CyjWS4OkkQ4TzxMLUGJCjI1YH4dnRT03NQmVhMth7k_S4Ir9cXsVoFbEVykL7keVbG4a1sKzgMkV7eusuhVUoW37bU_4HSI0qqG-yOTgz_z9-DE_PX_mcUAtzONxU8qx4H0IEybS3-t5Psiwba00eW-gwVOek_LHe0BLBkNXUiJiV9xHTGGjgcVXZS-DN7mkHae3ipuXGgyrS2U4dtXh29w-hLGCqKirpfKe2U_ybZhH0y-xDxmbsM04_e6fzE9c"/>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <div className="mb-auto pt-4">
                    <h3 className="text-3xl font-black text-white tracking-tighter">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: APPLE TV STYLE (Minimal Dark) ---
          if (card.style === 'appletv') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-black dark:bg-[#1c1c1e]"></div>
                <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{service.description}</p>
                  <div className="flex items-center text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: HULU STYLE (Vibrant Green/Dark) ---
          if (card.style === 'hulu') {
            const bgClass = card.customBg || 'bg-[#1CE783]';
            const textColor = card.customBg ? 'text-white' : 'text-[#040F1D]';
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${bgClass}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#040F1D] opacity-90"></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <h3 className="text-4xl font-black text-white tracking-widest uppercase">{service.name}</h3>
                  <div>
                    <p className="text-green-100 text-sm mb-4 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: MICROSOFT STYLE (Corporate/Light) ---
          if (card.style === 'microsoft') {
            const bgClass = card.customBg || 'bg-blue-50';
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${bgClass} dark:bg-slate-800`}>
                  <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                       Explore <ArrowRight className="ml-1 w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: CANVA STYLE (Gradient Light) ---
          if (card.style === 'canva') {
            const gradient = card.customGradient || 'bg-gradient-to-tr from-[#00C4CC] via-[#7D2AE8] to-[#F1F3F5]';
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className={`absolute inset-0 ${gradient}`}></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight" style={{ fontFamily: 'sans-serif' }}>{service.name}</h3>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-medium">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-[#7D2AE8] group-hover:translate-x-1 transition-transform">
                       Explore <ArrowRight className="ml-1 w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: CHATGPT STYLE (Tech/Green) ---
          if (card.style === 'chatgpt') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-[#10A37F] dark:bg-[#000000]">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: ADOBE STYLE (Gradient Red/Orange) ---
          if (card.style === 'adobe') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000] via-[#FF9900] to-[#FF0080]"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: XBOX STYLE (Gamer Green) ---
          if (card.style === 'xbox') {
            return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-[#107C10]">
                  <img alt="" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtqf5Q4C-cepR3TFkzxjQmWOCK0AssWQsl0_E49SIbJVAm6DFW1G4tEYA7a7Zfs09-rL5qnupx-UPADFhJxD1Wo5nDzLTK4gBAn4b39395bTW8hzpNAmGZ0uRomeMcsoEqaHGhLdHNa0621jAIfW8uG0cCqDCF9pedmaKt7N6evWv_yVdnyzSlyMnI88IMQJo_0HFXn4UYDdyhZI-nmmFzhJdAQ46gbHIpieURzcpzEZb7PM5KjLbkxsMp2m2hnI5CSD-UNAcTR_E"/>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // --- TEMPLATE: SLACK STYLE (Simple Color) ---
          if (card.style === 'slack') {
             return (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className={`masonry-item relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 ${card.height} cursor-pointer`}>
                <div className="absolute inset-0 bg-[#4A154B]">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{service.name}</h3>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                       Explore <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
             )
          }

          return null;
        })}
      </div>

      <SubscriptionProfileModal 
         isOpen={!!selectedServiceId}
         onClose={() => setSelectedServiceId(null)}
         service={selectedServiceId ? getServiceData(selectedServiceId) : null}
      />
    </div>
  );
}
