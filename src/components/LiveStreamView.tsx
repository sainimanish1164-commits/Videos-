import React, { useState, useEffect, useRef } from 'react';
import { Radio, Heart, Send, Users, X, Mic, MicOff, Camera, Diamond, MessageSquare, Sparkles } from 'lucide-react';
import { LiveStream, User } from '../types';
import { API } from '../services/api';

interface LiveStreamViewProps {
  currentUser: User;
  onClose: () => void;
  onTipCreator?: (creatorId: string) => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  currentUser,
  onClose,
  onTipCreator,
}) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [heartsCount, setHeartsCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newStreamTitle, setNewStreamTitle] = useState('Late Night Cyber Vibes & Live Beats ⚡');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadStreams = async () => {
    const list = await API.getLiveStreams();
    setStreams(list);
    if (list.length > 0 && !activeStream) {
      setActiveStream(list[0]);
      setHeartsCount(list[0].heartsCount);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const handleStartBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const newLive = await API.startLiveStream(newStreamTitle, 'Music & Creative');
      setActiveStream(newLive);
      setIsBroadcaster(true);
      setIsBroadcasting(true);
    } catch (err) {
      // Fallback simulation if camera denied
      const newLive = await API.startLiveStream(newStreamTitle, 'Music & Creative');
      setActiveStream(newLive);
      setIsBroadcaster(true);
      setIsBroadcasting(true);
    }
  };

  const handleEndBroadcast = async () => {
    if (activeStream) {
      await API.endLiveStream(activeStream.id);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsBroadcasting(false);
    setIsBroadcaster(false);
    onClose();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeStream) return;
    const msg = await API.sendLiveChat(activeStream.id, chatInput.trim());
    setActiveStream((prev) => (prev ? { ...prev, chatMessages: [...prev.chatMessages, msg] } : null));
    setChatInput('');
  };

  const handleHeartTap = async () => {
    if (!activeStream) return;
    const count = await API.sendLiveHeart(activeStream.id);
    setHeartsCount(count);

    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Background Video / Camera Stream */}
      <div className="absolute inset-0 z-0">
        {isBroadcaster && isBroadcasting ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <img
            src="/src/assets/images/reel_music_producer_1792852723398.jpg"
            alt="Live stream"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Floating Animated Hearts */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-20 text-pink-500 animate-bounce transition-all duration-1000"
            style={{ left: `${h.left}%`, transform: 'translateY(-120px) scale(1.3)', opacity: 0.8 }}
          >
            <Heart className="w-8 h-8 fill-pink-500" />
          </div>
        ))}
      </div>

      {/* Top HUD: Live Badge, Host Info, Viewer Count & Close */}
      <div className="relative z-20 px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <img
              src={activeStream?.hostAvatar || currentUser.avatar}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-bold text-white">@{activeStream?.hostUsername || currentUser.username}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{activeStream?.viewerCount || 1}</span>
          </div>
        </div>

        <button
          onClick={isBroadcasting ? handleEndBroadcast : onClose}
          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stream Title Overlay */}
      <div className="relative z-20 px-4 text-left">
        <p className="text-xs text-white/90 font-medium drop-shadow-md">
          {activeStream?.title || newStreamTitle}
        </p>
      </div>

      {/* Broadcaster Go-Live Bar if not active */}
      {!isBroadcasting && !isBroadcaster && (
        <div className="relative z-20 mx-4 p-3 bg-purple-950/80 backdrop-blur-md rounded-2xl border border-purple-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-300" />
            <div className="text-xs">
              <span className="font-bold text-white block">Want to go live?</span>
              <span className="text-purple-300 text-[11px]">Stream to all your followers</span>
            </div>
          </div>
          <button
            onClick={handleStartBroadcast}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Go Live Now
          </button>
        </div>
      )}

      {/* Bottom Interactive Area: Chat Feed & Controls */}
      <div className="relative z-20 p-4 flex flex-col gap-3">
        {/* Chat Feed */}
        <div className="max-h-44 overflow-y-auto flex flex-col gap-2 no-scrollbar pr-1">
          {activeStream?.chatMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 text-xs bg-black/40 backdrop-blur-sm rounded-xl p-2 w-fit max-w-[85%]">
              <span className="font-bold text-purple-300">@{msg.username}:</span>
              <span className="text-white">{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Action Controls & Input */}
        <div className="flex items-center gap-2">
          {isBroadcasting ? (
            /* Streamer Control Rail */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full text-white ${isMuted ? 'bg-red-600' : 'bg-black/60'}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleEndBroadcast}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                End Stream
              </button>
            </div>
          ) : (
            /* Viewer Chat & Tip Rail */
            <form onSubmit={handleSendChat} className="flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Send a comment to the live chat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />

              {onTipCreator && activeStream && activeStream.hostUserId !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => onTipCreator(activeStream.hostUserId)}
                  className="p-2.5 rounded-full bg-amber-500/80 text-white hover:bg-amber-500 transition-colors shadow-lg cursor-pointer"
                  title="Send Diamond Tip"
                >
                  <Diamond className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleHeartTap}
                className="p-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white transition-colors shadow-lg cursor-pointer active:scale-125"
                title="Send Floating Heart"
              >
                <Heart className="w-5 h-5 fill-white" />
              </button>

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
