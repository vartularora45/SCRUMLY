import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Trello, Link2, CheckCircle2, RefreshCw, XCircle, Layout as LayoutIcon } from 'lucide-react';

const JiraIntegration = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleConnect = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsSyncing(false);
        }, 1500);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
        }, 2000);
    };

    return (
        <Layout>
            <div className="mb-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-slate-800">Jira Integration</h2>
                <p className="text-slate-500 mt-1">Connect your Jira workspace to sync tasks and automate workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="md:col-span-2 space-y-6">
                    {!isConnected ? (
                        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-300 shadow-none hover:border-blue-300 transition-colors">
                            <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-6">
                                <Trello className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Connect your Jira Workspace</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Sync your operational tasks, enable two-way status updates, and let AI analyze your Jira backlog.
                            </p>
                            <Button size="lg" onClick={handleConnect} isLoading={isSyncing}>
                                <Link2 className="w-5 h-5 mr-2" /> Connect Jira
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#0052CC] rounded-xl flex items-center justify-center text-white">
                                        <Trello className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Scrumly Jira Workspace</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Link2 className="w-3 h-3 text-slate-400" />
                                            <span className="text-sm text-slate-500">scrumly.atlassian.net</span>
                                            <Badge variant="success" className="ml-2">Connected</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={handleDisconnect} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                    Disconnect
                                </Button>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Last Synced</span>
                                    <span className="text-sm text-slate-500">Just now</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Tasks Imported</span>
                                    <span className="text-sm text-slate-500">142 tickets</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button onClick={handleSync} isLoading={isSyncing} className="flex-1">
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Now
                                </Button>
                                <Button variant="secondary" className="flex-1">
                                    Configure Mapping
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">Integration Benefits</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Two-way Sync', desc: 'Updates in Scrumly reflect in Jira instantly.', icon: RefreshCw },
                            { title: 'AI Analysis', desc: 'Let AI categorize and prioritize your Jira backlog.', icon: LayoutIcon },
                            { title: 'Smart Status', desc: 'Auto-update statuses based on Git activity.', icon: CheckCircle2 }
                        ].map((item, i) => (
                            <Card key={i} className="p-4 flex gap-4 border-slate-200">
                                <div className="mt-1 text-blue-600">
                                    <item.icon className="w-5 h-5" />
                                </div>
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
