import React from 'react';
import { Home, Compass, PlusSquare, Clapperboard, User as UserIcon, Heart, Send, Radio, BarChart3, ShieldAlert } from 'lucide-react';
import { User } from '../types';

export type TabType = 'home' | 'explore' | 'create' | 'reels' | 'messages' | 'profile' | 'creator' | 'live' | 'admin';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  currentUser: User;
  unreadNotifications: number;
  unreadMessages: number;
  onOpenNotifications: () => void;
  onOpenLive: () => void;
}

export const TopHeader: React.FC<{
  currentUser: User;
  unreadNotifications: number;
  unreadMessages: number;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onOpenLive: () => void;
  onOpenCreator: () => void;
  onOpenAdmin?: () => void;
}> = ({
  currentUser,
  unreadNotifications,
  unreadMessages,
  onOpenNotifications,
  onOpenMessages,
  onOpenLive,
  onOpenCreator,
  onOpenAdmin,
}) => {
  return (
    <header className="h-14 px-4 bg-[#090d16]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-30 shrink-0">
      {/* VibeGram Logo & Brand Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-[1.5px] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <img
            src="/src/assets/images/vibegram_app_icon_1792852720712.jpg"
            alt="VibeGram Logo"
            className="w-full h-full object-cover rounded-[10px]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-200 to-pink-300 bg-clip-text text-transparent leading-none">
            VibeGram
          </span>
          <span className="text-[9px] text-purple-400 font-mono tracking-wider uppercase font-semibold">
            Social
          </span>
        </div>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Live Broadcast Trigger */}
        <button
          onClick={onOpenLive}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 text-red-300 text-[11px] font-bold hover:bg-red-600/30 transition-all cursor-pointer"
          title="Vibe Live Streaming"
        >
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="hidden sm:inline">LIVE</span>
        </button>

        {/* Creator Studio Shortcut */}
        <button
          onClick={onOpenCreator}
          className="p-2 text-slate-300 hover:text-purple-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          title="Creator Studio"
        >
          <BarChart3 className="w-5 h-5" />
        </button>

        {/* Admin Portal Shortcut if Admin */}
        {currentUser.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-full transition-colors cursor-pointer"
            title="Administrator Control Room"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        )}

        {/* Notifications Heart */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-300 hover:text-pink-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <Heart className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#090d16]">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* Direct Messages Paperplane */}
        <button
          onClick={onOpenMessages}
          className="relative p-2 text-slate-300 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          title="Direct Messages"
        >
          <Send className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#090d16]">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export const BottomNavBar: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  currentUser,
}) => {
  return (
    <nav className="h-14 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-30 shrink-0 select-none">
      {/* 1. Home */}
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
          activeTab === 'home' ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Home Feed"
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5">Feed</span>
      </button>

      {/* 2. Explore / Search */}
      <button
        onClick={() => onChangeTab('explore')}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
          activeTab === 'explore' ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Explore & Search"
      >
        <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5">Explore</span>
      </button>

      {/* 3. Create (Glowing Center Button) */}
      <button
        onClick={() => onChangeTab('create')}
        className="flex flex-col items-center justify-center -mt-2 transition-transform active:scale-95 cursor-pointer"
        title="Create Post or Reel"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)] border border-white/20">
          <PlusSquare className="w-6 h-6 text-white stroke-[2.5]" />
        </div>
      </button>

      {/* 4. Reels */}
      <button
        onClick={() => onChangeTab('reels')}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
          activeTab === 'reels' ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Short Video Reels"
      >
        <Clapperboard className={`w-5 h-5 ${activeTab === 'reels' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5">Reels</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
          activeTab === 'profile' ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="My Profile"
      >
        <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${activeTab === 'profile' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-500'}`}>
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="w-full h-full p-0.5 text-slate-300" />
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
