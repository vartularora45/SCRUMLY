import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TaskCard from '../tasks/TaskCard';
import { Plus, X, Loader2, AlertCircle, History, Sparkles } from 'lucide-react';
import Badge from '../../common/Badge';
import { useAuth } from '../../../context/AuthContext.jsx';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Column Config ─────────────────────────────────────────────────────────────
const COLUMNS = [
    {
        title: 'To Do',
        colId: 'TODO',
        statusLabel: 'Todo',
        badgeVariant: 'secondary',
        accent: '#94a3b8',
        bg: 'from-slate-50 to-slate-100/60',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        countBg: 'bg-slate-200 text-slate-600',
    },
    {
        title: 'In Progress',
        colId: 'IN_PROGRESS',
        statusLabel: 'In Progress',
        badgeVariant: 'primary',
        accent: '#6366f1',
        bg: 'from-indigo-50/70 to-violet-50/40',
        border: 'border-indigo-200',
        dot: 'bg-indigo-400',
        countBg: 'bg-indigo-100 text-indigo-600',
    },
    {
        title: 'Done',
        colId: 'DONE',
        statusLabel: 'Done',
        badgeVariant: 'success',
        accent: '#10b981',
        bg: 'from-emerald-50/70 to-teal-50/40',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
        countBg: 'bg-emerald-100 text-emerald-600',
    },
    {
        title: 'Blocked',
        colId: 'BLOCKED',
        statusLabel: 'Blocked',
        badgeVariant: 'danger',
        accent: '#f43f5e',
        bg: 'from-rose-50/70 to-pink-50/40',
        border: 'border-rose-200',
        dot: 'bg-rose-400',
        countBg: 'bg-rose-100 text-rose-600',
    },
];

