import React from 'react';
import Card from '../../common/Card';
import { clsx } from 'clsx';
import { TrendingUp } from 'lucide-react';

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',   border: 'border-blue-100' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600',border: 'border-emerald-100' },
  purple: { bg: 'bg-violet-50',  icon: 'text-violet-600', border: 'border-violet-100' },
  orange: { bg: 'bg-amber-50',   icon: 'text-amber-600',  border: 'border-amber-100' },
  indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600', border: 'border-indigo-100' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-600',    border: 'border-red-100' },
};

const StatsCard = ({ title, value, icon: Icon, trend = null, color = 'blue', subtitle }) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <Card className={`p-6 hover:shadow-md transition-all duration-200 hover:border-slate-200 ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} />
        </div>
        {trend !== null && trend !== undefined && (
          <span className={clsx(
            'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
            <TrendingUp className="w-3 h-3" />
            {trend > 0 ? `+${trend}` : trend}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  );
};

export default StatsCard;
