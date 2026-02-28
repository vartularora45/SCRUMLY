import React from 'react';
import Card from '../../common/Card';
import { clsx } from 'clsx';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <Card className="p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={clsx('p-3 rounded-xl', colorStyles[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={clsx(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </Card>
    );
};

export default StatsCard;
