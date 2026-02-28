import React from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/features/dashboard/StatsCard';
import ActivityFeed from '../components/features/dashboard/ActivityFeed';
import Card from '../components/common/Card';
import { LayoutList, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const Dashboard = () => {
    return (
        <Layout>
            <div className="mb-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-slate-800">Welcome back, Vartul 👋</h2>
                <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <StatsCard
                    title="Total Tasks"
                    value="24"
                    icon={LayoutList}
                    trend={12}
                    color="blue"
                />
                <StatsCard
                    title="Completed"
                    value="18"
                    icon={CheckCircle2}
                    trend={8}
                    color="green"
                />
                <StatsCard
                    title="In Progress"
                    value="4"
                    icon={Clock}
                    trend={-2}
                    color="orange"
                />
                <StatsCard
                    title="AI Generated"
                    value="142"
                    icon={Sparkles}
                    trend={24}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Your Tasks</h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    {/* Simple Task List Preview */}
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4 flex items-center justify-between hover:border-blue-200 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500 transition-colors" />
                                    <div>
                                        <h4 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">Design System Updates</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Design</span>
                                            <span className="text-xs text-slate-400">• Today</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <Card className="p-2">
                        <ActivityFeed />
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
