import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Trello, Link2, CheckCircle2, RefreshCw, XCircle, Layout as LayoutIcon, AlertCircle, ExternalLink, Settings, ShieldAlert, Zap } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL;
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const JiraIntegration = () => {
    const [status, setStatus]                         = useState(null);
    const [isSyncing, setIsSyncing]                   = useState(false);
    const [isDisconnecting, setIsDisconnecting]       = useState(false);
    const [error, setError]                           = useState('');
    const [hasClickedCreate, setHasClickedCreate]     = useState(false);
    const [showSuccess, setShowSuccess]               = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('jira') === 'success') {
            setShowSuccess(true);
            window.history.replaceState({}, '', '/integrations');
        }
        if (params.get('jira') === 'error') {
            // Check for specific Atlassian error types if possible, or just show a detailed generic one
            setError('Jira connection failed. You likely need to configure permissions in the Atlassian Developer Console.');
            window.history.replaceState({}, '', '/integrations');
        }
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(`${API}/jira/status`, getAuthHeader());
            setStatus(data);
        } catch (err) {
            setStatus({ connected: false });
        }
    };

    const handleConnect = () => {
        const token = localStorage.getItem('token');
        window.location.href = `${API}/jira/connect?token=${token}`;
    };

    const handleCreateAccount = () => {
        setHasClickedCreate(true);
        window.open('https://www.atlassian.com/software/jira', '_blank');
    };

    const handleSync = async () => {
        setIsSyncing(true); setError('');
        try {
            await axios.post(`${API}/jira/sync-projects`, {}, getAuthHeader());
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.message || 'Sync failed.');
        } finally { setIsSyncing(false); }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect Jira?')) return;
        setIsDisconnecting(true);
        try {
            await axios.delete(`${API}/jira/disconnect`, getAuthHeader());
            setStatus({ connected: false });
        } catch (err) {
            setError(err.response?.data?.message || 'Disconnect failed.');
        } finally { setIsDisconnecting(false); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : 'Never';

    // ── Success Screen ────────────────────────────────────────────────────────
    if (showSuccess) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Jira Connected Successfully! 🎉
                        </h2>
                        <p className="text-slate-500 mb-2">
                            Your Jira workspace has been linked to Scrumlyn.
                        </p>
                        <p className="text-slate-400 text-sm mb-8">
                            Projects have been synced and are ready to use.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button size="lg" onClick={() => setShowSuccess(false)}>
                                <Trello className="w-5 h-5 mr-2" /> View Integration
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Main Page ─────────────────────────────────────────────────────────────
    return (
        <Layout>
            <div className="mb-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-slate-800">Jira Integration</h2>
                <p className="text-slate-500 mt-1">Connect your Jira workspace to sync tasks and automate workflows.</p>
            </div>

            {error && (
                <div className="mb-8 animate-slide-up">
                    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-red-100/50 flex items-start gap-3 border-b border-red-200">
                            <ShieldAlert className="w-6 h-6 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-800 text-lg">Connection Failed (Access Denied)</h3>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-white space-y-4">
                            <h4 className="font-bold text-slate-800">How to fix "Access Denied" or permission errors:</h4>
                            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                                <li>Ensure you actually have a <strong>Jira Cloud Site</strong> (you must have a url like <code>your-name.atlassian.net</code>).</li>
                                <li>Go to the <a href="https://developer.atlassian.com/console/myapps/" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">Atlassian Developer Console</a>.</li>
                                <li>Click on your app (Client ID: <code>{import.meta.env.VITE_JIRA_CLIENT_ID || 'Check your .env'}</code>).</li>
                                <li>Go to the <strong>Permissions</strong> tab.</li>
                                <li>You MUST add <strong>both</strong> of these APIs by clicking "Add":
                                    <ul className="list-disc pl-5 mt-1 text-slate-500 font-mono text-xs">
                                        <li>Jira API (Scopes: read:jira-work, write:jira-work, etc.)</li>
                                        <li>User Identity API (Scopes: read:me) <span className="font-bold text-red-500">← This is usually the missing one!</span></li>
                                    </ul>
                                </li>
                                <li>Go to the <strong>Authorization</strong> tab and ensure the Callback URL is exactly: <code className="bg-slate-100 px-1 py-0.5 rounded">{(import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/jira/callback</code></li>
                                <li>Save changes and try connecting again below.</li>
                            </ol>
                            <div className="pt-2">
                                <Button onClick={() => setError('')} variant="outline" size="sm">Dismiss Error</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="md:col-span-2 space-y-6">

                    {/* Loading */}
                    {status === null && (
                        <Card className="p-12 text-center glass-card">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                            <p className="text-slate-500 mt-4 font-medium">Checking connection state...</p>
                        </Card>
                    )}

                    {/* Not Connected */}
                    {status !== null && !status.connected && (
                        <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-300 shadow-none hover:border-indigo-300 transition-colors bg-white">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
                                <Trello className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Connect your Jira Workspace</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                                Sync your operational tasks, enable two-way status updates, and let Scrumlyn AI analyze your Jira backlog.
                            </p>

                            <div className="w-full max-w-xs mb-4 relative group">
                                <Button size="lg" onClick={handleConnect}
                                    className="w-full transition-all bg-[#0052CC] hover:bg-[#0047b3] text-white">
                                    <Link2 className="w-5 h-5 mr-2" /> Connect Jira Account
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 w-full max-w-xs my-3">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Create account */}
                            <button onClick={handleCreateAccount}
                                className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all shadow-sm border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                                <Trello className="w-5 h-5 text-slate-400" />
                                Create Free Jira Account <ExternalLink className="w-4 h-4 text-slate-400" />
                            </button>

                            <p className="text-xs font-medium text-slate-400 mt-5">
                                Free forever · No credit card required · Setup in 2 minutes
                            </p>
                        </Card>
                    )}

                    {/* Connected */}
                    {status !== null && status.connected && (
                        <>
                            <Card className="p-6 relative overflow-hidden bg-white border border-indigo-100 shadow-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 relative z-10 gap-4">
                                    <div className="flex items-center gap-4">
                                        {status.jiraAvatarUrl ? (
                                            <img src={status.jiraAvatarUrl} alt="avatar" className="w-14 h-14 rounded-2xl object-cover ring-4 ring-indigo-50" />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-[#0052CC] to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <Trello className="w-7 h-7" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{status.jiraEmail}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                                                <a href={status.jiraSiteUrl} target="_blank" rel="noreferrer"
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                                                    {status.jiraSiteUrl?.replace('https://', '')}
                                                </a>
                                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={handleDisconnect} isLoading={isDisconnecting}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 shadow-sm w-full sm:w-auto">
                                        <XCircle className="w-4 h-4 mr-1" /> Disconnect
                                    </Button>
                                </div>

                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-6 relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                    <div className="flex-1">
                                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Connected At</span>
                                        <span className="text-sm font-medium text-slate-800">{formatDate(status.connectedAt)}</span>
                                    </div>
                                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                                    <div className="flex-1">
                                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Synced</span>
                                        <span className="text-sm font-medium text-slate-800">{formatDate(status.lastSyncedAt)}</span>
                                    </div>
                                </div>

                                <Button onClick={handleSync} isLoading={isSyncing} className="w-full relative z-10 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                    Sync Projects Now
                                </Button>
                            </Card>

                            {/* Projects List */}
                            {status.projects?.length > 0 && (
                                <Card className="p-6 bg-white border border-slate-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="font-bold text-slate-800 text-lg">Jira Projects</h4>
                                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {status.projects.length} Total
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {status.projects.map((project) => (
                                            <div key={project.id}
                                                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group cursor-pointer">
                                                {project.avatarUrl ? (
                                                    <img src={project.avatarUrl} alt={project.name} className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-200 transition-all" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-[#0052CC]/10 rounded-lg flex items-center justify-center border border-[#0052CC]/20">
                                                        <Trello className="w-5 h-5 text-[#0052CC]" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{project.name}</p>
                                                    <p className="text-xs font-medium text-slate-500">{project.key}</p>
                                                </div>
                                                <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                                    {project.key}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-500" /> Integration Benefits
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Two-way Sync', desc: 'Updates in Scrumlyn reflect in Jira instantly.', icon: RefreshCw },
                                { title: 'AI Analysis', desc: 'Let AI categorize and prioritize your Jira backlog.', icon: LayoutIcon },
                                { title: 'Smart Status', desc: 'Auto-update statuses based on team velocity.', icon: CheckCircle2 }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <item.icon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default JiraIntegration;