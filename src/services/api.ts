import { User, Post, Comment, Reel, Story, Conversation, Message, NotificationItem, CreatorStats, ReportItem, LiveStream } from '../types';

export const API = {
  // Auth
  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    return data.user;
  },

  async login(payload: { email?: string; username?: string; password?: string }): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.user;
  },

  async register(payload: { username: string; displayName: string; email: string; password?: string }): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.user;
  },

  async switchUser(userId: string): Promise<User> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    return data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.message;
  },

  // Posts & Feeds
  async getPosts(tab: 'for_you' | 'following' = 'for_you', userId?: string): Promise<Post[]> {
    const query = new URLSearchParams();
    if (tab === 'following') query.append('tab', 'following');
    if (userId) query.append('userId', userId);
    const res = await fetch(`/api/posts?${query.toString()}`);
    const data = await res.json();
    return data.posts || [];
  },

  async createPost(postData: Partial<Post>): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    return data.post;
  },

  async toggleLikePost(postId: string): Promise<{ likesCount: number; isLiked: boolean }> {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    return await res.json();
  },

  async toggleSavePost(postId: string): Promise<{ savesCount: number; isSaved: boolean }> {
    const res = await fetch(`/api/posts/${postId}/save`, { method: 'POST' });
    return await res.json();
  },

  async deletePost(postId: string): Promise<boolean> {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    const data = await res.json();
    return !!data.success;
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    return data.comments || [];
  },

  async addComment(postId: string, text: string, replyToCommentId?: string): Promise<Comment> {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, replyToCommentId }),
    });
    const data = await res.json();
    return data.comment;
  },

  // Reels
  async getReels(): Promise<Reel[]> {
    const res = await fetch('/api/reels');
    const data = await res.json();
    return data.reels || [];
  },

  async toggleLikeReel(reelId: string): Promise<{ likesCount: number; isLiked: boolean }> {
    const res = await fetch(`/api/reels/${reelId}/like`, { method: 'POST' });
    return await res.json();
  },

  async logReelWatch(reelId: string, watchSeconds: number): Promise<void> {
    await fetch(`/api/reels/${reelId}/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchSeconds }),
    });
  },

  // Stories
  async getStories(): Promise<Story[]> {
    const res = await fetch('/api/stories');
    const data = await res.json();
    return data.stories || [];
  },

  async createStory(storyData: { mediaUrl: string; mediaType: 'photo' | 'video'; caption?: string; sticker?: string }): Promise<Story> {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData),
    });
    const data = await res.json();
    return data.story;
  },

  async markStoryViewed(storyId: string): Promise<void> {
    await fetch(`/api/stories/${storyId}/view`, { method: 'POST' });
  },

  async replyToStory(storyId: string, text: string): Promise<void> {
    await fetch(`/api/stories/${storyId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  },

  // Users & Profiles & Follow
  async getUser(idOrUsername: string): Promise<{ user: User; isFollowing: boolean }> {
    const res = await fetch(`/api/users/${idOrUsername}`);
    return await res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.user;
  },

  async toggleFollow(targetUserId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await fetch(`/api/users/${targetUserId}/follow`, { method: 'POST' });
    return await res.json();
  },

  async getFollowers(userId: string): Promise<User[]> {
    const res = await fetch(`/api/users/${userId}/followers`);
    const data = await res.json();
    return data.followers || [];
  },

  async getFollowing(userId: string): Promise<User[]> {
    const res = await fetch(`/api/users/${userId}/following`);
    const data = await res.json();
    return data.following || [];
  },

  async toggleBlockUser(userId: string): Promise<string[]> {
    const res = await fetch(`/api/users/${userId}/block`, { method: 'POST' });
    const data = await res.json();
    return data.blockedUserIds;
  },

  async submitReport(targetId: string, targetType: 'post' | 'user' | 'message' | 'reel', reason: string, details: string): Promise<string> {
    const res = await fetch(`/api/users/${targetId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, reason, details }),
    });
    const data = await res.json();
    return data.message;
  },

  // Conversations & Chat
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    return data.conversations || [];
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    return data.messages || [];
  },

  async sendMessage(conversationId: string, messageData: Partial<Message>): Promise<Message> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    const data = await res.json();
    return data.message;
  },

  async startConversation(targetUserId: string): Promise<Conversation> {
    const res = await fetch('/api/conversations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    });
    const data = await res.json();
    return data.conversation;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
  },

  // Creator & Monetization
  async getCreatorOverview(): Promise<CreatorStats> {
    const res = await fetch('/api/creator/overview');
    const data = await res.json();
    return data.stats;
  },

  async applyMonetization(payload: { category: string; paymentMethod: string; accountEmail: string; taxCountry: string }): Promise<void> {
    await fetch('/api/creator/apply-monetization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async sendTip(creatorId: string, diamondsCount: number, message: string): Promise<string> {
    const res = await fetch('/api/creator/tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, diamondsCount, message }),
    });
    const data = await res.json();
    return data.message;
  },

  async requestPayout(amount: number, paymentMethod: string, destination: string): Promise<void> {
    const res = await fetch('/api/creator/payout-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentMethod, destination }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request payout');
    }
  },

  // Live Streams
  async getLiveStreams(): Promise<LiveStream[]> {
    const res = await fetch('/api/live/streams');
    const data = await res.json();
    return data.streams || [];
  },

  async startLiveStream(title: string, category: string): Promise<LiveStream> {
    const res = await fetch('/api/live/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category }),
    });
    const data = await res.json();
    return data.stream;
  },

  async sendLiveChat(streamId: string, text: string): Promise<any> {
    const res = await fetch(`/api/live/${streamId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.chatMessage;
  },

  async sendLiveHeart(streamId: string): Promise<number> {
    const res = await fetch(`/api/live/${streamId}/heart`, { method: 'POST' });
    const data = await res.json();
    return data.heartsCount;
  },

  async endLiveStream(streamId: string): Promise<void> {
    await fetch(`/api/live/${streamId}/end`, { method: 'POST' });
  },

  // Admin Dashboard
  async getAdminOverview(): Promise<{ stats: any; users: User[]; reports: ReportItem[]; monetizationApps: any[]; payoutHistory: any[] }> {
    const res = await fetch('/api/admin/overview');
    return await res.json();
  },

  async toggleUserBan(userId: string): Promise<void> {
    await fetch(`/api/admin/users/${userId}/toggle-ban`, { method: 'POST' });
  },

  async toggleUserVerified(userId: string): Promise<void> {
    await fetch(`/api/admin/users/${userId}/toggle-verified`, { method: 'POST' });
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
    await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  async reviewMonetization(appId: string, decision: 'approve' | 'reject'): Promise<void> {
    await fetch(`/api/admin/monetization/${appId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
  },

  async updatePayoutStatus(payoutId: string, status: 'processed' | 'declined'): Promise<void> {
    await fetch(`/api/admin/payouts/${payoutId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // Android APK info
  async getAndroidBuildStatus(): Promise<any> {
    const res = await fetch('/api/android/build-status');
    return await res.json();
  },
};
