import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { Skeleton } from '../components/common/Skeleton';
import {
  Activity, CheckCircle2, Clock, Sparkles, AlertCircle,
  ArrowRight, TrendingUp, Target, Zap, Users,
  ShieldAlert, BrainCircuit, ActivitySquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

// ── Intelligence Skeleton ──────────────────────────────────────────────────────
const IntelligenceSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-6">
      <div className="h-32 w-32 bg-slate-200 rounded-full mx-auto mb-4" />
      <div className="h-6 w-3/4 bg-slate-200 rounded mx-auto mb-2" />
      <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto" />
    </div>
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full">
        <div className="h-6 w-1/4 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="h-4 w-4/6 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const RiskSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
        <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4" />
        <div className="h-8 w-1/2 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

// ── Dashboard Component ────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, token, activeTeam } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIntelligence = useCallback(async () => {
    if (!activeTeam?._id) { setIsLoading(false); return; }
    try {
      setIsLoading(true); setError('');
      const { data } = await api.get(`/intelligence/${activeTeam._id}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load intelligence report. Our AI might be taking a break.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, token]);

  useEffect(() => { fetchIntelligence(); }, [fetchIntelligence]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Layout>
      {/* ── Greeting Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '2px solid #e0e7ff', boxShadow: '0 4px 16px rgba(99,102,241,0.15)' }}>
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}&backgroundColor=b6e3f4`}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {activeTeam?.name
                ? `Engineering Intelligence for ${activeTeam.name}`
                : 'Select a team to view AI insights'}
            </p>
          </div>
        </div>

        {/* Quick action links */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors"
          >
            <Users className="w-4 h-4" /> Team Board
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <TrendingUp className="w-4 h-4" /> Analytics
          </Link>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={fetchIntelligence} className="ml-auto text-xs font-semibold underline">Retry AI Analysis</button>
        </div>
      )}

      {/* ── No Team ─────────────────────────────────────── */}
      {!activeTeam && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5 shadow-sm">
            <Users className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No team selected</h3>
          <p className="text-slate-500 mb-6 max-w-xs">Select a team to run the Engineering Intelligence Engine.</p>
        </div>
      )}

      {/* ── Dashboard Content ──────────────────────────────────── */}
      {activeTeam && (
        <>
          {isLoading ? (
            <>
              <IntelligenceSkeleton />
              <RiskSkeleton />
            </>
          ) : report && (
            <>
              {/* ── Top Section: Health & Root Cause ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-slide-up">
                
                {/* Health Score Ring */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 w-full h-1 ${getHealthBg(report.intelligence.healthScore)}`} />
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Project Health</h3>
                  
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - report.intelligence.healthScore / 100)}`}
                        className={`transition-all duration-1500 ease-out ${getHealthColor(report.intelligence.healthScore)}`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-4xl font-extrabold ${getHealthColor(report.intelligence.healthScore)} tabular`}>
                        {report.intelligence.healthScore}
                      </span>
                      <span className="text-xs font-bold text-slate-400 mt-1 uppercase">/ 100</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthBg(report.intelligence.healthScore)} animate-pulse`} />
                    <span className="font-bold text-slate-700">{report.intelligence.healthStatus}</span>
                  </div>
                </div>

                {/* AI Root Cause Analysis */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden text-white">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">AI Root Cause Analysis</h3>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {report.intelligence.rootCauseAnalysis.map((cause, i) => (
                      <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <ArrowRight className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-indigo-50 leading-relaxed text-sm">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Middle Section: Risks & Recommendations ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                
                {/* Predictions & Risks */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-500" /> Sprint Risk
                      </h3>
                      <span className="text-2xl font-extrabold text-rose-500 tabular">
                        {report.intelligence.riskPredictions.sprintFailureRisk}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${report.intelligence.riskPredictions.sprintFailureRisk}%` }} 
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <ActivitySquare className="w-4 h-4 text-amber-500" /> Delivery Risk
                    </h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {report.intelligence.riskPredictions.deliveryRisk}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Actionable Recommendations
                  </h3>
                  <div className="space-y-3">
                    {report.intelligence.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 group hover:bg-amber-50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 font-medium mt-0.5">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Bottom Section: Raw Metrics Summary ── */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-bold text-slate-800 mb-5">Raw Metric Data</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Tasks', val: report.metrics.totalTasks, color: 'text-slate-900' },
                    { label: 'Completed', val: report.metrics.completedTasks, color: 'text-emerald-600' },
                    { label: 'Blocked', val: report.metrics.blockedTasks, color: 'text-red-500' },
                    { label: 'Overdue', val: report.metrics.overdueTasks, color: 'text-rose-500' },
                    { label: 'Completion', val: `${report.metrics.completionRate.toFixed(0)}%`, color: 'text-indigo-600' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className={`text-2xl font-extrabold tabular ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
