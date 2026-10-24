import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Send, Eye, Clock, Check, Sparkles } from 'lucide-react';
import { Story, User } from '../types';

interface StoriesSectionProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onStoryViewed: (storyId: string) => void;
  onReplyStory: (storyId: string, text: string) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  currentUser,
  onAddStory,
  onStoryViewed,
  onReplyStory,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Group stories by user so multiple stories per user show neatly
  const userStoriesMap = new Map<string, Story[]>();
  stories.forEach((s) => {
    const list = userStoriesMap.get(s.userId) || [];
    list.push(s);
    userStoriesMap.set(s.userId, list);
  });

  // Unique list of creators with stories
  const uniqueStoryHolders = Array.from(userStoriesMap.entries()).map(([userId, userStories]) => {
    return {
      userId,
      userStories,
      firstStory: userStories[0],
    };
  });

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="w-full bg-[#090d16] border-b border-white/5 py-3 px-3 overflow-x-auto no-scrollbar flex items-center gap-3.5 select-none">
      {/* 1. Add My Story Button */}
      <button
        onClick={onAddStory}
        className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none group cursor-pointer"
      >
        <div className="relative w-15 h-15 rounded-full p-0.5 border-2 border-dashed border-purple-500/50 group-hover:border-purple-400 transition-colors">
          <img
            src={currentUser.avatar}
            alt="My Story"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-[#090d16] flex items-center justify-center text-white shadow-md">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
        <span className="text-[11px] text-slate-300 font-medium truncate w-16 text-center">
          Your Vibe
        </span>
      </button>

      {/* 2. Other Users' Stories */}
      {uniqueStoryHolders.map(({ userId, userStories, firstStory }) => {
        const isMyOwn = userId === currentUser.id;
        const allViewed = userStories.every((s) => s.viewers.some((v) => v.userId === currentUser.id));

        return (
          <button
            key={userId}
            onClick={() => {
              const idx = stories.findIndex((s) => s.id === firstStory.id);
              if (idx !== -1) setActiveStoryIndex(idx);
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none group cursor-pointer"
          >
            <div
              className={`w-15 h-15 rounded-full p-[2.5px] transition-transform active:scale-95 ${
                allViewed
                  ? 'bg-slate-700'
                  : 'bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden p-[2px] bg-[#090d16]">
                <img
                  src={firstStory.userAvatar}
                  alt={firstStory.username}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-200 font-medium truncate w-16 text-center">
              {isMyOwn ? 'You' : firstStory.username}
            </span>
          </button>
        );
      })}

      {/* Full-Screen Story Viewer Modal */}
      {activeStory && (
        <StoryViewerModal
          story={activeStory}
          totalStories={stories.length}
          currentIndex={activeStoryIndex!}
          onClose={() => setActiveStoryIndex(null)}
          onNext={() => {
            if (activeStoryIndex! < stories.length - 1) {
              setActiveStoryIndex(activeStoryIndex! + 1);
            } else {
              setActiveStoryIndex(null);
            }
          }}
          onPrev={() => {
            if (activeStoryIndex! > 0) {
              setActiveStoryIndex(activeStoryIndex! - 1);
            }
          }}
          onViewed={() => onStoryViewed(activeStory.id)}
          onReply={(text) => onReplyStory(activeStory.id, text)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

interface StoryViewerModalProps {
  story: Story;
  totalStories: number;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onViewed: () => void;
  onReply: (text: string) => void;
  currentUser: User;
}

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  totalStories,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onViewed,
  onReply,
  currentUser,
}) => {
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const isPaused = useRef(false);

  // Time remaining calculation (24-hour expiration)
  const hoursLeft = Math.max(1, Math.round((story.expiresAt - Date.now()) / (1000 * 60 * 60)));

  useEffect(() => {
    onViewed();
    setProgress(0);
    setReplySent(false);

    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused.current) {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            onNext();
            return 100;
          }
          return prev + step;
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [story.id]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText('');
    setReplySent(true);
    setTimeout(() => setReplySent(false), 2500);
  };

  const isMyStory = story.userId === currentUser.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseDown={() => (isPaused.current = true)}
      onMouseUp={() => (isPaused.current = false)}
      onTouchStart={() => (isPaused.current = true)}
      onTouchEnd={() => (isPaused.current = false)}
    >
      <div className="relative w-full max-w-md h-full max-h-[96vh] bg-neutral-950 flex flex-col justify-between overflow-hidden sm:rounded-3xl shadow-2xl">
        {/* Background Image / Media */}
        <img
          src={story.mediaUrl}
          alt={story.caption || 'Story'}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

        {/* Top Controls & Progress Bar */}
        <div className="relative z-20 px-4 pt-3 flex flex-col gap-2.5">
          {/* Multi-story Segment Progress */}
          <div className="flex items-center gap-1.5 w-full">
            {Array.from({ length: totalStories }).map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{
                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={story.userAvatar}
                alt={story.username}
                className="w-8 h-8 rounded-full border border-white/40 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-2 text-white">
                <span className="text-xs font-bold leading-none">@{story.username}</span>
                <span className="text-[10px] text-white/70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hoursLeft}h left
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Left & Right Tap Zones to navigate */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={onPrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={onNext} />
        </div>

        {/* Story Sticker / Caption */}
        {(story.caption || story.sticker) && (
          <div className="relative z-20 px-6 my-auto flex flex-col items-center justify-center text-center pointer-events-none">
            {story.sticker && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-lg mb-3 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {story.sticker}
              </div>
            )}
            {story.caption && (
              <p className="text-white text-base font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xs">
                {story.caption}
              </p>
            )}
          </div>
        )}

        {/* Bottom Interaction Area */}
        <div className="relative z-20 px-4 pb-6 pt-3">
          {isMyStory ? (
            /* Story Creator Views Panel */
            <div className="w-full bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold">{story.viewers.length} views</span>
              </div>
              <button
                onClick={() => setShowViewers(!showViewers)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium underline cursor-pointer"
              >
                {showViewers ? 'Hide Viewers' : 'Viewers List'}
              </button>
            </div>
          ) : (
            /* Viewer Reply Input */
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Send message to @${story.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => (isPaused.current = true)}
                  onBlur={() => (isPaused.current = false)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {replySent && (
            <div className="mt-2 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Reply sent to direct messages!
            </div>
          )}

          {/* Viewers modal drawer for story owner */}
          {showViewers && (
            <div className="mt-3 bg-black/85 backdrop-blur-lg rounded-2xl p-3 border border-white/10 max-h-40 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recent Viewers ({story.viewers.length})
              </div>
              {story.viewers.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No viewers yet</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {story.viewers.map((v) => (
                    <div key={v.userId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={v.userAvatar} alt={v.username} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-medium text-white">@{v.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
