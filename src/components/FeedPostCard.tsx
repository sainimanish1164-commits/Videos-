import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, CheckCircle2, Volume2, VolumeX, Music2, Share2, Flag, Trash2 } from 'lucide-react';
import { Post, Comment, User } from '../types';
import { API } from '../services/api';

interface FeedPostCardProps {
  post: Post;
  currentUser: User;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onFollowToggle?: (userId: string) => void;
  isFollowing?: boolean;
  onOpenProfile: (userId: string) => void;
  onDeletePost?: (postId: string) => void;
  onTipCreator?: (creatorId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onSaveToggle,
  onFollowToggle,
  isFollowing,
  onOpenProfile,
  onDeletePost,
  onTipCreator,
}) => {
  const [isLiked, setIsLiked] = useState(post.likedByUserIds.includes(currentUser.id));
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.savedByUserIds.includes(currentUser.id));
  const [savesCount, setSavesCount] = useState(post.savesCount);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; username: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    onLikeToggle(post.id);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleSave = () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    setSavesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    onSaveToggle(post.id);
  };

  const loadComments = async () => {
    setShowComments(true);
    const cmts = await API.getComments(post.id);
    setCommentsList(cmts);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const added = await API.addComment(post.id, newCommentText.trim(), replyTarget?.id);
    if (replyTarget) {
      setCommentsList((prev) =>
        prev.map((c) => (c.id === replyTarget.id ? { ...c, replies: [...c.replies, (added as any)] } : c))
      );
    } else {
      setCommentsList((prev) => [added, ...prev]);
    }
    setNewCommentText('');
    setReplyTarget(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.username} on VibeGram`,
          text: post.caption,
          url: window.location.href,
        });
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Post link copied to clipboard!');
    }
  };

  const handleReport = async () => {
    await API.submitReport(post.id, 'post', 'Inappropriate content', 'Reported from feed menu');
    setShowMenu(false);
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article className="w-full bg-[#0d1322] border-b border-white/5 mb-2 overflow-hidden">
      {/* Top Author Row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenProfile(post.userId)}
            className="w-9 h-9 rounded-full overflow-hidden border border-purple-500/30 p-0.5 focus:outline-none cursor-pointer"
          >
            <img
              src={post.userAvatar}
              alt={post.username}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenProfile(post.userId)}
                className="text-xs font-bold text-slate-100 hover:text-purple-400 transition-colors focus:outline-none cursor-pointer"
              >
                @{post.username}
              </button>
              {post.userVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
              )}
            </div>
            {post.location && (
              <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[180px]">
                {post.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.userId !== currentUser.id && onFollowToggle && (
            <button
              onClick={() => onFollowToggle(post.userId)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                isFollowing
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-600/30'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="mx-3 mb-2 p-2 rounded-xl bg-slate-900 border border-white/10 text-xs flex flex-col gap-1 z-20">
          {onTipCreator && post.userId !== currentUser.id && (
            <button
              onClick={() => {
                setShowMenu(false);
                onTipCreator(post.userId);
              }}
              className="px-3 py-1.5 text-left text-amber-300 hover:bg-white/5 rounded-lg font-medium cursor-pointer"
            >
              💎 Send Creator Tip (Diamonds)
            </button>
          )}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-left text-slate-200 hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Post Link
          </button>
          {post.userId === currentUser.id && onDeletePost && (
            <button
              onClick={() => {
                setShowMenu(false);
                onDeletePost(post.id);
              }}
              className="px-3 py-1.5 text-left text-red-400 hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete My Post
            </button>
          )}
          <button
            onClick={handleReport}
            className="px-3 py-1.5 text-left text-slate-400 hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" /> Report Content
          </button>
        </div>
      )}

      {reportSuccess && (
        <div className="mx-3 mb-2 p-2 bg-purple-950/60 border border-purple-500/30 rounded-xl text-xs text-purple-300 text-center">
          ✓ Post reported to moderation team.
        </div>
      )}

      {/* Post Media Container (1:1 or 4:5 mobile ratio) */}
      <div
        className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        {post.mediaType === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={post.mediaUrl}
              poster={post.thumbnailUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Audio Toggle Pill */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Double-tap Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
          </div>
        )}
      </div>

      {/* Action Bar (Heart, Comment, Share, Save) */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-125 cursor-pointer"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? 'text-pink-500 fill-pink-500' : 'text-slate-300 hover:text-white'
              }`}
            />
          </button>

          {/* Comment */}
          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 focus:outline-none hover:text-white text-slate-300 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="focus:outline-none hover:text-white text-slate-300 transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5 -rotate-12" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="focus:outline-none hover:text-white text-slate-300 transition-colors cursor-pointer"
        >
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              isSaved ? 'text-purple-400 fill-purple-400' : 'text-slate-300'
            }`}
          />
        </button>
      </div>

      {/* Metric Counters & Caption */}
      <div className="px-3 pb-3 flex flex-col gap-1 text-xs">
        <div className="font-bold text-slate-100 tabular-nums">
          {likesCount.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className="text-slate-200 leading-relaxed">
          <button
            onClick={() => onOpenProfile(post.userId)}
            className="font-bold mr-1.5 hover:text-purple-400 transition-colors focus:outline-none cursor-pointer"
          >
            @{post.username}
          </button>
          <span>{post.caption}</span>
        </div>

        {/* Audio Track Tag if present */}
        {post.audioTrack && (
          <div className="flex items-center gap-1 text-[11px] text-purple-300 mt-0.5">
            <Music2 className="w-3 h-3 text-purple-400" />
            <span className="truncate">
              {post.audioTrack.title} · {post.audioTrack.artist}
            </span>
          </div>
        )}

        {/* Comments Link */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <button
            onClick={loadComments}
            className="hover:text-slate-300 focus:outline-none cursor-pointer"
          >
            View all {post.commentsCount > 0 ? post.commentsCount : ''} comments
          </button>
          <time className="text-[10px] text-slate-400">{timeAgo(post.createdAt)}</time>
        </div>
      </div>

      {/* Interactive Comments Drawer */}
      {showComments && (
        <div className="mx-3 mb-3 p-3 bg-slate-900/90 rounded-2xl border border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-xs font-bold text-white">Comments</span>
            <button
              onClick={() => setShowComments(false)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Comment List */}
          <div className="max-h-48 overflow-y-auto flex flex-col gap-2.5 pr-1 no-scrollbar">
            {commentsList.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                No comments yet. Be the first to vibe!
              </div>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <img src={c.userAvatar} alt={c.username} className="w-5 h-5 rounded-full object-cover mt-0.5" />
                      <div>
                        <span className="font-bold text-white mr-1.5">@{c.username}</span>
                        <span className="text-slate-300">{c.text}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyTarget({ id: c.id, username: c.username })}
                      className="text-[10px] text-purple-400 hover:text-purple-300 underline shrink-0 ml-2 cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-7 pl-2 border-l border-white/10 flex flex-col gap-1.5 mt-1">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-1.5 text-[11px]">
                          <img src={r.userAvatar} alt={r.username} className="w-4 h-4 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-200 mr-1">@{r.username}</span>
                            <span className="text-slate-400">{r.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex flex-col gap-1 pt-1 border-t border-white/5">
            {replyTarget && (
              <div className="flex items-center justify-between text-[10px] text-purple-300 px-1">
                <span>Replying to @{replyTarget.username}</span>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={replyTarget ? `Reply to @${replyTarget.username}...` : 'Add a comment...'}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
