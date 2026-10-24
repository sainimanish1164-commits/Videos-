import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, TrendingUp, Users, Eye, Clock, Award, ShieldCheck, ArrowUpRight, Diamond, CreditCard, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CreatorStats, User } from '../types';
import { API } from '../services/api';

interface CreatorStudioProps {
  currentUser: User;
  onClose: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'monetization' | 'payouts'>('analytics');
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('150.00');
  const [payoutMethod, setPayoutMethod] = useState('Stripe Direct');
  const [payoutDestination, setPayoutDestination] = useState(currentUser.email);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // Monetization application modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appCategory, setAppCategory] = useState('Digital Art & Filmmaking');
  const [taxCountry, setTaxCountry] = useState('United States');

  const loadStats = async () => {
    setLoading(true);
    const data = await API.getCreatorOverview();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError('');
    try {
      const amt = parseFloat(payoutAmount);
      if (amt < 50) {
        setPayoutError('Minimum payout threshold is $50.00 USD.');
        return;
      }
      await API.requestPayout(amt, payoutMethod, payoutDestination);
      setPayoutSuccessMsg(`Payout request of $${amt.toFixed(2)} submitted successfully!`);
      setShowPayoutModal(false);
      loadStats();
      setTimeout(() => setPayoutSuccessMsg(''), 4000);
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to submit payout request.');
    }
  };

  const handleApplyMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    await API.applyMonetization({
      category: appCategory,
      taxCountry,
      paymentMethod: 'Stripe Direct',
      accountEmail: currentUser.email,
    });
    setShowApplyModal(false);
    loadStats();
  };

  if (loading || !stats) {
    return (
      <div className="w-full flex-1 flex items-center justify-center bg-[#090d16] text-slate-400 p-8">
        Loading creator analytics...
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto no-scrollbar bg-[#090d16] text-slate-100 p-4 pb-20 flex flex-col gap-4">
      {/* Studio Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Creator Studio</h1>
            <p className="text-[11px] text-slate-400">@{currentUser.username} · Professional Dashboard</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Navigation Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-[#0d1322] rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview & Reach
        </button>
        <button
          onClick={() => setActiveTab('monetization')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'monetization' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Monetization & Tips
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'payouts' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payouts
        </button>
      </div>

      {payoutSuccessMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* 1. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-4">
          {/* Top 4 KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px]">Total Views</span>
                <Eye className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-lg font-bold text-white tabular-nums">
                {stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> +18.4% vs last week
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px]">Followers</span>
                <Users className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-lg font-bold text-white tabular-nums">
                {stats.followers > 999 ? `${(stats.followers / 1000).toFixed(1)}k` : stats.followers}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> +284 new
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px]">Watch Time</span>
                <Clock className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <span className="text-lg font-bold text-white tabular-nums">
                {stats.watchTimeHours} hrs
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12.1%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px]">Engagement</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-lg font-bold text-white tabular-nums">
                {stats.engagementRate}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Top 5% in category</span>
            </div>
          </div>

          {/* Interactive Weekly Growth Chart Bar Visualizer */}
          <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Audience Growth & Daily Views</h3>
                <p className="text-[10px] text-slate-400">Total reach across feed and short reels</p>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                {(['7d', '30d', '90d'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-2 py-0.5 rounded-md ${
                      timeRange === t ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Bars */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
              {stats.chartData.map((d) => {
                const maxVal = Math.max(...stats.chartData.map((i) => i.views));
                const heightPercent = Math.max(15, Math.round((d.views / maxVal) * 100));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] text-slate-400 tabular-nums">
                      {(d.views / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-lg transition-all hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white">Top Performing Posts & Reels</h3>
            <div className="flex flex-col gap-2">
              {stats.topContent.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-purple-400 w-4">#{idx + 1}</span>
                    <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.likes.toLocaleString()} likes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white tabular-nums">
                      {(item.views / 1000).toFixed(1)}k
                    </div>
                    <span className="text-[9px] text-slate-500">views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MONETIZATION TAB */}
      {activeTab === 'monetization' && (
        <div className="flex flex-col gap-4">
          {/* Monetization Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-900/60 via-indigo-950/60 to-[#0d1322] border border-purple-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold text-white">VibeGram Creator Program</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  stats.isMonetized ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {stats.isMonetized ? 'Active & Approved' : 'Application Required'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Earn directly from short video ad revenue shares, livestream diamonds, fan tips, and monthly VIP subscriptions.
            </p>

            {!stats.isMonetized && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer"
              >
                Apply for Creator Monetization
              </button>
            )}
          </div>

          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Revenue</span>
              <span className="text-xl font-black text-white tabular-nums mt-1">
                ${stats.estimatedEarnings.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Real-time unfinalized</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Verified Payout Balance</span>
              <span className="text-xl font-black text-emerald-400 tabular-nums mt-1">
                ${stats.verifiedBalance.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Available for withdrawal</span>
            </div>
          </div>

          {/* Stream of Revenue Breakdown */}
          <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white">Revenue Sources</h4>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Short Video Ad Revenue</span>
                <span className="font-bold text-white tabular-nums">${stats.adRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Virtual Diamonds & Live Tips</span>
                <span className="font-bold text-amber-300 tabular-nums">${stats.tipsRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">VIP Fan Subscriptions</span>
                <span className="font-bold text-indigo-300 tabular-nums">${stats.subscriptionRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ready for Withdrawal</span>
              <div className="text-2xl font-black text-white tabular-nums mt-0.5">
                ${stats.verifiedBalance.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Min. threshold: $50.00 USD</span>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={stats.verifiedBalance < 50}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Request Payout
            </button>
          </div>

          {/* Payout History List */}
          <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white">Payout History & Transferred Records</h3>

            {stats.payoutHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No payout requests submitted yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.payoutHistory.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">${p.amount.toFixed(2)} USD</div>
                      <div className="text-[10px] text-slate-400">
                        {p.paymentMethod} · {new Date(p.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'processed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : p.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestPayout}
            className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Request Creator Payout</h3>
            <p className="text-xs text-slate-400">
              Transfer your verified earnings to your connected bank or PayPal account.
            </p>

            {payoutError && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl">
                {payoutError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                Amount (USD) - Min $50.00
              </label>
              <input
                type="number"
                step="0.01"
                min="50"
                max={stats.verifiedBalance}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Payout Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Stripe Direct" className="bg-slate-900">Stripe Direct Bank Transfer</option>
                <option value="PayPal" className="bg-slate-900">PayPal Instant Transfer</option>
                <option value="Wise / Wire" className="bg-slate-900">Wise International Wire</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Account Destination</label>
              <input
                type="text"
                value={payoutDestination}
                onChange={(e) => setPayoutDestination(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Submit Payout
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monetization Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleApplyMonetization}
            className="w-full max-w-sm bg-[#0d1322] border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Apply for Creator Program</h3>
            <p className="text-xs text-slate-400">
              Join the VibeGram creator program to enable ad revenue and gift tips.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Content Category</label>
              <input
                type="text"
                value={appCategory}
                onChange={(e) => setAppCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Tax Residence Country</label>
              <input
                type="text"
                value={taxCountry}
                onChange={(e) => setTaxCountry(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
