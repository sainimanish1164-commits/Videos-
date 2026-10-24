import React, { useState, useEffect } from 'react';
import { Grid, Clapperboard, Bookmark, Tag, CheckCircle2, Lock, Globe, Settings, Share2, MoreVertical, Edit3, UserPlus, UserCheck, Shield, Eye, Heart, Diamond } from 'lucide-react';
import { User, Post, Reel } from '../types';
import { API } from '../services/api';

interface ProfileViewProps {
  userId: string;
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  onOpenSettings: () => void;
  onTipCreator?: (creatorId: string) => void;
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onOpenProfile: (userId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  currentUser,
  onUpdateCurrentUser,
  onOpenSettings,
  onTipCreator,
  onSelectPost,
  onSelectReel,
  onOpenProfile,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);

  const isMe = userId === currentUser.id;

  const loadUserData = async () => {
    if (isMe) {
      setUser(currentUser);
      setEditDisplayName(currentUser.displayName);
      setEditBio(currentUser.bio);
      setEditWebsite(currentUser.website);
      setEditIsPrivate(currentUser.isPrivate);
    } else {
      const res = await API.getUser(userId);
      setUser(res.user);
      setIsFollowing(res.isFollowing);
      setIsBlocked(currentUser.blockedUserIds.includes(res.user.id));
    }

    // Load content
    const allPosts = await API.getPosts();
    setUserPosts(allPosts.filter((p) => p.userId === userId));
    setSavedPosts(allPosts.filter((p) => p.savedByUserIds.includes(userId)));

    const allReels = await API.getReels();
    setUserReels(allReels.filter((r) => r.userId === userId));
  };

  useEffect(() => {
    loadUserData();
  }, [userId, currentUser.id]);

  const handleFollowToggle = async () => {
    if (!user) return;
    const res = await API.toggleFollow(user.id);
    setIsFollowing(res.isFollowing);
    setUser((prev) => (prev ? { ...prev, followersCount: res.followersCount } : null));
  };

  const handleBlockToggle = async () => {
    if (!user) return;
    const blockedList = await API.toggleBlockUser(user.id);
    setIsBlocked(blockedList.includes(user.id));
  };

  const openFollowers = async () => {
    if (!user) return;
    const list = await API.getFollowers(user.id);
    setFollowersList(list);
    setShowFollowersModal(true);
  };