// ─── Shared Modal Wrapper ──────────────────────────────────────────────────────
const Modal = ({ onClose, children }) => (
    
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
    >
        <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: '0 32px 64px -12px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

const ModalHeader = ({ title, icon, onClose }) => (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
            {icon && <span className="text-indigo-500">{icon}</span>}
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
            <X className="w-4 h-4" />
        </button>
    </div>
);

const FormField = ({ label, optional, children }) => (
    <div>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            {label}
            {optional && <span className="normal-case font-normal text-slate-400">(optional)</span>}
        </label>
        {children}
    </div>
);

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50/80 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300";

// ─── Add Task Modal ────────────────────────────────────────────────────────────
const AddTaskModal = ({ columnStatus, teamId, onClose, onCreated }) => {
    const [form, setForm] = useState({
        title: '', description: '', priority: 'Medium',
        status: columnStatus, assignee: '', confidence: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError('Title is required');
        setLoading(true); setError('');
        try {
            const payload = {
                title: form.title.trim(), description: form.description.trim(),
                teamId, priority: form.priority, status: form.status,
                ...(form.assignee && { assignee: form.assignee }),
                ...(form.confidence && { confidence: Number(form.confidence) }),
            };
            const res = await api.post('/tasks', payload);
            onCreated(res.data); onClose();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create task');
        } finally { setLoading(false); }
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader title="New Task" icon={<Plus className="w-4 h-4" />} onClose={onClose} />
            <div className="px-6 py-5 space-y-4">
                <FormField label="Title">
                    <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" />
                </FormField>
                <FormField label="Description">
                    <textarea className={`${inputCls} resize-none h-20`} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add more details..." />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Priority">
                        <select className={inputCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Status">
                        <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            {COLUMNS.map(c => <option key={c.colId} value={c.colId}>{c.title}</option>)}
                        </select>
                    </FormField>
                </div>
                <FormField label="Confidence %" optional>
                    <input type="number" min="0" max="100" className={inputCls} value={form.confidence} onChange={e => setForm(p => ({ ...p, confidence: e.target.value }))} placeholder="e.g. 85" />
                </FormField>
                {error && <p className="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
            </div>
            <div className="flex gap-2.5 px-6 pb-6 justify-end">
                <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Task</>}
                </button>
            </div>
        </Modal>
    );
};

// ─── Edit Task Modal ───────────────────────────────────────────────────────────
const EditTaskModal = ({ task, onClose, onUpdated }) => {
    const [form, setForm] = useState({
        title: task.title || '', description: task.description || '',
        priority: task.priority || 'Medium',
        assignee: task.assignee?._id || task.assignee || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError('Title is required');
        setLoading(true); setError('');
        try {
            const payload = {
                title: form.title.trim(), description: form.description.trim(),
                priority: form.priority,
                ...(form.assignee && { assignee: form.assignee }),
            };
            const res = await api.put(`/tasks/${task._id}`, payload);
            onUpdated(res.data); onClose();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to update task');
        } finally { setLoading(false); }
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader title="Edit Task" onClose={onClose} />
            <div className="px-6 py-5 space-y-4">
                <FormField label="Title">
                    <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </FormField>
                <FormField label="Description">
                    <textarea className={`${inputCls} resize-none h-20`} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </FormField>
                <FormField label="Priority">
                    <select className={inputCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                        {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                    </select>
                </FormField>
                <p className="text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    💡 Status change ke liye card ko drag karke column mein drop karo
                </p>
                {error && <p className="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
            </div>
            <div className="flex gap-2.5 px-6 pb-6 justify-end">
                <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
                </button>
            </div>
        </Modal>
    );
};

// ─── History Modal ─────────────────────────────────────────────────────────────
const HistoryModal = ({ taskId, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/tasks/${taskId}/history`)
            .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
            .catch(() => setHistory([]))
            .finally(() => setLoading(false));
    }, [taskId]);

    const labelFor = (status) => COLUMNS.find(c => c.colId === status)?.title || status;
    const colFor   = (status) => COLUMNS.find(c => c.colId === status);

    return (
        <Modal onClose={onClose}>
            <ModalHeader title="Status History" icon={<History className="w-4 h-4" />} onClose={onClose} />
            <div className="px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : history.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-12">Koi history nahi mili.</p>
                ) : (
                    <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1">
                        {[...history].reverse().map((h, i) => {
                            const col = colFor(h.status);
                            return (
                                <div key={h._id || i} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors items-start">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${col?.dot || 'bg-slate-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium">
                                            Moved to <span className="font-semibold" style={{ color: col?.accent || '#64748b' }}>{labelFor(h.status)}</span>
                                        </p>
                                        {h.changedAt && (
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(h.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="flex justify-end px-6 pb-6 pt-2">
                <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Close</button>
            </div>
        </Modal>
    );
};

// ─── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ col, tasks, onAddTask, onDrop, onEdit, onDelete, onViewHistory }) => {
    const [over, setOver] = useState(false);

    return (
        <div
            className="flex flex-col w-72 shrink-0 rounded-2xl overflow-hidden border transition-all duration-200"
            style={{
                borderColor: over ? col.accent : 'transparent',
                background: over ? `${col.accent}08` : 'transparent',
                boxShadow: over ? `0 0 0 2px ${col.accent}40` : 'none',
            }}
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); onDrop(e.dataTransfer.getData('taskId'), col.colId); }}
        >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3.5 bg-gradient-to-r ${col.bg} border-b ${col.border}`}>
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h4 className="text-sm font-bold text-slate-700 tracking-tight">{col.title}</h4>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                    {tasks.length}
                </span>
            </div>

            {/* Tasks */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b ${col.bg} min-h-[120px]`}
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
            >
                {tasks.map(task => (
                    <div
                        key={task._id}
                        className="group cursor-grab active:cursor-grabbing active:scale-[0.98] transition-transform"
                        draggable
                        onDragStart={e => e.dataTransfer.setData('taskId', task._id)}
                    >
                        <TaskCard
                            {...task}
                            status={col.statusLabel}
                            assignee={task.assignee?.name || task.assignee}
                            onEdit={() => onEdit(task)}
                            onDelete={() => onDelete(task._id)}
                            onViewHistory={() => onViewHistory(task._id)}
                        />
                    </div>
                ))}
            </div>

            {/* Add Task Button */}
            <div className={`p-3 bg-gradient-to-b ${col.bg} border-t ${col.border}`}>
                <button
                    onClick={() => onAddTask(col.colId)}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border-2 border-dashed hover:border-solid group"
                    style={{ borderColor: `${col.accent}60`, color: col.accent }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = `${col.accent}10`;
                        e.currentTarget.style.borderColor = col.accent;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = `${col.accent}60`;
                    }}
                >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
            </div>
        </div>
    );
};

// ─── Main KanbanBoard ──────────────────────────────────────────────────────────
const KanbanBoard = ({ searchQuery = '' }) => {
    const { activeTeam } = useAuth();
    const teamId = activeTeam?._id;

    const [tasks,     setTasks]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');
    const [addModal,  setAddModal]  = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [histModal, setHistModal] = useState(null);

    const fetchTasks = useCallback(async () => {
        if (!teamId) return;
        setLoading(true); setError('');
        try {
            const res = await api.get(`/tasks/${teamId}`);
            console.log('Fetched tasks:', res.data);
            
            // Deduplicate by _id in case of double fetch (React 18 Strict Mode)
            const raw = Array.isArray(res.data) ? res.data : [];
            const seen = new Set();
            setTasks(raw.filter(t => seen.has(t._id) ? false : seen.add(t._id)));
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load tasks');
        } finally { setLoading(false); }
    }, [teamId]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleDrop = async (taskId, newStatus) => {
        const prev = tasks;
        setTasks(t => t.map(x => x._id === taskId ? { ...x, status: newStatus } : x));
        try { await api.patch(`/tasks/${taskId}/status`, { status: newStatus }); }
        catch { setTasks(prev); }
    };

    const handleCreated = (newTask) => setTasks(t => {
        // Guard against duplicate if socket/refetch already added it
        if (t.some(x => x._id === newTask._id)) return t;
        return [newTask, ...t];
    });
    const handleUpdated = (updated) => setTasks(t => t.map(x => x._id === updated._id ? updated : x));

    const handleDelete = async (taskId) => {
        if (!window.confirm('Archive this task?')) return;
        setTasks(t => t.filter(x => x._id !== taskId));
        try { await api.delete(`/tasks/${taskId}`); }
        catch { fetchTasks(); }
    };

    const tasksFor = (colId) => tasks.filter(t => {
        if (t.status !== colId) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    });

    if (!teamId) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No project selected</p>
            <p className="text-xs text-slate-300">Please select a project to view the board</p>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Loading board…</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
            <button onClick={fetchTasks} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors">
                Retry
            </button>
        </div>
    );

    return (
        <>
            <div className="flex gap-4 overflow-x-auto h-[calc(100vh-8rem)] pb-4 px-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
            >
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.colId}
                        col={col}
                        tasks={tasksFor(col.colId)}
                        onDrop={handleDrop}
                        onAddTask={(colId) => setAddModal(colId)}
                        onEdit={(task) => setEditModal(task)}
                        onDelete={handleDelete}
                        onViewHistory={(id) => setHistModal(id)}
                    />
                ))}
            </div>

            {addModal  && <AddTaskModal  columnStatus={addModal}  teamId={teamId} onClose={() => setAddModal(null)}  onCreated={handleCreated} />}
            {editModal && <EditTaskModal task={editModal}                          onClose={() => setEditModal(null)} onUpdated={handleUpdated} />}
            {histModal && <HistoryModal  taskId={histModal}                        onClose={() => setHistModal(null)} />}
        </>
    );
};

export default KanbanBoard;