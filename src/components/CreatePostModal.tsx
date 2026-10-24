import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Film, Image as ImageIcon, Music, MapPin, Hash, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Post, User } from '../types';
import { API } from '../services/api';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

const SAMPLE_TRACKS = [
  { title: 'Tokyo Cyber Drive', artist: 'SynthPulse' },
  { title: 'Golden Hour Horizons', artist: 'Acoustic Drift' },
  { title: 'Midnight Chill Lo-Fi', artist: 'Elena R.' },
  { title: 'Sub-Bass Euphoria', artist: 'Kai Tanaka' },
  { title: 'Ocean Waves Therapy', artist: 'Marco Silva' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onPostCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(SAMPLE_TRACKS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('photo');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Live Camera preview integration
  const startCamera = async () => {
    try {
      setActiveTab('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setErrorMessage('Camera access was not granted or is unavailable on this device.');
    }
  };

  const capturePhoto = () => {
    if (!videoPreviewRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoPreviewRef.current.videoWidth || 640;
    canvas.height = videoPreviewRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoPreviewRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setMediaPreview(dataUrl);
      setMediaType('photo');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaPreview) {
      setErrorMessage('Please select or capture a photo/video first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      // Simulate progress indicator
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 25;
        });
      }, 150);

      const post = await API.createPost({
        mediaUrl: mediaPreview,
        thumbnailUrl: mediaPreview,
        mediaType,
        caption,
        location: location || 'VibeGram Studio',
        audioTrack: selectedTrack,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        onPostCreated(post);
        handleModalClose();
      }, 400);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage('Upload failed. Please check network connection and retry.');
    }
  };

  // Sample quick presets if user wants instant media demo
  const selectPreset = (type: 'photo' | 'video', url: string) => {
    setMediaType(type);
    setMediaPreview(url);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="relative w-full max-w-lg bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <h2 className="text-sm font-bold text-white">Create New Vibe Post</h2>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
          {/* Mode Switcher: Upload Gallery vs Live Camera */}
          <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'upload' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Gallery / File
            </button>
            <button
              type="button"
              onClick={startCamera}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'camera' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
          </div>

          {/* Media Viewport Preview */}
          {activeTab === 'camera' && isCameraActive ? (
            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-purple-500/30 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Camera className="w-4 h-4" /> Capture Snapshot
              </button>
            </div>
          ) : mediaPreview ? (
            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls autoPlay loop className="w-full h-full object-cover" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMediaPreview('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                title="Change media"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                {mediaType === 'video' ? 'Vertical Video (Reel + Feed)' : 'Standard Photo'}
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer group bg-purple-950/10 hover:bg-purple-950/20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-3 border border-purple-500/30">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-white mb-1">Click to browse photos or videos</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Supports MP4, WebM, JPG, PNG. Short videos are automatically routed to full-screen Reels.
              </p>

              {/* Sample Presets */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] text-slate-500 w-full mb-1">Quick high-res test presets:</span>
                <button
                  type="button"
                  onClick={() => selectPreset('photo', '/src/assets/images/reel_streetwear_creator_1792852720851.jpg')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                >
                  Tokyo Streetwear
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('photo', '/src/assets/images/reel_travel_sunset_1792852722497.jpg')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                >
                  Bali Sunset
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-700 text-[10px] hover:bg-purple-800 transition-colors"
                >
                  Sample Video MP4
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Form Fields */}
          <div className="flex flex-col gap-3">
            {/* Caption */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                Caption & Hashtags
              </label>
              <textarea
                rows={3}
                placeholder="Write a caption, drop tags like #Tokyo #Aesthetic #Vibe..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Location Tag */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Add Location
              </label>
              <input
                type="text"
                placeholder="e.g. Shibuya, Tokyo or Venice Beach, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Audio Track Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                Background Audio / Vibe Track
              </label>
              <select
                value={selectedTrack.title}
                onChange={(e) => {
                  const found = SAMPLE_TRACKS.find((t) => t.title === e.target.value);
                  if (found) setSelectedTrack(found);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {SAMPLE_TRACKS.map((t) => (
                  <option key={t.title} value={t.title} className="bg-slate-900 text-white">
                    {t.title} · {t.artist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress Bar when uploading */}
          {isUploading && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-purple-300 font-semibold">
                <span>Publishing to VibeGram Cloud...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-white/10 bg-[#090d16] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Share to Feed & Reels</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