  const openFollowing = async () => {
    if (!user) return;
    const list = await API.getFollowing(user.id);
    setFollowingList(list);
    setShowFollowingModal(true);
  };

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await API.updateProfile({
      displayName: editDisplayName,
      bio: editBio,
      website: editWebsite,
      isPrivate: editIsPrivate,
    });
    onUpdateCurrentUser(updated);
    setUser(updated);
    setShowEditModal(false);
  };

  if (!user) {
    return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="w-full flex-1 overflow-y-auto no-scrollbar bg-[#090d16] text-slate-100 pb-16">
      {/* Cover Banner */}
      <div className="relative w-full h-32 sm:h-40 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 overflow-hidden">
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-800 to-indigo-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent" />

        {/* Top profile actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {isMe ? (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <>
              {onTipCreator && (
                <button
                  onClick={() => onTipCreator(user.id)}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/80 to-purple-600/80 backdrop-blur-md text-amber-200 border border-amber-400/40 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Diamond className="w-3.5 h-3.5" /> Tip
                </button>
              )}
              <button
                onClick={handleBlockToggle}
                className={`p-2 rounded-full backdrop-blur-md text-xs transition-colors cursor-pointer ${
                  isBlocked ? 'bg-red-600 text-white' : 'bg-black/50 text-slate-300 hover:text-white'
                }`}
                title={isBlocked ? 'Unblock User' : 'Block User'}
              >
                <Shield className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Info */}
      <div className="px-4 -mt-14 relative z-20 flex flex-col gap-3">
        {/* Avatar & Main Action Buttons */}
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className="w-22 h-22 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 shadow-xl">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover border-2 border-[#090d16]"
                referrerPolicy="no-referrer"
              />
            </div>
            {user.isPrivate && (
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-800 text-slate-300 border border-white/20">
                <Lock className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {isMe ? (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  }}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" /> Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Display Name, Handle & Verified Badge */}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-white">{user.displayName}</h1>
            {user.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
            )}
          </div>
          <span className="text-xs text-purple-300 font-medium">@{user.username}</span>
        </div>

        {/* Bio & Link */}
        {user.bio && <p className="text-xs text-slate-300 leading-relaxed">{user.bio}</p>}

        {user.website && (
          <a
            href={user.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:underline font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{user.website.replace('https://', '')}</span>
          </a>
        )}

        {/* Audience Metrics / Followers / Views */}
        <div className="flex items-center justify-around py-3 bg-[#0d1322] border border-white/5 rounded-2xl text-center">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tabular-nums">
              {userPosts.length + userReels.length}
            </span>
            <span className="text-[10px] text-slate-400">Posts</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <button onClick={openFollowers} className="flex flex-col cursor-pointer focus:outline-none">
            <span className="text-sm font-bold text-white tabular-nums">
              {user.followersCount > 999
                ? `${(user.followersCount / 1000).toFixed(1)}k`
                : user.followersCount}
            </span>
            <span className="text-[10px] text-slate-400 hover:text-purple-300">Followers</span>
          </button>
          <div className="h-6 w-[1px] bg-white/10" />
          <button onClick={openFollowing} className="flex flex-col cursor-pointer focus:outline-none">
            <span className="text-sm font-bold text-white tabular-nums">
              {user.followingCount}
            </span>
            <span className="text-[10px] text-slate-400 hover:text-purple-300">Following</span>
          </button>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-purple-400 tabular-nums">
              {user.totalLikes > 999 ? `${(user.totalLikes / 1000).toFixed(0)}k` : user.totalLikes}
            </span>
            <span className="text-[10px] text-slate-400">Likes</span>
          </div>
        </div>
      </div>

      {/* Tabs Row (Posts, Reels, Saved, Tagged) */}
      <div className="mt-4 border-t border-b border-white/10 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'posts' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'reels' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span>Reels</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'saved' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'tagged' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Tagged</span>
        </button>
      </div>

      {/* Tab Content Media Grid */}
      <div className="p-1">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
                No posts shared yet.
              </div>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="relative aspect-square bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={post.thumbnailUrl || post.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {post.mediaType === 'video' && (
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white">
                      <Clapperboard className="w-3 h-3" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      {post.likesCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-1">
            {userReels.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
                No short reels created yet.
              </div>
            ) : (
              userReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => onSelectReel(reel)}
                  className="relative aspect-[9/16] bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 text-[10px] text-white font-bold flex items-center gap-1 drop-shadow">
                    <Eye className="w-3 h-3" />
                    {reel.viewsCount > 999 ? `${(reel.viewsCount / 1000).toFixed(1)}k` : reel.viewsCount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-3 gap-1">
            {savedPosts.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
                No saved posts in your collection.
              </div>
            ) : (
              savedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="relative aspect-square bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={post.thumbnailUrl || post.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
            No tagged photos or reels found.
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditProfile}
            className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Edit Profile Details</h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Display Name</label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Website Link</label>
              <input
                type="text"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <span className="text-xs text-slate-300">Private Account</span>
              <input
                type="checkbox"
                checked={editIsPrivate}
                onChange={(e) => setEditIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Followers & Following List Modals */}
      {(showFollowersModal || showFollowingModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl max-h-[70vh]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-bold text-white">
                {showFollowersModal ? 'Followers' : 'Following'}
              </span>
              <button
                onClick={() => {
                  setShowFollowersModal(false);
                  setShowFollowingModal(false);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Done
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-3 no-scrollbar py-2">
              {(showFollowersModal ? followersList : followingList).map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowFollowersModal(false);
                      setShowFollowingModal(false);
                      onOpenProfile(f.id);
                    }}
                    className="flex items-center gap-2.5 text-left focus:outline-none"
                  >
                    <img src={f.avatar} alt={f.username} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        @{f.username}
                        {f.isVerified && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{f.displayName}</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
