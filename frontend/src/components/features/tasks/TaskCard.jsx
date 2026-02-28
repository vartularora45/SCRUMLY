import React from 'react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import { Sparkles, Calendar, Clock } from 'lucide-react';

const TaskCard = ({ title, status, priority, confidence, dueDate, assignee }) => {
    const getStatusColor = (s) => {
        switch (s.toLowerCase()) {
            case 'done': return 'success';
            case 'in progress': return 'primary';
            case 'todo': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPriorityColor = (p) => {
        switch (p.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success'; // or secondary
            default: return 'secondary';
        }
    };

    return (
        <Card className="hover:shadow-md transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-blue-500">
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors w-3/4 truncate">
                        {title}
                    </h3>
                    <Badge variant={getStatusColor(status)}>{status}</Badge>
                </div>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    Implement the new authentication flow using OAuth 2.0 ensuring security compliance.
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dueDate || 'Tomorrow'}
                    </div>
                    {confidence && (
                        <div className="flex items-center gap-1 text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" /> {confidence}% Confidence
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(priority)} className="bg-transparent border-0 px-0">{priority}</Badge>
                    </div>
                    <img src={assignee} alt="Assignee" className="w-6 h-6 rounded-full border border-white shadow-sm" />
                </div>
            </div>
        </Card>
    );
};

export default TaskCard;
