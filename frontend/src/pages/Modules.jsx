import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { Skeleton } from '../components/common/Skeleton';
import { Package, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client.js';

const Modules = () => {
  const { token, activeTeam } = useAuth();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchModules = useCallback(async () => {
    if (!activeTeam?._id) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/modules/${activeTeam._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(data.data);
    } catch (e) {
      setError('Failed to load modules.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, token]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const getStatusColor = (status) => {
    if (status === 'HEALTHY') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'AT_RISK') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <Layout>
      <div className="mb-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Project Modules <Package className="w-6 h-6 text-indigo-500" />
        </h2>
        <p className="text-slate-500 mt-1">Track the health and completion of individual components.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))
        ) : modules.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Modules Yet</h3>
            <p className="text-slate-500">Create modules to group related tasks.</p>
          </div>
        ) : (
          modules.map(mod => (
            <div key={mod._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{mod.name}</h3>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(mod.status)}`}>
                  {mod.status}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{mod.description || 'No description provided.'}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Completion</span>
                  <span>{Math.round(mod.completionPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${mod.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Open Bugs</p>
                  <p className="text-lg font-extrabold text-slate-800 tabular">{mod.openBugs}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Tasks</p>
                  <p className="text-lg font-extrabold text-slate-800 tabular">{mod.pendingTasks}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Modules;
