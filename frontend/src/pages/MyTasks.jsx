import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { TaskCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Plus, AlertCircle, CheckCircle2, Clock,
  Circle, XCircle, Sparkles, ArrowRight, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

const PRIORITY_COLORS = {
  High:   'bg-red-50 text-red-600 border border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border border-amber-100',
  Low:    'bg-slate-50 text-slate-500 border border-slate-100',
};

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-slate-100 text-slate-600',   icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-600',      icon: Clock },
  DONE:        { label: 'Done',        color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  BLOCKED:     { label: 'Blocked',     color: 'bg-red-50 text-red-600',        icon: XCircle },
};

const TaskItem = ({ task }) => {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const StatusIcon = status.icon;

  return (
    <Card className="p-5 hover:border-indigo-200 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {task.aiGenerated && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                <Sparkles className="w-3 h-3" />
                AI
              </span>
            )}
          </div>
          <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{task.description}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {task.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
              {task.priority}
            </span>
          )}
          {task.confidence !== undefined && task.confidence > 0 && (
            <span className="text-xs text-slate-400">{Math.round(task.confidence * 100)}% conf.</span>
          )}
        </div>
      </div>

      {task.assignee && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
          <img
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(task.assignee.name || task.assignee._id)}&backgroundColor=b6e3f4`}
            className="w-6 h-6 rounded-full border border-white shadow-sm"
            alt={task.assignee.name || 'Assignee'}
          />
          <span className="text-xs text-slate-500">{task.assignee.name || task.assignee.email}</span>
        </div>
      )}
    </Card>
  );
};

const MyTasks = () => {
  const { token, activeTeam } = useAuth();
  const toast = useToast();

  const [tasks,          setTasks]          = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchTasks = useCallback(async () => {
    if (!activeTeam?._id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const { data } = await api.get(`/tasks/${activeTeam._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tasks';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch   = !search || task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus   = statusFilter   === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const hasFilters = search || statusFilter !== 'All' || priorityFilter !== 'All';

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
          <p className="text-slate-500 mt-1">
            {activeTeam ? `Tasks for ${activeTeam.name}` : 'Manage and track your assigned work.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={fetchTasks} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/team">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create via Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* No Active Team */}
      {!activeTeam && !isLoading && (
        <Card className="p-10 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No team selected</h3>
          <p className="text-slate-500 mb-4">Select or create a team to see your tasks.</p>
          <Link to="/teams" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Go to Teams <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchTasks}>Retry</Button>
        </div>
      )}

      {activeTeam && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>

              <select
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-600"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {hasFilters && (
                <Button variant="secondary" size="sm" onClick={clearFilters} className="whitespace-nowrap">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Summary Bar */}
          {!isLoading && tasks.length > 0 && (
            <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
              <span>{filteredTasks.length} of {tasks.length} tasks</span>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = tasks.filter((t) => t.status === key).length;
                if (!count) return null;
                return (
                  <span key={key} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.label}: {count}
                  </span>
                );
              })}
            </div>
          )}

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => <TaskItem key={task._id} task={task} />)
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No tasks match your filters</p>
                <p className="text-slate-400 text-sm mt-1">
                  {tasks.length === 0
                    ? 'Start chatting in Team Board to auto-generate tasks with AI!'
                    : 'Try adjusting your search or filters'}
                </p>
                {tasks.length === 0 ? (
                  <Link to="/team" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Open Team Board <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Button variant="ghost" className="mt-3" onClick={clearFilters}>Clear Filters</Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default MyTasks;
