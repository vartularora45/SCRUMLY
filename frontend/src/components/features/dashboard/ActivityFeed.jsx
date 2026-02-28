import React from 'react';
import { CheckCircle2, MessageSquare, Plus, Sparkles } from 'lucide-react';

const ActivityItem = ({ type, user, content, time }) => {
    const getIcon = () => {
        switch (type) {
            case 'complete': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'comment': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'create': return <Plus className="w-5 h-5 text-orange-500" />;
            case 'ai': return <Sparkles className="w-5 h-5 text-purple-500" />;
            default: return <div className="w-2 h-2 rounded-full bg-slate-300" />;
        }
    };

    return (
        <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    {getIcon()}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">
                        <span className="font-bold">{user}</span> {type === 'ai' ? 'generated' : type === 'complete' ? 'completed' : type === 'create' ? 'created' : 'commented on'} <span className="text-slate-600 font-normal">{content}</span>
                    </p>
                    <span className="text-xs text-slate-400">{time}</span>
                </div>
                {type === 'ai' && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Suggestion
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Break down "Homepage Redesign" into 3 subtasks?</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ActivityFeed = () => {
    const activities = [
        { id: 1, type: 'complete', user: 'Vartul Arora', content: 'Database Schema Design', time: '2m ago' },
        { id: 2, type: 'ai', user: 'Scrumly AI', content: 'suggestions for "Homepage Redesign"', time: '15m ago' },
        { id: 3, type: 'comment', user: 'Sarah Smith', content: 'API Documentation task', time: '1h ago' },
        { id: 4, type: 'create', user: 'Mike Jones', content: 'User Authentication Flow', time: '2h ago' },
    ];

    return (
        <div className="space-y-1">
            {activities.map(activity => (
                <ActivityItem key={activity.id} {...activity} />
            ))}
        </div>
    );
};

export default ActivityFeed;
