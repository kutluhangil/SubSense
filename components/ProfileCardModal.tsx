
import React, { useEffect, useState } from 'react';
import { X, MapPin, Link as LinkIcon, Calendar, Shield, MessageCircle, UserPlus, Music, Github, Globe, Check } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  totalSubs: number;
  monthlySpend: number;
  currency: string;
  status?: 'online' | 'offline' | 'away';
  isSelf?: boolean;
  integrations?: string[];
  badges?: string[];
}

interface ProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export default function ProfileCardModal({ isOpen, onClose, user }: ProfileCardModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Small delay for entrance animation trigger
      setTimeout(() => setIsLoaded(true), 50);
    } else {
      setIsLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const formatMessage = (template: string, ...args: string[]) => {
    return template.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>

      {/* Card Container */}
      <div 
        className={`relative w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-white/50 transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
      >
        {/* Holographic/Gradient Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
        <div className="absolute top-0 right-0 p-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 p-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white rounded-full transition-colors z-20 backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Profile Content */}
        <div className="relative px-6 pt-12 pb-8 flex flex-col items-center text-center">
           
           {/* Avatar with Status Ring */}
           <div className="relative mb-4 group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {user.status && (
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-500' : 
                    user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              )}
           </div>

           {/* Name & Identity */}
           <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{user.name}</h2>
              <p className="text-sm font-medium text-indigo-600">@{user.username}</p>
           </div>

           {/* Bio */}
           <p className="text-sm text-gray-600 leading-relaxed mb-6 px-4">
              {user.bio || t('profile.no_bio')}
           </p>

           {/* Metadata Pills */}
           <div className="flex flex-wrap justify-center gap-2 mb-8">
              {user.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
                    <MapPin size={12} /> {user.location}
                  </span>
              )}
              {user.joinedDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
                    <Calendar size={12} /> {formatMessage(t('profile.joined'), user.joinedDate)}
                  </span>
              )}
              {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-600 shadow-sm hover:bg-blue-100 transition-colors">
                    <LinkIcon size={12} /> {t('profile.website')}
                  </a>
              )}
           </div>

           {/* Stats Row */}
           <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('profile.active_subs')}</p>
                 <p className="text-xl font-bold text-gray-900">{user.totalSubs}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('profile.monthly')}</p>
                 <p className="text-xl font-bold text-gray-900">
                    {user.currency === 'USD' ? '$' : user.currency}
                    {user.monthlySpend.toLocaleString()}
                 </p>
              </div>
           </div>

           {/* Connected Integrations */}
           {user.integrations && user.integrations.length > 0 && (
             <div className="mb-8 w-full">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">{t('settings.connected')}</p>
                <div className="flex justify-center gap-3">
                   {user.integrations.includes('spotify') && (
                     <div className="w-8 h-8 rounded-full bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954]" title="Spotify">
                        <Music size={16} />
                     </div>
                   )}
                   {user.integrations.includes('github') && (
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900" title="GitHub">
                        <Github size={16} />
                     </div>
                   )}
                   {user.integrations.includes('website') && (
                     <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500" title="Portfolio">
                        <Globe size={16} />
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* Actions */}
           <div className="flex gap-3 w-full">
              {user.isSelf ? (
                <button 
                  onClick={onClose}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all"
                >
                  {t('profile.edit_profile')}
                </button>
              ) : (
                <>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all">
                     <UserPlus size={18} /> {t('profile.add_friend')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all">
                     <MessageCircle size={18} /> {t('profile.message')}
                  </button>
                </>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
