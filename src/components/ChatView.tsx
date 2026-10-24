import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Image as ImageIcon, Mic, MicOff, Check, CheckCheck, MoreVertical, Phone, Video, Smile, Sparkles, Diamond } from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { API } from '../services/api';

interface ChatViewProps {
  currentUser: User;
  onBack: () => void;
  onOpenProfile: (userId: string) => void;
  onTipCreator?: (creatorId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  onBack,
  onOpenProfile,
  onTipCreator,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const loadConversations = async () => {
    const list = await API.getConversations();
    setConversations(list);
    if (!selectedConv && list.length > 0) {
      setSelectedConv(list[0]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      API.getMessages(selectedConv.id).then((msgs) => {
        setMessages(msgs);
        scrollToBottom();
      });
    }
  }, [selectedConv?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;

    const sent = await API.sendMessage(selectedConv.id, {
      text: inputText.trim(),
    });

    setMessages((prev) => [...prev, sent]);
    setInputText('');
    scrollToBottom();

    // Trigger simulated response after 2 seconds for a lively demo
    setTimeout(async () => {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const reply = await API.sendMessage(selectedConv.id, {
          senderId: selectedConv.otherUser?.id,
          senderName: selectedConv.otherUser?.displayName,
          senderAvatar: selectedConv.otherUser?.avatar,
          text: 'Super cool! Check out the new reel I just drafted on VibeGram ✨',
        });
        setMessages((prev) => [...prev, reply]);
        scrollToBottom();
      }, 1500);
    }, 1000);
  };

  // Real browser Voice recording using MediaRecorder
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (selectedConv) {
            const voiceMsg = await API.sendMessage(selectedConv.id, {
              text: '🎤 Voice message (0:04)',
              mediaUrl: base64Audio,
              mediaType: 'audio',
              isVoiceNote: true,
            });
            setMessages((prev) => [...prev, voiceMsg]);
            scrollToBottom();
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVoice(true);
    } catch (err) {
      alert('Microphone access is needed to record voice messages.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col sm:flex-row bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full sm:w-72 sm:border-r border-white/5 flex flex-col bg-[#0d1322] shrink-0 ${
          selectedConv ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 sm:hidden text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white">Direct Messages</h2>
          </div>
          <span className="text-[10px] font-mono text-purple-400 font-semibold px-2 py-0.5 rounded-full bg-purple-500/10">
            Encrypted
          </span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {conversations.map((c) => {
            const isSelected = selectedConv?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedConv(c)}
                className={`p-3 flex items-center gap-3 text-left transition-colors border-b border-white/5 cursor-pointer ${
                  isSelected ? 'bg-purple-950/40 border-l-2 border-l-purple-500' : 'hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <img
                    src={c.otherUser?.avatar || '/src/assets/images/vibegram_app_icon_1792852720712.jpg'}
                    alt={c.otherUser?.username}
                    className="w-11 h-11 rounded-full object-cover border border-purple-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0d1322]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      @{c.otherUser?.username}
                    </span>
                    <span className="text-[10px] text-slate-500">2m</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation Messages View */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col h-full bg-[#090d16]">
          {/* Header */}
          <div className="h-14 px-3.5 border-b border-white/5 flex items-center justify-between bg-[#0d1322] shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSelectedConv(null)}
                className="p-1 sm:hidden text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => selectedConv.otherUser && onOpenProfile(selectedConv.otherUser.id)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={selectedConv.otherUser?.avatar}
                  alt={selectedConv.otherUser?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-none">
                    @{selectedConv.otherUser?.username}
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onTipCreator && selectedConv.otherUser && (
                <button
                  onClick={() => onTipCreator(selectedConv.otherUser!.id)}
                  className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Diamond className="w-3.5 h-3.5" /> Tip
                </button>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 no-scrollbar">
            {messages.map((m) => {
              const isMine = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[78%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                        : 'bg-[#151d30] text-slate-200 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {m.mediaUrl && m.mediaType !== 'audio' && (
                      <img src={m.mediaUrl} alt="Attachment" className="rounded-xl mb-1.5 max-h-48 object-cover" />
                    )}

                    {m.isVoiceNote ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="p-1.5 rounded-full bg-white/20">
                          <Mic className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold">{m.text}</span>
                          <span className="text-[9px] opacity-75">Voice memo</span>
                        </div>
                      </div>
                    ) : (
                      <span>{m.text}</span>
                    )}
                  </div>

                  {/* Timestamp & read receipts */}
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-slate-500">
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && <CheckCheck className="w-3 h-3 text-purple-400" />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="self-start text-[11px] text-slate-400 flex items-center gap-1 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span>@{selectedConv.otherUser?.username} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Composer Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0d1322] border-t border-white/5 flex items-center gap-2 shrink-0"
          >
            {/* Voice record button */}
            <button
              type="button"
              onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isRecordingVoice
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
              title={isRecordingVoice ? 'Tap to finish recording' : 'Record voice message'}
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isRecordingVoice ? 'Recording voice note...' : 'Send message...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isRecordingVoice}
              className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-xs">
          Select a conversation from the left to start messaging.
        </div>
      )}
    </div>
  );
};
