export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  coverImage: string;
  bio: string;
  website: string;
  isVerified: boolean;
  isPrivate: boolean;
  role: 'user' | 'creator' | 'admin';
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  profileViews: number;
  createdAt: string;
  blockedUserIds: string[];
  settings: {
    darkMode: boolean;
    notifications: boolean;
    readReceipts: boolean;
    privateAccount: boolean;
    language: string;
  };
  isBanned?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userVerified: boolean;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  location: string;
  audioTrack?: { title: string; artist: string };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  savesCount: number;
  createdAt: string;
  likedByUserIds: string[];
  savedByUserIds: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByUserIds: string[];
  replies: {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    text: string;
    createdAt: string;
  }[];
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userVerified: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioTrack: { title: string; artist: string };
  durationSeconds: number;
  viewsCount: number;
  watchTimeSeconds: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  likedByUserIds: string[];
  savedByUserIds: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption: string;
  sticker?: string;
  createdAt: number;
  expiresAt: number;
  viewers: { userId: string; username: string; userAvatar: string; viewedAt: number }[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  isVoiceNote?: boolean;
  timestamp: number;
  readBy: string[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: string;
  updatedAt: number;
  otherUser?: User;
  unreadCount?: number;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'gift' | 'system';
  text: string;
  postId?: string;
  reelId?: string;
  isRead: boolean;
  createdAt: number;
}

export interface CreatorStats {
  followers: number;
  totalViews: number;
  profileVisits: number;
  totalLikes: number;
  watchTimeHours: string;
  engagementRate: string;
  isMonetized: boolean;
  monetizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  estimatedEarnings: number;
  verifiedBalance: number;
  adRevenue: number;
  tipsRevenue: number;
  subscriptionRevenue: number;
  minimumPayoutThreshold: number;
  payoutHistory: PayoutRecord[];
  chartData: { date: string; views: number; followers: number; earnings: number }[];
  topContent: { id: string; title: string; views: number; likes: number; thumbnail: string }[];
}

export interface PayoutRecord {
  id: string;
  userId: string;
  username: string;
  amount: number;
  paymentMethod: string;
  destination: string;
  status: 'pending' | 'processed' | 'declined';
  requestedAt: number;
  processedAt?: number;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'post' | 'user' | 'message' | 'reel';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface LiveStream {
  id: string;
  hostUserId: string;
  hostUsername: string;
  hostAvatar: string;
  title: string;
  category: string;
  viewerCount: number;
  heartsCount: number;
  status: 'live' | 'ended';
  startedAt: number;
  chatMessages: { id: string; username: string; userAvatar: string; text: string; timestamp: number }[];
}
