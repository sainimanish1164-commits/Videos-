import React, { useState } from 'react';
import { X, Moon, Sun, Lock, Bell, Download, Trash2, Shield, Globe, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { API } from '../services/api';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onLogout: () => void;
  onUpdateCurrentUser: (user: User) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  onLogout,
  onUpdateCurrentUser,
}) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'blocked' | 'help' | 'privacy'>('main');
  const [blockedUsers, setBlockedUsers] = useState<string[]>(currentUser.blockedUserIds || []);
  const [isDarkMode, setIsDarkMode] = useState(currentUser.settings.darkMode);
  const [notificationsOn, setNotificationsOn] = useState(currentUser.settings.notifications);
  const [readReceiptsOn, setReadReceiptsOn] = useState(currentUser.settings.readReceipts);
  const [selectedLanguage, setSelectedLanguage] = useState(currentUser.settings.language || 'English');
  const [saveToast, setSaveToast] = useState('');

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast('Theme updated');
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleDownloadData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vibegram_archive_${currentUser.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Account data exported as JSON archive');
  };

  const handleUnblock = async (id: string) => {
    const updated = await API.toggleBlockUser(id);
    setBlockedUsers(updated);
    showToast('User unblocked');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Settings & Preferences</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveToast && (
          <div className="mx-4 mt-3 p-2.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar text-xs">
          {/* Account Profile Card */}
          <div className="p-3 rounded-2xl bg-white/5 flex items-center gap-3">
            <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-bold text-white text-sm">@{currentUser.username}</div>
              <div className="text-slate-400 text-[11px]">{currentUser.email}</div>
              <span className="text-[10px] text-purple-400 font-semibold uppercase">{currentUser.role} Account</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Display & Theme</span>

            <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span className="text-white">Dark Mode Theme</span>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  isDarkMode ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="text-white">Language</span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  showToast(`Language set to ${e.target.value}`);
                }}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px]"
              >
                <option value="English">English (US)</option>
                <option value="Spanish">Español</option>
                <option value="Japanese">日本語</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Privacy & Safety</span>

            <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-300" />
                <span className="text-white">Read Receipts in Messages</span>
              </div>
              <input
                type="checkbox"
                checked={readReceiptsOn}
                onChange={(e) => {
                  setReadReceiptsOn(e.target.checked);
                  showToast('Read receipt setting updated');
                }}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-300" />
                <span className="text-white">Push & In-App Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsOn}
                onChange={(e) => {
                  setNotificationsOn(e.target.checked);
                  showToast('Notification preference saved');
                }}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>

            {blockedUsers.length > 0 && (
              <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-2">
                <span className="font-semibold text-slate-200">Blocked Accounts ({blockedUsers.length})</span>
                {blockedUsers.map((id) => (
                  <div key={id} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">User ID: {id}</span>
                    <button onClick={() => handleUnblock(id)} className="text-purple-400 hover:underline">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data & Security */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Data & Account</span>

            <button
              onClick={handleDownloadData}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white">
                <Download className="w-4 h-4 text-purple-400" />
                <span>Download My Account Data</span>
              </div>
              <span className="text-[10px] text-slate-400">JSON Export</span>
            </button>

            <button
              onClick={() => {
                alert('VibeGram Terms of Service: Designed for respectful creator collaboration and safety.');
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Terms of Service & Privacy Policy</span>
              </div>
            </button>
          </div>

          {/* Logout / Switch */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 text-red-300 border border-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              Log Out of @{currentUser.username}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
