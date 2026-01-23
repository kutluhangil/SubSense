import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from './ProfileCardModal';
import { MapPin } from 'lucide-react';

interface ProfileCarouselProps {
  onProfileClick: (profile: UserProfile) => void;
}

const MOCK_PROFILES: UserProfile[] = [
  {
    name: "Alex Morgan",
    username: "alexmorgan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Product designer. Coffee lover ☕",
    location: "New York, USA",
    totalSubs: 12,
    monthlySpend: 245.50,
    currency: "USD",
    status: "online",
    joinedDate: "Oct 2023",
    website: "alex.design",
    integrations: ['spotify', 'github']
  },
  {
    name: "Emma Wilson",
    username: "emwilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Minimalist. Tracking essentials only.",
    location: "London, UK",
    totalSubs: 8,
    monthlySpend: 189.30,
    currency: "GBP",
    status: "offline",
    joinedDate: "Sep 2023",
    integrations: ['netflix']
  },
  {
    name: "Marcus Johnson",
    username: "mjdesigns",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Tech geek tracking SaaS tools.",
    location: "Berlin, DE",
    totalSubs: 15,
    monthlySpend: 310.00,
    currency: "EUR",
    status: "online",
    joinedDate: "Nov 2023",
    integrations: ['github', 'slack']
  },
  {
    name: "Sarah Jenkins",
    username: "sjenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Digital nomad. Streaming enthusiast.",
    location: "Austin, USA",
    totalSubs: 9,
    monthlySpend: 220.10,
    currency: "USD",
    status: "away",
    joinedDate: "Dec 2023",
    integrations: ['spotify', 'youtube']
  }
];

export default function ProfileCarousel({ onProfileClick }: ProfileCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  
  // Sound effect
  const playHoverSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  return (
    <div className="relative w-full h-[400px] overflow-hidden mask-gradient-x flex items-center justify-center">
      {/* Container for infinite scroll */}
      <div 
        className={`flex gap-6 absolute left-0 transition-transform ease-linear will-change-transform ${isPaused ? 'paused' : ''}`}
        style={{ 
          animation: 'scroll 30s linear infinite',
          width: 'max-content'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Triple the array to ensure smooth infinite loop */}
        {[...MOCK_PROFILES, ...MOCK_PROFILES, ...MOCK_PROFILES].map((profile, idx) => (
          <div 
            key={`${profile.username}-${idx}`}
            onClick={() => onProfileClick(profile)}
            onMouseEnter={playHoverSound}
            className="w-72 bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-[24px] shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex-shrink-0 group"
          >
             <div className="flex items-center gap-4 mb-4">
               <div className="relative">
                 <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                 <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                   profile.status === 'online' ? 'bg-green-500' : profile.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                 }`}></div>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 leading-tight">{profile.name}</h4>
                 <p className="text-xs font-medium text-indigo-600">@{profile.username}</p>
               </div>
             </div>
             
             <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500 font-medium">Active Subs</span>
                   <span className="font-bold text-gray-900">{profile.totalSubs}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${Math.min((profile.totalSubs/20)*100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500 font-medium">Monthly Spend</span>
                   <span className="font-bold text-gray-900">
                     {profile.currency === 'USD' ? '$' : profile.currency === 'GBP' ? '£' : '€'}{profile.monthlySpend.toFixed(2)}
                   </span>
                </div>
             </div>

             <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                <MapPin size={10} /> {profile.location}
             </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); } /* Move by one set length */
        }
        .paused {
          animation-play-state: paused !important;
        }
        .mask-gradient-x {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}