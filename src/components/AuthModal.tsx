import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, CheckCircle2, ArrowRight, Diamond } from 'lucide-react';
import { User } from '../types';
import { API } from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser: User;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, currentUser }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'switch'>('switch');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await API.login({ email, password });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setMessage('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await API.register({
        username,
        displayName: displayName || username,
        email,
        password,
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setMessage('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const msg = await API.forgotPassword(email);
    setMessage(msg);
    setLoading(false);
  };

  const handleQuickSwitch = async (userId: string) => {
    setLoading(true);
    const user = await API.switchUser(userId);
    onSuccess(user);
    setLoading(false);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Instant Google auth integration simulation
    const user = await API.login({ email: 'sam@vibegram.social' });
    onSuccess(user);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md">
              V
            </div>
            <span className="text-sm font-bold text-white">VibeGram Authentication</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 mx-4 mt-4 bg-black/40 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'switch' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="mx-4 mt-3 p-2.5 bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs rounded-xl">
            {message}
          </div>
        )}

        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* QUICK SWITCHER TAB (Allows easily testing all roles) */}
          {mode === 'switch' && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] text-slate-400 font-medium">
                Switch active demo persona to test permissions & workflows:
              </span>

              {[
                { id: 'usr_me', name: 'Sam Rivera', role: 'creator', handle: '@vibestar', avatar: '/src/assets/images/vibegram_app_icon_1792852720712.jpg' },
                { id: 'usr_alexa', name: 'Alexa Chen', role: 'creator', handle: '@alexavibes', avatar: '/src/assets/images/reel_streetwear_creator_1792852720851.jpg' },
                { id: 'usr_marco', name: 'Marco Silva', role: 'creator', handle: '@marcostravels', avatar: '/src/assets/images/reel_travel_sunset_1792852722497.jpg' },
                { id: 'usr_admin', name: 'Operations Team', role: 'admin', handle: '@vibegram_admin', avatar: '/src/assets/images/vibegram_app_icon_1792852720712.jpg' },
              ].map((p) => {
                const isActive = currentUser.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleQuickSwitch(p.id)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-950/60 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                              p.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{p.handle}</span>
                      </div>
                    </div>

                    {isActive && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Email or Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@vibegram.social"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-purple-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer mt-1"
              >
                {loading ? 'Logging In...' : 'Log In to VibeGram'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourhandle"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer mt-1"
              >
                {loading ? 'Creating Account...' : 'Create Account & Start Vibing'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="flex flex-col gap-3">
              <p className="text-slate-300 leading-relaxed">
                Enter your account email to receive a password recovery link.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Account Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-center text-slate-400 hover:text-white"
              >
                Back to Log In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const TipModal: React.FC<{
  creatorId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}> = ({ creatorId, onClose, onSuccess }) => {
  const [diamonds, setDiamonds] = useState(50);
  const [tipMessage, setTipMessage] = useState('Love your vibes! Keep inspiring ✨');
  const [sending, setSending] = useState(false);

  const handleSendTip = async () => {
    setSending(true);
    const msg = await API.sendTip(creatorId, diamonds, tipMessage);
    setSending(false);
    onSuccess(msg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0d1322] border border-amber-500/30 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Send Creator Tip</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Support your favorite creators directly with Vibe Diamonds. 100% of gift tips are transferred to their payout balance.
        </p>

        {/* Diamond Tier Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[20, 50, 100, 500].map((num) => (
            <button
              key={num}
              onClick={() => setDiamonds(num)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                diamonds === num
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="block text-sm">💎 {num}</span>
              <span className="text-[9px] text-slate-400">${(num * 0.05).toFixed(2)}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Gift Message</label>
          <input
            type="text"
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          />
        </div>

        <button
          onClick={handleSendTip}
          disabled={sending}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Diamond className="w-4 h-4" />
          <span>Send {diamonds} Diamonds (${(diamonds * 0.05).toFixed(2)})</span>
        </button>
      </div>
    </div>
  );
};
