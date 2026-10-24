import React, { useState } from 'react';
import { X, Heart, MessageCircle, UserPlus, Diamond, Check, Bell } from 'lucide-react';
import { NotificationItem, User } from '../types';
import { API } from '../services/api';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  currentUser: User;
  onClose: () => void;
  onRefresh: () => void;
  onOpenProfile: (userId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  currentUser,
  onClose,
  onRefresh,
  onOpenProfile,
}) => {
  const [filter, setFilter] = useState<'all' | 'likes' | 'follows' | 'gifts'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'likes') return n.type === 'like' || n.type === 'comment';
    if (filter === 'follows') return n.type === 'follow' || n.type === 'follow_request';
    if (filter === 'gifts') return n.type === 'gift';
    return true;
  });

  const handleMarkAllRead = async () => {
    await API.markAllNotificationsRead();
    onRefresh();
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await API.markNotificationRead(notif.id);
      onRefresh();
    }
    if (notif.senderId) {
      onOpenProfile(notif.senderId);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-400" />;
      case 'gift':
        return <Diamond className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <h2 className="text-sm font-bold text-white">Activity & Notifications</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-2 bg-[#0d1322] border-b border-white/5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'likes', 'follows', 'gifts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-xl capitalize font-semibold transition-colors cursor-pointer ${
                filter === tab ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Activity' : tab}
            </button>
          ))}
          <button
            onClick={handleMarkAllRead}
            className="ml-auto text-[10px] text-purple-400 hover:underline whitespace-nowrap cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 no-scrollbar">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              No new notifications right now.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                  n.isRead ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-950/40 border border-purple-500/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={n.senderAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0d1322] border border-white/10">
                      {getIcon(n.type)}
                    </div>
                  </div>

                  <div className="text-xs leading-snug">
                    <span className="font-bold text-white mr-1">@{n.senderUsername}</span>
                    <span className="text-slate-300">{n.text}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!n.isRead && <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
