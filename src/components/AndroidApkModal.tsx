import React, { useState } from 'react';
import { X, Smartphone, Download, Terminal, CheckCircle2, Copy, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface AndroidApkModalProps {
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'capacitor' | 'twa'>('install');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadAndroidConfigBundle = () => {
    const configData = {
      appName: 'VibeGram',
      appId: 'com.vibegram.social',
      webDir: 'dist',
      android: {
        minSdkVersion: 24,
        targetSdkVersion: 34,
        compileSdkVersion: 34,
        versionCode: 1,
        versionName: '1.0.0',
        allowMixedContent: true,
      },
      manifest: {
        package: 'com.vibegram.social',
        permissions: [
          'android.permission.INTERNET',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.READ_MEDIA_IMAGES',
          'android.permission.READ_MEDIA_VIDEO',
          'android.permission.POST_NOTIFICATIONS',
        ],
      },
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibegram-android-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-xl bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                VibeGram Android Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  com.vibegram.social
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Production Android packaging, APK build guide, and native PWA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 bg-[#0d1322] border-b border-white/5">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'install'
                ? 'border-purple-500 text-purple-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Direct Android Install (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'capacitor'
                ? 'border-purple-500 text-purple-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Capacitor APK Build
          </button>
          <button
            onClick={() => setActiveTab('twa')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'twa'
                ? 'border-purple-500 text-purple-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Bubblewrap TWA Signed APK
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar text-xs">
          {/* TAB 1: Direct Android Install (PWA / WebAPK) */}
          {activeTab === 'install' && (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Instant Android Device Installation</h3>
                  <p className="text-[11px] text-slate-300 mt-1 max-w-sm">
                    VibeGram is fully compliant with Android WebAPK standards. On any Android phone, Chrome creates an isolated APK package directly on your home screen.
                  </p>
                </div>
                <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#090d16] border border-white/5 flex flex-col gap-3">
                <h4 className="font-bold text-white">How to Install on Android in 10 Seconds:</h4>
                <ol className="list-decimal list-inside flex flex-col gap-2 text-slate-300">
                  <li>Open this VibeGram URL in <strong>Google Chrome for Android</strong>.</li>
                  <li>Tap the browser menu icon (<strong>⋮</strong> three dots in top-right corner).</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Tap <strong>Install</strong>. Android will build and launch <strong>VibeGram</strong> as an independent native app without any browser URL bar.</li>
                </ol>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-semibold block">Android Package Config</span>
                  <span className="text-[10px] text-slate-500 font-mono">com.vibegram.social (v1.0.0)</span>
                </div>
                <button
                  onClick={handleDownloadAndroidConfigBundle}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON Bundle
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Capacitor Native APK Build */}
          {activeTab === 'capacitor' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Production APK Compilation Notice</span>
                  <span>
                    Building an Android `.apk` binary requires the Android SDK, Gradle, and Java Development Kit (JDK 17). Since AI Studio runs in a cloud web container without Gradle/Android SDK installed, compile the APK on your machine using these standard Capacitor commands:
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-white">Terminal Steps to Generate `.apk`:</span>

                {[
                  {
                    title: '1. Build frontend distribution',
                    cmd: 'npm run build',
                  },
                  {
                    title: '2. Install Capacitor core & Android runtime',
                    cmd: 'npm install @capacitor/core @capacitor/cli @capacitor/android',
                  },
                  {
                    title: '3. Initialize Capacitor with VibeGram package',
                    cmd: 'npx cap init VibeGram com.vibegram.social --web-dir=dist',
                  },
                  {
                    title: '4. Add Android native platform & sync assets',
                    cmd: 'npx cap add android && npx cap sync android',
                  },
                  {
                    title: '5. Build Debug APK or Release APK directly',
                    cmd: 'cd android && ./gradlew assembleDebug\n# Output: android/app/build/outputs/apk/debug/app-debug.apk',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#090d16] border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>{step.title}</span>
                      <button
                        onClick={() => copyToClipboard(step.cmd, idx)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedIndex === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded-lg bg-black font-mono text-[11px] text-purple-200 overflow-x-auto whitespace-pre-wrap">
                      {step.cmd}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Bubblewrap TWA Signed APK */}
          {activeTab === 'twa' && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-300 leading-relaxed">
                Google's official <strong>Bubblewrap CLI</strong> turns your Web App Manifest (<code className="text-purple-300 font-mono">/manifest.json</code>) into a verified, Google Play Store-ready signed APK:
              </p>

              <div className="p-3 rounded-xl bg-[#090d16] border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Generate Signed APK via Bubblewrap:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm install -g @bubblewrap/cli\nbubblewrap init --manifest=http://localhost:3000/manifest.json\nbubblewrap build',
                        99
                      )
                    }
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedIndex === 99 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 99 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-black font-mono text-[11px] text-purple-200 whitespace-pre-wrap">
{`# 1. Install Google Bubblewrap
npm install -g @bubblewrap/cli

# 2. Initialize project from VibeGram manifest
bubblewrap init --manifest=http://localhost:3000/manifest.json

# 3. Compile signed APK ready for installation
bubblewrap build

# Result: app-release-signed.apk generated!`}
                </pre>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-semibold block">App Name: VibeGram</span>
                  <span className="text-[10px] text-slate-500 font-mono">Package: com.vibegram.social</span>
                </div>
                <button
                  onClick={handleDownloadAndroidConfigBundle}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download App Manifest & Config
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#090d16] flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Android Target SDK: 34 · Min SDK: 24</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
