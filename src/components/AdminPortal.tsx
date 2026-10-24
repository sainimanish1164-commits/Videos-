import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Flag, DollarSign, Award, CheckCircle2, XCircle, Ban, Check, RefreshCw } from 'lucide-react';
import { User, ReportItem } from '../types';
import { API } from '../services/api';

interface AdminPortalProps {
  currentUser: User;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'monetization' | 'payouts'>('reports');
  const [adminData, setAdminData] = useState<{
    stats: any;
    users: User[];
    reports: ReportItem[];
    monetizationApps: any[];
    payoutHistory: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await API.getAdminOverview();
    setAdminData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBan = async (userId: string) => {
    await API.toggleUserBan(userId);
    loadData();
  };

  const handleToggleVerified = async (userId: string) => {
    await API.toggleUserVerified(userId);
    loadData();
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await API.resolveReport(reportId, status);
    loadData();
  };

  const handleMonetizationDecision = async (appId: string, decision: 'approve' | 'reject') => {
    await API.reviewMonetization(appId, decision);
    loadData();
  };

  const handlePayoutStatus = async (payoutId: string, status: 'processed' | 'declined') => {
    await API.updatePayoutStatus(payoutId, status);
    loadData();
  };

  if (loading || !adminData) {
    return <div className="p-8 text-center text-slate-400">Loading administrator control room...</div>;
  }

  return (
    <div className="w-full flex-1 overflow-y-auto no-scrollbar bg-[#090d16] text-slate-100 p-4 pb-20 flex flex-col gap-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Administrator Control Room
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ROLE: ADMIN
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Content safety, user verification, and monetization approvals</p>
          </div>
        </div>

        <button onClick={onClose} className="text-xs text-purple-400 hover:text-purple-300 font-medium">
          Close
        </button>
      </div>

      {/* Platform Status Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Platform Users</span>
          <span className="text-lg font-bold text-white tabular-nums mt-0.5">{adminData.stats.totalUsers}</span>
          <span className="text-[10px] text-emerald-400">Daily Active: 34.2k</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Posts & Reels</span>
          <span className="text-lg font-bold text-white tabular-nums mt-0.5">
            {adminData.stats.totalPosts + adminData.stats.totalReels}
          </span>
          <span className="text-[10px] text-purple-400">{adminData.stats.totalViews.toLocaleString()} views</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Pending Reports</span>
          <span className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">
            {adminData.reports.filter((r) => r.status === 'pending').length}
          </span>
          <span className="text-[10px] text-slate-500">Awaiting review</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
          <span className="text-[10px] text-indigo-400 uppercase font-semibold">Creator Apps</span>
          <span className="text-lg font-bold text-indigo-400 tabular-nums mt-0.5">
            {adminData.monetizationApps.length}
          </span>
          <span className="text-[10px] text-slate-500">Monetization queue</span>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex items-center gap-1 p-1 bg-[#0d1322] rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'reports' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reports ({adminData.reports.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('monetization')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'monetization' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Creator Program
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'payouts' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payouts Queue
        </button>
      </div>

      {/* 1. REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-2.5">
          {adminData.reports.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">No reports in moderation queue.</div>
          ) : (
            adminData.reports.map((rep) => (
              <div key={rep.id} className="p-3.5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" /> {rep.reason}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rep.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{rep.details}</p>
                <div className="text-[10px] text-slate-500">
                  Target ID: {rep.targetId} · Reported by: @{rep.reporterUsername}
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 justify-end">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500"
                    >
                      Take Down & Strike
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-2">
          {adminData.users.map((u) => (
            <div key={u.id} className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    @{u.username}
                    {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    {u.isBanned && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">
                        BANNED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{u.email} · {u.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVerified(u.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    u.isVerified ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle official verification badge"
                >
                  {u.isVerified ? 'Verified ✓' : 'Grant Badge'}
                </button>

                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleBan(u.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      u.isBanned ? 'bg-emerald-600 text-white' : 'bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white'
                    }`}
                    title={u.isBanned ? 'Lift Account Suspension' : 'Suspend Account'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. MONETIZATION APPLICATIONS */}
      {activeTab === 'monetization' && (
        <div className="flex flex-col gap-2.5">
          {adminData.monetizationApps.map((m) => (
            <div key={m.id} className="p-3.5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">@{m.username}</span>
                  <span className="text-[10px] text-slate-400 ml-2">{m.category}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-300">
                Followers: {m.followers.toLocaleString()} · Monthly Views: {m.monthlyViews.toLocaleString()} · Country: {m.taxCountry}
              </div>

              {m.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5 justify-end">
                  <button
                    onClick={() => handleMonetizationDecision(m.id, 'reject')}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleMonetizationDecision(m.id, 'approve')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Approve Creator
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. PAYOUTS QUEUE */}
      {activeTab === 'payouts' && (
        <div className="flex flex-col gap-2.5">
          {adminData.payoutHistory.map((p) => (
            <div key={p.id} className="p-3.5 rounded-2xl bg-[#0d1322] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">
                  ${p.amount.toFixed(2)} USD to @{p.username}
                </div>
                <div className="text-[10px] text-slate-400">
                  {p.paymentMethod} · {p.destination}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'processed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : p.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {p.status}
                </span>

                {p.status === 'pending' && (
                  <button
                    onClick={() => handlePayoutStatus(p.id, 'processed')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
