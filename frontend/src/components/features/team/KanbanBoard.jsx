import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TaskCard from '../tasks/TaskCard';
import { Plus, X, Loader2, AlertCircle, History } from 'lucide-react';
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

// ─── Column config — colId matches backend status values (uppercase) ───────────
//     Backend uses: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED"
const COLUMNS = [
    { title: 'TO DO',       colId: 'TODO',        statusLabel: 'Todo',        badgeVariant: 'secondary' },
    { title: 'IN PROGRESS', colId: 'IN_PROGRESS', statusLabel: 'In Progress', badgeVariant: 'primary'   },
    { title: 'DONE',        colId: 'DONE',        statusLabel: 'Done',        badgeVariant: 'success'   },
    { title: 'BLOCKED',     colId: 'BLOCKED',     statusLabel: 'Blocked',     badgeVariant: 'danger'    },
];

// ─── Add Task Modal ────────────────────────────────────────────────────────────
// Sends: title, description, teamId, assignee, priority, status, confidence
// (aiGenerated & sourceMessage are AI-only fields, not in manual form)
const AddTaskModal = ({ columnStatus, teamId, onClose, onCreated }) => {
    const [form, setForm]       = useState({
        title:       '',
        description: '',
        priority:    'Medium',   // backend accepts: High | Medium | Low
        status:      columnStatus, // backend value e.g. "TODO"
        assignee:    '',
        confidence:  '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError('Title is required');
        setLoading(true);
        setError('');
        try {
            // Send only fields the backend createTask controller uses
            const payload = {
                title:       form.title.trim(),
                description: form.description.trim(),
                teamId,
                priority:    form.priority,
                status:      form.status,
                ...(form.assignee   && { assignee:   form.assignee }),
                ...(form.confidence && { confidence: Number(form.confidence) }),
            };
            const res = await api.post('/tasks', payload);
            onCreated(res.data); // controller returns task directly (no wrapper)
            onClose();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">Add New Task</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
                        <input
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Task title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                        <textarea
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none h-20"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    {/* Priority + Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 transition-colors"
                                value={form.priority}
                                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                            >
                                {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 transition-colors"
                                value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            >
                                {COLUMNS.map(c => <option key={c.colId} value={c.colId}>{c.title}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Confidence (optional) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confidence % <span className="normal-case font-normal">(optional)</span></label>
                        <input
                            type="number"
                            min="0" max="100"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 transition-colors"
                            value={form.confidence}
                            onChange={e => setForm(p => ({ ...p, confidence: e.target.value }))}
                            placeholder="e.g. 85"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Creating…' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Edit Task Modal ───────────────────────────────────────────────────────────
// PUT /api/tasks/:id  → backend only updates: title, description, assignee, priority
// Status is NOT updated here — it goes via PATCH /status
const EditTaskModal = ({ task, onClose, onUpdated }) => {
    const [form, setForm]       = useState({
        title:       task.title       || '',
        description: task.description || '',
        priority:    task.priority    || 'Medium',
        assignee:    task.assignee?._id || task.assignee || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError('Title is required');
        setLoading(true);
        setError('');
        try {
            // Only send fields updateTask controller accepts
            const payload = {
                title:       form.title.trim(),
                description: form.description.trim(),
                priority:    form.priority,
                ...(form.assignee && { assignee: form.assignee }),
            };
            const res = await api.put(`/tasks/${task._id}`, payload);
            onUpdated(res.data); // controller returns task directly
            onClose();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">Edit Task</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
                        <input
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                        <textarea
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none h-20"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                        <select
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 transition-colors"
                            value={form.priority}
                            onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                        >
                            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Note: status is not editable here — use drag & drop */}
                    <p className="text-xs text-slate-400 italic">💡 Status change karne ke liye card ko drag karo</p>

                    {error && (
                        <p className="text-red-500 text-sm flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── History Modal ─────────────────────────────────────────────────────────────
// GET /api/tasks/:id/history  → returns task.statusHistory array directly
// Each item: { status, changedAt, _id }  (no from/to/changedBy in backend)
const HistoryModal = ({ taskId, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/tasks/${taskId}/history`)
            .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
            .catch(() => setHistory([]))
            .finally(() => setLoading(false));
    }, [taskId]);

    // Map colId back to human-readable label
    const labelFor = (status) => COLUMNS.find(c => c.colId === status)?.title || status;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-bold text-slate-800">Status History</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-12">No history found.</p>
                ) : (
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                        {/* Show newest first */}
                        {[...history].reverse().map((h, i) => (
                            <div key={h._id || i} className="flex gap-3 py-3 border-b border-slate-100 last:border-0 items-start">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-700 font-medium">
                                        Moved to{' '}
                                        <span className="text-indigo-600 font-semibold">{labelFor(h.status)}</span>
                                    </p>
                                    {h.changedAt && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {new Date(h.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-5">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

// ─── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ col, tasks, onAddTask, onDrop, onEdit, onDelete, onViewHistory }) => {
    const [over, setOver] = useState(false);

    return (
        <div
            className="flex-1 min-w-[300px] flex flex-col h-full"
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); onDrop(e.dataTransfer.getData('taskId'), col.colId); }}
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="font-semibold text-slate-700">{col.title}</h4>
                <Badge variant={col.badgeVariant}>{tasks.length}</Badge>
            </div>

            <div className={`bg-slate-100/50 rounded-xl p-3 flex-1 overflow-y-auto custom-scrollbar border transition-all duration-200 ${over ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100'}`}>
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div
                            key={task._id}
                            className="cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={e => e.dataTransfer.setData('taskId', task._id)}
                        >
                            <TaskCard
                                {...task}
                                status={col.statusLabel}
                                // assignee is populated object {name, email} from backend
                                assignee={task.assignee?.name || task.assignee}
                                onEdit={() => onEdit(task)}
                                onDelete={() => onDelete(task._id)}
                                onViewHistory={() => onViewHistory(task._id)}
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => onAddTask(col.colId)}
                    className="w-full mt-3 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>
        </div>
    );
};

// ─── Main KanbanBoard ──────────────────────────────────────────────────────────
const KanbanBoard = () => {
    const { activeTeam } = useAuth();
    const teamId = activeTeam?._id;

    const [tasks,      setTasks]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [addModal,   setAddModal]   = useState(null);  // colId string e.g. "TODO"
    const [editModal,  setEditModal]  = useState(null);  // full task object
    const [histModal,  setHistModal]  = useState(null);  // task._id string

    // ── 1. GET /tasks/:teamId  →  returns array directly (no wrapper) ────────
    const fetchTasks = useCallback(async () => {
        if (!teamId) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/tasks/${teamId}`);
            // Backend returns array directly: res.data is Task[]
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // ── 2. PATCH /tasks/:id/status  →  { status }  (drag & drop) ────────────
    const handleDrop = async (taskId, newStatus) => {
        const prev = tasks;
        // Optimistic update
        setTasks(t => t.map(x => x._id === taskId ? { ...x, status: newStatus } : x));
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        } catch {
            setTasks(prev); // rollback
        }
    };

    // ── 3. POST /tasks  →  returns created task directly ────────────────────
    const handleCreated = (newTask) => setTasks(t => [newTask, ...t]);

    // ── 4. PUT /tasks/:id  →  returns updated task directly ─────────────────
    const handleUpdated = (updated) => setTasks(t => t.map(x => x._id === updated._id ? updated : x));

    // ── 5. DELETE /tasks/:id  →  soft delete (isArchived = true) ────────────
    const handleDelete = async (taskId) => {
        if (!window.confirm('Archive this task?')) return;
        setTasks(t => t.filter(x => x._id !== taskId)); // optimistic remove
        try {
            await api.delete(`/tasks/${taskId}`);
        } catch {
            fetchTasks(); // re-sync on failure
        }
    };

    // ── Group tasks by status (matches backend uppercase values) ─────────────
    const tasksFor = (colId) => tasks.filter(t => t.status === colId);

    // ── Render ────────────────────────────────────────────────────────────────
    if (!teamId) return (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            No team selected.
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-48 gap-3 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> Loading tasks…
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-red-500 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {error}
            </p>
            <button onClick={fetchTasks} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors">
                Retry
            </button>
        </div>
    );

    return (
        <>
            <div className="flex gap-4 overflow-x-auto h-[calc(100vh-8rem)] pb-2 snap-x snap-mandatory">
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

            {/* Modals */}
            {addModal  && <AddTaskModal  columnStatus={addModal}  teamId={teamId} onClose={() => setAddModal(null)}  onCreated={handleCreated} />}
            {editModal && <EditTaskModal task={editModal}                          onClose={() => setEditModal(null)} onUpdated={handleUpdated} />}
            {histModal && <HistoryModal  taskId={histModal}                        onClose={() => setHistModal(null)} />}
        </>
    );
};

export default KanbanBoard;