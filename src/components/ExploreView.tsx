import React, { useState } from 'react';
import { Search, TrendingUp, Sparkles, X, Clapperboard, Heart, Users, CheckCircle2 } from 'lucide-react';
import { Post, Reel, User } from '../types';

interface ExploreViewProps {
  posts: Post[];
  reels: Reel[];
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onOpenProfile: (userId: string) => void;
}

const DISCOVERY_CATEGORIES = [
  'All',
  'Fashion',
  'Music',
  'Travel',
  'Tech',
  'Art & Design',
  'Gaming',
  'Fitness',
  'Comedy',
];

const TRENDING_HASHTAGS = [
  { tag: 'Streetwear', count: '1.4M vibes' },
  { tag: 'TokyoStyle', count: '890K vibes' },
  { tag: 'Bali', count: '650K vibes' },
  { tag: 'AnalogSynth', count: '420K vibes' },
  { tag: 'CyberFashion', count: '310K vibes' },
  { tag: 'SunsetVibes', count: '290K vibes' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  reels,
  onSelectPost,
  onSelectReel,
  onOpenProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchHistory, setSearchHistory] = useState<string[]>([
    '#Streetwear',
    '@alexavibes',
    '#AnalogSynth',
  ]);

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleAddSearchHistory = (term: string) => {
    if (!searchHistory.includes(term)) {
      setSearchHistory([term, ...searchHistory.slice(0, 4)]);
    }
  };

  // Filter posts and reels based on query and category
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().replace('#', '').replace('@', '');
    return (
      p.caption.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full flex-1 overflow-y-auto no-scrollbar bg-[#090d16] text-slate-100 p-3 pb-20 flex flex-col gap-3">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search creators, #hashtags, videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              handleAddSearchHistory(searchQuery.trim());
            }
          }}
          className="w-full bg-[#0d1322] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {DISCOVERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0d1322] text-slate-300 hover:bg-white/5 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recent Search History if active */}
      {searchHistory.length > 0 && !searchQuery && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-medium text-slate-500">Recent:</span>
            {searchHistory.map((item) => (
              <button
                key={item}
                onClick={() => setSearchQuery(item)}
                className="px-2.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={handleClearHistory}
            className="text-[10px] text-purple-400 hover:text-purple-300 whitespace-nowrap shrink-0 ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Trending Hashtags Section */}
      {!searchQuery && (
        <div className="bg-[#0d1322] border border-white/5 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white">Trending on VibeGram</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRENDING_HASHTAGS.map((h) => (
              <button
                key={h.tag}
                onClick={() => setSearchQuery('#' + h.tag)}
                className="flex flex-col text-left p-2 rounded-xl bg-white/5 hover:bg-purple-900/20 border border-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-200">#{h.tag}</span>
                <span className="text-[10px] text-slate-400">{h.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Creators Carousel */}
      {!searchQuery && (
        <div className="bg-[#0d1322] border border-white/5 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white">Recommended Creators</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'usr_alexa', username: 'alexavibes', name: 'Alexa Chen', avatar: '/src/assets/images/reel_streetwear_creator_1792852720851.jpg' },
              { id: 'usr_marco', username: 'marcostravels', name: 'Marco Silva', avatar: '/src/assets/images/reel_travel_sunset_1792852722497.jpg' },
              { id: 'usr_kai', username: 'beatmaster_kai', name: 'Kai Tanaka', avatar: '/src/assets/images/reel_music_producer_1792852723398.jpg' },
              { id: 'usr_elena', username: 'elena_art', name: 'Elena Rostova', avatar: '/src/assets/images/post_coffee_latte_1792852722724.jpg' },
            ].map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenProfile(c.id)}
                className="flex flex-col items-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors w-28 shrink-0 cursor-pointer text-center"
              >
                <img src={c.avatar} alt={c.username} className="w-12 h-12 rounded-full object-cover mb-1.5 border border-purple-500/30" />
                <span className="text-xs font-bold text-white truncate w-full">@{c.username}</span>
                <span className="text-[10px] text-slate-400 truncate w-full">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explore Media Grid (Asymmetric Bento style) */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-slate-300">Popular Content</span>
          <span className="text-[10px] text-slate-500">{filteredPosts.length} items</span>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
          {filteredPosts.map((post, index) => {
            // Give every 5th item a double-height reel portrait format
            const isTall = index % 5 === 2;
            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className={`relative bg-slate-900 overflow-hidden cursor-pointer group ${
                  isTall ? 'row-span-2 aspect-[9/16]' : 'aspect-square'
                }`}
              >
                <img
                  src={post.thumbnailUrl || post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                {post.mediaType === 'video' && (
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white">
                    <Clapperboard className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    {post.likesCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
