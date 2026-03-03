import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Trello, Link2, CheckCircle2, RefreshCw, XCircle, Layout as LayoutIcon, AlertCircle, ExternalLink } from 'lucide-react';

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
            setError('Jira connection failed. Please try again.');
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
                <div className="min-h-[70vh] flex items-center justify-center">
                    <div className="text-center max-w-md">
                        {/* Animated checkmark */}
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Jira Connected Successfully! 🎉
                        </h2>
                        <p className="text-slate-500 mb-2">
                            Your Jira workspace has been linked to Scrumly.
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
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="md:col-span-2 space-y-6">

                    {/* Loading */}
                    {status === null && (
                        <Card className="p-12 text-center">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                            <p className="text-slate-500 mt-4">Checking connection...</p>
                        </Card>
                    )}

                    {/* Not Connected */}
                    {status !== null && !status.connected && (
                        <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-300 shadow-none hover:border-blue-300 transition-colors">
                            <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-6">
                                <Trello className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Connect your Jira Workspace</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Sync your operational tasks, enable two-way status updates, and let AI analyze your Jira backlog.
                            </p>

                            {/* Connect — disabled until create is clicked */}
                            <div className="w-full max-w-xs mb-3 relative group">
                                <Button size="lg" onClick={handleConnect} disabled={!hasClickedCreate}
                                    className={`w-full transition-all ${!hasClickedCreate ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Link2 className="w-5 h-5 mr-2" /> Connect Jira Account
                                </Button>
                                {!hasClickedCreate && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        First create a Jira account below
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full max-w-xs my-2">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs text-slate-400">don't have an account?</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Create account */}
                            <button onClick={handleCreateAccount}
                                className={`w-full max-w-xs flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all
                                    ${hasClickedCreate
                                        ? 'border-green-400 bg-green-50 text-green-700'
                                        : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}>
                                <Trello className={`w-5 h-5 ${hasClickedCreate ? 'text-green-600' : 'text-blue-600'}`} />
                                {hasClickedCreate ? (
                                    <><CheckCircle2 className="w-4 h-4 text-green-600" /> Account Created? Now Connect Above!</>
                                ) : (
                                    <>Create Free Jira Account <ExternalLink className="w-4 h-4 text-slate-400" /></>
                                )}
                            </button>

                            <p className="text-xs text-slate-400 mt-4">
                                Free forever · No credit card required · Setup in 2 minutes
                            </p>
                        </Card>
                    )}

                    {/* Connected */}
                    {status !== null && status.connected && (
                        <>
                            <Card className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        {status.jiraAvatarUrl ? (
                                            <img src={status.jiraAvatarUrl} alt="avatar" className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-[#0052CC] rounded-xl flex items-center justify-center text-white">
                                                <Trello className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{status.jiraEmail}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Link2 className="w-3 h-3 text-slate-400" />
                                                <a href={status.jiraSiteUrl} target="_blank" rel="noreferrer"
                                                    className="text-sm text-blue-500 hover:underline">
                                                    {status.jiraSiteUrl?.replace('https://', '')}
                                                </a>
                                                <Badge variant="success" className="ml-2">Connected</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={handleDisconnect} isLoading={isDisconnecting}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                        <XCircle className="w-4 h-4 mr-1" /> Disconnect
                                    </Button>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Connected At</span>
                                        <span className="text-sm text-slate-500">{formatDate(status.connectedAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">Last Synced</span>
                                        <span className="text-sm text-slate-500">{formatDate(status.lastSyncedAt)}</span>
                                    </div>
                                </div>

                                <Button onClick={handleSync} isLoading={isSyncing} className="w-full">
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                    Sync Projects
                                </Button>
                            </Card>

                            {/* Projects List */}
                            {status.projects?.length > 0 && (
                                <Card className="p-6">
                                    <h4 className="font-bold text-slate-800 mb-4">Jira Projects ({status.projects.length})</h4>
                                    <div className="space-y-3">
                                        {status.projects.map((project) => (
                                            <div key={project.id}
                                                className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                                {project.avatarUrl ? (
                                                    <img src={project.avatarUrl} alt={project.name} className="w-9 h-9 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Trello className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-800">{project.name}</p>
                                                    <p className="text-xs text-slate-400">{project.key}</p>
                                                </div>
                                                <Badge variant="secondary">{project.key}</Badge>
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
                    <h3 className="text-lg font-bold text-slate-800">Integration Benefits</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Two-way Sync', desc: 'Updates in Scrumly reflect in Jira instantly.', icon: RefreshCw },
                            { title: 'AI Analysis', desc: 'Let AI categorize and prioritize your Jira backlog.', icon: LayoutIcon },
                            { title: 'Smart Status', desc: 'Auto-update statuses based on Git activity.', icon: CheckCircle2 }
                        ].map((item, i) => (
                            <Card key={i} className="p-4 flex gap-4 border-slate-200">
                                <div className="mt-1 text-blue-600"><item.icon className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default JiraIntegration;