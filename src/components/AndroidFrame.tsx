import React from 'react';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isDeviceMode: boolean;
  onToggleMode: () => void;
  onOpenApkModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDeviceMode,
  onToggleMode,
  onOpenApkModal,
}) => {
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col items-center justify-start select-none">
      {/* Top Universal Control Strip */}
      <header className="w-full bg-[#0d1322] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-white bg-clip-text text-transparent">
              VibeGram Android
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline font-mono text-[11px]">
            pkg: com.vibegram.social
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* APK & Packaging button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-xs font-medium cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK & Install</span>
          </button>

          {/* Toggle View Mode */}
          <button
            onClick={onToggleMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs font-medium cursor-pointer"
            title={isDeviceMode ? 'Switch to Fullscreen Responsive' : 'Switch to Android Phone Mockup'}
          >
            {isDeviceMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Expanded View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Phone Shell</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className={`w-full flex-1 flex items-center justify-center ${isDeviceMode ? 'py-4 sm:py-8 px-2 sm:px-4' : ''}`}>
        {isDeviceMode ? (
          /* Android Hardware Frame */
          <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(124,58,237,0.15)] flex flex-col border border-slate-700/60 overflow-hidden">
            {/* Phone Bezel Glare & Speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-800 rounded-full z-40 pointer-events-none" />

            {/* Android Screen Container */}
            <div className="relative w-full h-full bg-[#090d16] rounded-[38px] overflow-hidden flex flex-col border border-white/5">
              {/* Android Status Bar */}
              <div className="h-7 w-full px-5 pt-1 flex items-center justify-between text-[11px] font-medium text-slate-300 z-40 bg-[#090d16]/90 backdrop-blur-md shrink-0">
                <span>{currentTimeStr}</span>
                {/* Punch-hole camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-mono">5G</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* App Viewport Inside Phone */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                {children}
              </div>

              {/* Android Bottom Gesture Pill */}
              <div className="h-4 w-full bg-[#090d16] flex items-center justify-center shrink-0 z-40">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive Viewport */
          <main className="w-full h-[calc(100vh-45px)] max-w-4xl mx-auto flex flex-col overflow-hidden bg-[#090d16]">
            {children}
          </main>
        )}
      </div>
    </div>
  );
};
