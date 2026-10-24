import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, CheckCircle2, Diamond } from 'lucide-react';
import { Reel, User } from '../types';
import { API } from '../services/api';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  onOpenProfile: (userId: string) => void;
  onFollowToggle?: (userId: string) => void;
  followingSet?: Set<string>;
  onTipCreator?: (creatorId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  currentUser,
  onOpenProfile,
  onFollowToggle,
  followingSet = new Set(),
  onTipCreator,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [reelComments, setReelComments] = useState<{ id: string; user: string; text: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchStartTime = useRef<number>(Date.now());

  // Initialize reel like states
  useEffect(() => {
    const lMap: Record<string, boolean> = {};
    const countMap: Record<string, number> = {};
    const sMap: Record<string, boolean> = {};

    reels.forEach((r) => {
      lMap[r.id] = r.likedByUserIds.includes(currentUser.id);
      countMap[r.id] = r.likesCount;
      sMap[r.id] = r.savedByUserIds.includes(currentUser.id);
    });

    setLikedMap(lMap);
    setLikesCountMap(countMap);
    setSavedMap(sMap);
  }, [reels, currentUser.id]);

  const currentReel = reels[currentIndex] || reels[0];

  // Log watch time on reel switch
  useEffect(() => {
    watchStartTime.current = Date.now();
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute and play
        setIsMuted(true);
        videoRef.current?.play().catch(() => {});
      });
    }

    return () => {
      const elapsed = Math.round((Date.now() - watchStartTime.current) / 1000);
      if (currentReel && elapsed > 1) {
        API.logReelWatch(currentReel.id, elapsed).catch(() => {});
      }
    };
  }, [currentIndex, currentReel?.id]);

  // Key navigation for keyboard (Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === ' ') {
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLikeToggle = async () => {
    if (!currentReel) return;
    const currentLiked = likedMap[currentReel.id];
    const nextLiked = !currentLiked;

    setLikedMap((prev) => ({ ...prev, [currentReel.id]: nextLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [currentReel.id]: nextLiked ? (prev[currentReel.id] || 0) + 1 : Math.max(0, (prev[currentReel.id] || 0) - 1),
    }));

    await API.toggleLikeReel(currentReel.id);
  };

  const handleDoubleTap = () => {
    if (!likedMap[currentReel?.id]) {
      handleLikeToggle();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleSaveToggle = () => {
    if (!currentReel) return;
    setSavedMap((prev) => ({ ...prev, [currentReel.id]: !prev[currentReel.id] }));
  };

  const openComments = () => {
    setReelComments([
      { id: '1', user: 'marcostravels', text: 'Insane flow! What camera angle did you shoot this with? 🔥' },
      { id: '2', user: 'elena_art', text: 'The neon lighting complements the music so perfectly ✨' },
      { id: '3', user: 'beatmaster_kai', text: 'This track rhythm hits different on headphones!' },
    ]);
    setShowCommentsModal(true);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReelComments((prev) => [
      ...prev,
      { id: 'c_' + Date.now(), user: currentUser.username, text: newComment.trim() },
    ]);
    setNewComment('');
  };

  if (!currentReel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <p className="text-sm">No reels uploaded yet.</p>
        <p className="text-xs text-slate-500 mt-1">Tap the center + button to record or upload the first vertical reel!</p>
      </div>
    );
  }

  const isFollowing = followingSet.has(currentReel.userId);
  const likesCount = likesCountMap[currentReel.id] ?? currentReel.likesCount;
  const isLiked = likedMap[currentReel.id] ?? false;
  const isSaved = savedMap[currentReel.id] ?? false;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center">
      {/* Vertical Video Element */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleTap}
      >
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          poster={currentReel.thumbnailUrl}
          playsInline
          loop
          autoPlay
          muted={isMuted}
          className="w-full h-full object-cover"
        />

        {/* Ambient Gradient Scrims for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

        {/* Play / Pause Center HUD when toggled */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
              <Play className="w-8 h-8 ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Double-tap animated heart */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-28 h-28 text-pink-500 fill-pink-500 drop-shadow-[0_0_24px_rgba(236,72,153,0.9)]" />
          </div>
        )}
      </div>

      {/* Top Floating Controls: Reel Category & Sound Toggle */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90 drop-shadow">
            Reels
          </span>
          <span className="text-white/40">·</span>
          <span className="text-[11px] text-purple-300 font-semibold drop-shadow">
            {currentIndex + 1} of {reels.length}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-300" />}
        </button>
      </div>

      {/* Right Side Vertical Action Rail */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4.5 pointer-events-auto">
        {/* Creator Avatar with mini follow + */}
        <div className="relative mb-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(currentReel.userId);
            }}
            className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500 focus:outline-none shadow-lg cursor-pointer"
          >
            <img
              src={currentReel.userAvatar}
              alt={currentReel.username}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
          {!isFollowing && currentReel.userId !== currentUser.id && onFollowToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(currentReel.userId);
              }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-purple-600 border border-white text-white text-[11px] font-bold flex items-center justify-center shadow cursor-pointer"
            >
              +
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeToggle();
          }}
          className="flex flex-col items-center gap-0.5 focus:outline-none group cursor-pointer"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Heart
              className={`w-7 h-7 transition-transform active:scale-125 ${
                isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white tabular-nums drop-shadow">
            {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openComments();
          }}
          className="flex flex-col items-center gap-0.5 focus:outline-none group cursor-pointer"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white tabular-nums drop-shadow">
            {currentReel.commentsCount > 999
              ? `${(currentReel.commentsCount / 1000).toFixed(1)}k`
              : currentReel.commentsCount}
          </span>
        </button>

        {/* Send / Share */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (navigator.share) {
              await navigator.share({
                title: currentReel.caption,
                url: window.location.href,
              });
            } else {
              alert('Reel link copied!');
            }
          }}
          className="flex flex-col items-center gap-0.5 focus:outline-none group cursor-pointer"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Send className="w-6 h-6 text-white -rotate-12" />
          </div>
          <span className="text-[11px] font-bold text-white tabular-nums drop-shadow">
            {currentReel.sharesCount > 999
              ? `${(currentReel.sharesCount / 1000).toFixed(1)}k`
              : currentReel.sharesCount}
          </span>
        </button>

        {/* Tip / Virtual Gift Button */}
        {onTipCreator && currentReel.userId !== currentUser.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTipCreator(currentReel.userId);
            }}
            className="flex flex-col items-center gap-0.5 focus:outline-none group cursor-pointer"
            title="Tip Diamonds"
          >
            <div className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500/80 to-purple-600/80 backdrop-blur-md text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <Diamond className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-300 drop-shadow">Tip</span>
          </button>
        )}

        {/* Save Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSaveToggle();
          }}
          className="flex flex-col items-center gap-0.5 focus:outline-none group cursor-pointer"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Bookmark
              className={`w-6 h-6 ${isSaved ? 'text-purple-400 fill-purple-400' : 'text-white'}`}
            />
          </div>
        </button>

        {/* Up / Down Swift Switchers */}
        <div className="flex flex-col gap-1 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white cursor-pointer"
            title="Previous Reel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={currentIndex === reels.length - 1}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white cursor-pointer"
            title="Next Reel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Info Bar: Creator Info, Caption & Audio Ticker */}
      <div className="absolute left-4 right-18 bottom-4 z-20 flex flex-col gap-2 pointer-events-auto text-left">
        {/* Creator Name & Follow Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenProfile(currentReel.userId)}
            className="text-sm font-bold text-white hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>@{currentReel.username}</span>
            {currentReel.userVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
            )}
          </button>

          {currentReel.userId !== currentUser.id && onFollowToggle && (
            <button
              onClick={() => onFollowToggle(currentReel.userId)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                isFollowing
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-purple-600 text-white shadow-sm'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Reel Caption & Tags */}
        <p className="text-xs text-white/95 leading-relaxed line-clamp-2 drop-shadow">
          {currentReel.caption}
        </p>

        {/* Audio Track Marquee / Disc */}
        <div className="flex items-center gap-2 text-white/80 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 max-w-[200px]">
            <Music className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate text-[11px] font-medium">
              {currentReel.audioTrack?.title || 'Original Audio'} · {currentReel.audioTrack?.artist}
            </span>
          </div>

          {/* Rotating vinyl indicator */}
          <div className="w-6 h-6 rounded-full bg-black/80 border border-white/30 flex items-center justify-center animate-spin">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
        </div>
      </div>

      {/* Reel Comments Bottom Sheet */}
      {showCommentsModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col justify-end">
          <div className="w-full max-h-[60%] bg-[#0f172a] rounded-t-3xl border-t border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white">Reel Comments</span>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 no-scrollbar">
              {reelComments.map((c) => (
                <div key={c.id} className="text-xs flex items-start gap-2">
                  <span className="font-bold text-purple-300">@{c.user}</span>
                  <span className="text-slate-200">{c.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Add a comment on this reel..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 rounded-full bg-purple-600 disabled:opacity-40 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
