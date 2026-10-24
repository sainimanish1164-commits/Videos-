/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Plus, Radio, ShieldAlert } from 'lucide-react';
import { User, Post, Reel, Story, NotificationItem, Conversation } from './types';
import { API } from './services/api';

import { AndroidFrame } from './components/AndroidFrame';
import { TopHeader, BottomNavBar, TabType } from './components/Navigation';
import { StoriesSection } from './components/StoriesSection';
import { FeedPostCard } from './components/FeedPostCard';
import { ReelsView } from './components/ReelsView';
import { CreatePostModal } from './components/CreatePostModal';
import { ProfileView } from './components/ProfileView';
import { ExploreView } from './components/ExploreView';
import { ChatView } from './components/ChatView';
import { CreatorStudio } from './components/CreatorStudio';
import { LiveStreamView } from './components/LiveStreamView';
import { AdminPortal } from './components/AdminPortal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { AuthModal, TipModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [feedFilter, setFeedFilter] = useState<'for_you' | 'following'>('for_you');
  const [isDeviceMode, setIsDeviceMode] = useState(true);

  // Core Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  // UI Modals & Overlays
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [tipTargetUserId, setTipTargetUserId] = useState<string | null>(null);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initial Data Fetch
  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      const user = await API.getCurrentUser();
      setCurrentUser(user);

      const [postList, reelList, storyList, notifList, convList, followingList] = await Promise.all([
        API.getPosts(feedFilter),
        API.getReels(),
        API.getStories(),
        API.getNotifications(),
        API.getConversations(),
        API.getFollowing(user.id),
      ]);

      setPosts(postList);
      setReels(reelList);
      setStories(storyList);
      setNotifications(notifList);
      setConversations(convList);
      setFollowingSet(new Set(followingList.map((f) => f.id)));
    } catch (err) {
      console.error('Failed to load VibeGram data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [feedFilter]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLikeToggle = async (postId: string) => {
    await API.toggleLikePost(postId);
  };

  const handleSaveToggle = async (postId: string) => {
    await API.toggleSavePost(postId);
    showToast('Saved to collection');
  };

  const handleFollowToggle = async (targetUserId: string) => {
    const res = await API.toggleFollow(targetUserId);
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (res.isFollowing) next.add(targetUserId);
      else next.delete(targetUserId);
      return next;
    });
    showToast(res.isFollowing ? 'Following creator' : 'Unfollowed');
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await API.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Post deleted');
    }
  };

  const handleOpenProfile = (targetUserId: string) => {
    setViewingProfileUserId(targetUserId);
    setActiveTab('profile');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#060911] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xl mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)] animate-pulse">
          V
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Loading VibeGram Android Platform...
        </div>
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <AndroidFrame
      isDeviceMode={isDeviceMode}
      onToggleMode={() => setIsDeviceMode(!isDeviceMode)}
      onOpenApkModal={() => setShowApkModal(true)}
    >
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-purple-900/90 border border-purple-400/40 text-purple-200 text-xs font-semibold shadow-2xl backdrop-blur-md pointer-events-none transition-all">
          {toastMessage}
        </div>
      )}

      {/* Main Top Header Bar (Shown unless in full Reels or Live view) */}
      {activeTab !== 'reels' && (
        <TopHeader
          currentUser={currentUser}
          unreadNotifications={unreadNotifsCount}
          unreadMessages={unreadMessagesCount}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          onOpenMessages={() => setActiveTab('messages')}
          onOpenLive={() => setShowLiveStreamModal(true)}
          onOpenCreator={() => setActiveTab('creator')}
          onOpenAdmin={() => setActiveTab('admin')}
        />
      )}

      {/* Main Central Viewport Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[#090d16]">
        {/* 1. HOME FEED VIEW */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto no-scrollbar pb-16 flex flex-col">
            {/* Top Stories Row */}
            <StoriesSection
              stories={stories}
              currentUser={currentUser}
              onAddStory={() => setShowCreateModal(true)}
              onStoryViewed={(id) => API.markStoryViewed(id)}
              onReplyStory={async (id, text) => {
                await API.replyToStory(id, text);
                showToast('Story reply sent to creator!');
              }}
            />

            {/* Feed Tab Sub-Header: For You vs Following + Refresh */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-1 p-1 bg-[#0d1322] rounded-xl border border-white/5">
                <button
                  onClick={() => setFeedFilter('for_you')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    feedFilter === 'for_you'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setFeedFilter('following')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    feedFilter === 'following'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAllData}
                  className={`p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ${
                    refreshing ? 'animate-spin text-purple-400' : ''
                  }`}
                  title="Refresh Feed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Posts Feed Stream */}
            <div className="flex flex-col">
              {posts.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-xs px-6">
                  <p className="font-semibold text-slate-400 text-sm mb-1">No posts in this feed yet</p>
                  <p>Follow more creators or tap the center button to publish your first photo or video!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLikeToggle={handleLikeToggle}
                    onSaveToggle={handleSaveToggle}
                    onFollowToggle={handleFollowToggle}
                    isFollowing={followingSet.has(post.userId)}
                    onOpenProfile={handleOpenProfile}
                    onDeletePost={handleDeletePost}
                    onTipCreator={(cId) => setTipTargetUserId(cId)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. EXPLORE VIEW */}
        {activeTab === 'explore' && (
          <ExploreView
            posts={posts}
            reels={reels}
            onSelectPost={(post) => setSelectedPostDetail(post)}
            onSelectReel={() => setActiveTab('reels')}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {/* 3. REELS SHORT VIDEO VIEW */}
        {activeTab === 'reels' && (
          <ReelsView
            reels={reels}
            currentUser={currentUser}
            onOpenProfile={handleOpenProfile}
            onFollowToggle={handleFollowToggle}
            followingSet={followingSet}
            onTipCreator={(cId) => setTipTargetUserId(cId)}
          />
        )}

        {/* 4. DIRECT MESSAGING VIEW */}
        {activeTab === 'messages' && (
          <ChatView
            currentUser={currentUser}
            onBack={() => setActiveTab('home')}
            onOpenProfile={handleOpenProfile}
            onTipCreator={(cId) => setTipTargetUserId(cId)}
          />
        )}

        {/* 5. USER PROFILE VIEW */}
        {activeTab === 'profile' && (
          <ProfileView
            userId={viewingProfileUserId || currentUser.id}
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onTipCreator={(cId) => setTipTargetUserId(cId)}
            onSelectPost={(post) => setSelectedPostDetail(post)}
            onSelectReel={() => setActiveTab('reels')}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {/* 6. CREATOR STUDIO DASHBOARD */}
        {activeTab === 'creator' && (
          <CreatorStudio
            currentUser={currentUser}
            onClose={() => setActiveTab('home')}
          />
        )}

        {/* 7. ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            onClose={() => setActiveTab('home')}
          />
        )}
      </div>

      {/* Bottom Android Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'profile') {
            setViewingProfileUserId(currentUser.id);
          }
          if (tab === 'create') {
            setShowCreateModal(true);
            return;
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        unreadNotifications={unreadNotifsCount}
        unreadMessages={unreadMessagesCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenLive={() => setShowLiveStreamModal(true)}
      />

      {/* MODALS */}
      {/* Create Post / Reel Modal */}
      {showCreateModal && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
            showToast('Post published to VibeGram!');
          }}
        />
      )}

      {/* Notifications Drawer */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          currentUser={currentUser}
          onClose={() => setShowNotificationsModal(false)}
          onRefresh={refreshAllData}
          onOpenProfile={(uid) => {
            setShowNotificationsModal(false);
            handleOpenProfile(uid);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onLogout={() => {
            setShowSettingsModal(false);
            setShowAuthModal(true);
          }}
          onUpdateCurrentUser={(u) => setCurrentUser(u)}
        />
      )}

      {/* Android APK & Packaging Modal */}
      {showApkModal && (
        <AndroidApkModal onClose={() => setShowApkModal(false)} />
      )}

      {/* Live Stream View */}
      {showLiveStreamModal && (
        <LiveStreamView
          currentUser={currentUser}
          onClose={() => setShowLiveStreamModal(false)}
          onTipCreator={(cId) => setTipTargetUserId(cId)}
        />
      )}

      {/* Send Tip Modal */}
      {tipTargetUserId && (
        <TipModal
          creatorId={tipTargetUserId}
          onClose={() => setTipTargetUserId(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Auth & Demo Account Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            refreshAllData();
            showToast(`Switched account to @${user.username}`);
          }}
        />
      )}

      {/* Selected Post Detail Overlay */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Post by @{selectedPostDetail.username}</span>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto no-scrollbar">
              <FeedPostCard
                post={selectedPostDetail}
                currentUser={currentUser}
                onLikeToggle={handleLikeToggle}
                onSaveToggle={handleSaveToggle}
                onFollowToggle={handleFollowToggle}
                isFollowing={followingSet.has(selectedPostDetail.userId)}
                onOpenProfile={(uid) => {
                  setSelectedPostDetail(null);
                  handleOpenProfile(uid);
                }}
                onTipCreator={(cId) => setTipTargetUserId(cId)}
              />
            </div>
          </div>
        </div>
      )}
    </AndroidFrame>
  );
}
