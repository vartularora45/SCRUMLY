import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import {
  BarChart2, TrendingUp, CheckCircle2, Clock, AlertCircle,
  Download, Calendar, Users, Sparkles, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/client.js';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const StatBadge = ({ value, trend }) => {
  if (trend === null || trend === undefined) return null;
  const positive = trend >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
      {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {Math.abs(trend)}%
    </span>
  );
};

const Analytics = () => {
  const { token, activeTeam } = useAuth();
  const toast = useToast();

  const [completion,   setCompletion]   = useState(null);
  const [velocity,     setVelocity]     = useState(null);
  const [memberStats,  setMemberStats]  = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!activeTeam?._id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const teamId  = activeTeam._id;
      const headers = { Authorization: `Bearer ${token}` };

      const [compRes, velRes, memberRes] = await Promise.all([
        api.get(`/analytics/${teamId}/completion`,   { headers }),
        api.get(`/analytics/${teamId}/velocity`,     { headers }),
        api.get(`/analytics/${teamId}/member-stats`, { headers }),
      ]);

      setCompletion(compRes.data);
      setVelocity(velRes.data);
      setMemberStats(memberRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load analytics';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const completionRate = completion
    ? Math.round((completion.completionRate || 0) * 100)
    : 0;

  // Pie chart data
  const pieData = completion
    ? [
        { name: 'Done',        value: completion.completedTasks || 0 },
        { name: 'In Progress', value: (completion.totalTasks || 0) - (completion.completedTasks || 0) },
      ].filter((d) => d.value > 0)
    : [];

  // Bar chart: member task distribution
  const barData = memberStats
    .filter((m) => m.name)
    .map((m) => ({
      name:      m.name?.split(' ')[0] || 'Unknown',
      Done:      m.completedTasks || 0,
      'In Prog': m.inProgressTasks || 0,
      Todo:      m.todoTasks || 0,
    }));

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
          <p className="text-slate-500 mt-1">
            {activeTeam ? `Insights for ${activeTeam.name}` : "Team performance and AI efficiency insights."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchAnalytics}>Retry</Button>
        </div>
      )}

      {!activeTeam && !isLoading && (
        <Card className="p-10 text-center">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No team selected</h3>
          <p className="text-slate-500">Select a team to view analytics.</p>
        </Card>
      )}

      {activeTeam && (
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Completion Rate */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                {!isLoading && <StatBadge trend={completionRate} />}
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
                  <p className="text-sm text-slate-500 mt-1">Completion Rate</p>
                  <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </>
              )}
            </Card>

            {/* Total Tasks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">{completion?.totalTasks ?? 0}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Tasks</p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">{completion?.completedTasks ?? 0} completed</p>
                </>
              )}
            </Card>

            {/* Velocity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-36" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">{velocity?.velocityLast7Days ?? 0}</p>
                  <p className="text-sm text-slate-500 mt-1">Tasks Done (Last 7 Days)</p>
                  <p className="text-xs text-violet-600 mt-1 font-medium">Sprint velocity</p>
                </>
              )}
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Pie */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">Task Status Distribution</h3>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : pieData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mb-2" />
                  <p className="text-sm">No tasks yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Member Distribution Bar */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" /> Member Task Distribution
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : barData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-8 h-8 mb-2" />
                  <p className="text-sm">No member data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Bar dataKey="Done"      fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="In Prog"  fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Todo"     fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Member Stats Table */}
          {!isLoading && memberStats.length > 0 && (
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" /> Team Member Performance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Member</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">Total</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">Done</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">In Progress</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">To Do</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">AI Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((m, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(m.name || String(i))}&backgroundColor=b6e3f4`}
                              className="w-7 h-7 rounded-full border border-slate-100"
                              alt={m.name || 'Member'}
                            />
                            <div>
                              <p className="font-medium text-slate-800">{m.name || 'Unassigned'}</p>
                              {m.email && <p className="text-xs text-slate-400">{m.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-slate-700">{m.totalTasks}</td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-emerald-600">{m.completedTasks}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-blue-600">{m.inProgressTasks}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-slate-500">{m.todoTasks}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-violet-600 font-semibold">
                            {m.avgConfidence !== null && m.avgConfidence !== undefined
                              ? `${Math.round((m.avgConfidence || 0) * 100)}%`
                              : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Analytics;
