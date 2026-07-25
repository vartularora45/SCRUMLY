import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import {
    Mail, ArrowRight, RefreshCw, CheckCircle,
    Users, Plus, Trash2, Edit2, UserPlus, UserMinus,
    ChevronRight, X, Loader2, AlertCircle, Check,
    Search, Crown, Shield, Trello
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';


// ─── Create / Edit Project Modal ──────────────────────────────────────────────
const ProjectModal = ({ team, onClose, onSaved }) => {
    const isEdit = Boolean(team);
    const [name, setName]           = useState(team?.name || '');
    const [desc, setDesc]           = useState(team?.description || '');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [jiraStatus, setJiraStatus] = useState(null); // null | 'creating' | 'created' | 'skipped'
    const [jiraConnected, setJiraConnected] = useState(false);

        // Check if Jira is connected
    useEffect(() => {
        if (!isEdit) {
            api.get('/jira/status').then(r => {
                setJiraConnected(r.data.connected);
            }).catch(() => {});
        }
    }, [isEdit]);

    const handleSubmit = async () => {
        if (!name.trim()) return setError('Project name is required');
        setLoading(true); setError('');

        // If Jira is connected, show the sync progress indicator
        if (!isEdit && jiraConnected) setJiraStatus('creating');

        try {
            let res;
            if (isEdit) {
                res = await api.put(`/teams/${team._id}`, { name: name.trim(), description: desc.trim() });
            } else {
                res = await api.post('/teams', { name: name.trim(), description: desc.trim() });
            }

            if (!isEdit && jiraConnected) {
                // Backend is auto-creating the Jira project — show success after 2s
                setTimeout(() => setJiraStatus('created'), 2000);
                setTimeout(() => {
                    onSaved(res.data.team || res.data, isEdit);
                    onClose();
                }, 3000);
            } else {
                if (!isEdit) setJiraStatus('skipped');
                onSaved(res.data.team || res.data, isEdit);
                onClose();
            }
        } catch (e) {
            setJiraStatus(null);
            setError(e.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Project' : 'Create New Project'}</h3>
                            <p className="text-xs text-slate-400">{isEdit ? 'Update project details' : 'Set up your project workspace'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Jira auto-sync indicator — only shown in create mode */}
                {!isEdit && jiraConnected && (
                    <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all
                        ${jiraStatus === 'created'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : jiraStatus === 'creating'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {jiraStatus === 'creating' ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        ) : jiraStatus === 'created' ? (
                            <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                        ) : (
                            <Trello className="w-4 h-4 shrink-0 text-indigo-400" />
                        )}
                        <span>
                            {jiraStatus === 'creating'
                                ? 'Creating Jira project…'
                                : jiraStatus === 'created'
                                ? 'Jira project created! ✓'
                                : 'A Jira project will be auto-created'}
                        </span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Project Name *</label>
                        <input
                            autoFocus
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder-slate-400"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="e.g. Auth Service"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description <span className="normal-case font-normal">(optional)</span></label>
                        <textarea
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none h-24 placeholder-slate-400"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="What does this project aim to build?"
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || jiraStatus === 'creating' || jiraStatus === 'created'}
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Avatar = ({ seed }) => (
  <img
    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`}
    alt={seed}
    className="w-9 h-9 rounded-full border-2 border-white shadow-sm shrink-0"
  />
);

const MembersModal = ({ team, api, onClose, onTeamUpdated }) => {
  const [email, setEmail]             = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [removing, setRemoving]       = useState(null);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const members = team?.members || [];

  const handleAddMember = async () => {
    if (!email.trim()) return setError('Enter the email address');
    if (!/\\S+@\\S+\\.\\S+/.test(email)) return setError('Enter a valid email address');
    setSendLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.post(`/teams/${team._id}/members`, { email: email.trim() });
      setEmail('');
      setSuccess('Member added successfully! 🎉');
      onTeamUpdated(res.data.team || res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add member');
    } finally { setSendLoading(false); }
  };

  const handleRemove = async (uid) => {
    setRemoving(uid); setError(''); setSuccess('');
    try {
      const res = await api.delete(`/teams/${team._id}/members/${uid}`);
      onTeamUpdated(res.data.team || res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove member');
    } finally { setRemoving(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-500" /></div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">Manage Members</h3>
              <p className="text-xs text-slate-400 mt-0.5">{team?.name} · {members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5"><UserPlus className="w-3.5 h-3.5 text-indigo-400" /><p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Add Member</p></div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">Enter their email to add them directly to the project.</p>
            <div className="flex gap-2">
              <input className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleAddMember()} placeholder="colleague@company.com" type="email" disabled={sendLoading} />
              <button onClick={handleAddMember} disabled={sendLoading || !email.trim()} className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 shrink-0">
                {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{sendLoading ? 'Adding…' : 'Add Member'}
              </button>
            </div>
            {error   && <p className="flex items-center gap-1.5 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100 mt-3"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
            {success && <p className="flex items-center gap-1.5 text-emerald-600 text-xs bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 mt-3"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}</p>}
          </div>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-100" /><span className="text-xs text-slate-300 font-medium">Members</span><div className="flex-1 h-px bg-slate-100" /></div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
            {members.length === 0 ? (
              <div className="text-center py-8"><Users className="w-8 h-8 text-slate-200 mx-auto mb-2" /><p className="text-slate-400 text-sm">No members yet</p></div>
            ) : members.map((m) => {
              const uid = m.user?._id || m._id || m;
              const name = m.user?.name || m.name || 'Unknown';
              const email = m.user?.email || m.email || '';
              const isOwner = team.owner?._id?.toString() === uid?.toString() || team.owner?.toString() === uid?.toString();
              return (
                <div key={uid} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors group">
                  <Avatar seed={name} />
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-700 truncate leading-tight">{name}</p><p className="text-xs text-slate-400 truncate">{email}</p></div>
                  {isOwner ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0"><Crown className="w-3 h-3" /> Owner</span>
                  ) : (
                    <button onClick={() => handleRemove(uid)} disabled={removing === uid} className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100 shrink-0" title="Remove member">
                      {removing === uid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end px-6 pb-5"><button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Done</button></div>
      </div>
    </div>
  );
};

const ProjectCard = ({ team, onEdit, onDelete, onManageMembers, onSelect, isActive }) => {
    const members = team.members || [];
    return (
        <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4 cursor-pointer group
            ${isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`} onClick={onSelect}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold
                        ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors'}`}>
                        {team.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{team.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit}          className="p-1.5 text-slate-400 hover:text-blue-500  hover:bg-blue-50  rounded-lg transition-colors" title="Edit"><Edit2  className="w-3.5 h-3.5" /></button>
                    <button onClick={onManageMembers} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Members"><Users className="w-3.5 h-3.5" /></button>
                    <button onClick={onDelete}        className="p-1.5 text-slate-400 hover:text-red-500   hover:bg-red-50   rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            {team.description && <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{team.description}</p>}
            <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {members.slice(0, 5).map((m, i) => <Avatar key={m._id || i} seed={m.name || i} size={7} />)}
                    {members.length > 5 && <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-semibold">+{members.length - 5}</div>}
                    {members.length === 0 && <span className="text-xs text-slate-400 italic">No members yet</span>}
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`}>
                    Open <ChevronRight className="w-3.5 h-3.5" />
                </span>
            </div>
        </div>
    );
};

const ProjectsPage = () => {
    const { activeTeam, setActiveTeam } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [projects,    setProjects]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');
    const [search,      setSearch]      = useState('');
    const [createModal, setCreateModal] = useState(false);
    const [editTarget,  setEditTarget]  = useState(null);
    const [membTarget,  setMembTarget]  = useState(null);

    const showToast = (msg, type = 'success') => {
        if (type === 'success') toast.success(msg);
        else if (type === 'error') toast.error(msg);
        else toast.info(msg);
    };

    const fetchProjects = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await api.get('/teams');
            setProjects(Array.isArray(res.data) ? res.data : res.data.teams || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load projects');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleSaved = (saved, isEdit) => {
        if (isEdit) { setProjects(t => t.map(x => x._id === saved._id ? saved : x)); showToast('Project updated successfully!'); }
        else { setProjects(t => [saved, ...t]); showToast('Project created! Jira project also being set up...'); }
    };

    const handleDelete = async (team) => {
        if (!window.confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
        setProjects(t => t.filter(x => x._id !== team._id));
        if (activeTeam?._id === team._id) setActiveTeam(null);
        try { await api.delete(`/teams/${team._id}`); showToast('Project deleted.'); }
        catch (e) { fetchProjects(); showToast(e.response?.data?.message || 'Failed to delete project', 'error'); }
    };

    const handleTeamUpdated = (updated) => {
        setProjects(t => t.map(x => x._id === updated._id ? updated : x));
        if (membTarget) setMembTarget(updated);
    };

    const filtered = projects.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));
    const totalMembers = projects.reduce((acc, t) => acc + (t.members?.length || 0), 0);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Projects</h2>
                    <p className="text-slate-500 mt-1">Create and manage your project workspaces.</p>
                </div>
                <Button onClick={() => setCreateModal(true)}><Plus className="w-4 h-4 mr-2" /> New Project</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                {[
                    { label: 'Total Projects', value: projects.length,         icon: Users,  color: 'blue'   },
                    { label: 'Total Members',  value: totalMembers,             icon: Shield, color: 'indigo' },
                    { label: 'Active Project', value: activeTeam?.name || '—', icon: Crown,  color: 'amber', truncate: true },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center shrink-0`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`font-bold text-slate-800 text-lg leading-tight ${stat.truncate ? 'truncate' : ''}`}>{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input className="flex-1 text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-24 gap-3 text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading projects…</div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <p className="text-red-500 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>
                        <Button variant="secondary" onClick={fetchProjects}>Retry</Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-medium text-slate-600 mb-1">{search ? 'No projects match your search' : "You don't have any projects yet"}</p>
                        <p className="text-sm text-slate-400 mb-4">{search ? 'Try a different keyword' : 'Create your first project to start collaborating'}</p>
                        {!search && <Button onClick={() => setCreateModal(true)}><Plus className="w-4 h-4 mr-2" /> Create Project</Button>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(project => (
                            <ProjectCard key={project._id} team={project} isActive={activeTeam?._id === project._id}
                                onSelect={() => { setActiveTeam(project); navigate('/team'); }}
                                onEdit={() => setEditTarget(project)} onDelete={() => handleDelete(project)} onManageMembers={() => setMembTarget(project)} />
                        ))}
                    </div>
                )}
            </div>

            {createModal && <ProjectModal onClose={() => setCreateModal(false)} onSaved={handleSaved} />}
            {editTarget  && <ProjectModal team={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
            {membTarget  && <MembersModal team={membTarget} api={api} onClose={() => setMembTarget(null)} onTeamUpdated={handleTeamUpdated} />}
        </Layout>
    );
};

export default ProjectsPage;