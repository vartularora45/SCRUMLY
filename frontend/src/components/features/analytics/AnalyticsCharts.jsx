import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Card from '../../common/Card';

const dataWeekly = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 7 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 9 },
    { name: 'Fri', completed: 12 },
    { name: 'Sat', completed: 3 },
    { name: 'Sun', completed: 2 },
];

const dataStatus = [
    { name: 'Todo', value: 8, color: '#94a3b8' },
    { name: 'In Progress', value: 4, color: '#3b82f6' },
    { name: 'Done', value: 12, color: '#22c55e' },
    { name: 'Blocked', value: 2, color: '#ef4444' },
];

const dataAi = [
    { name: 'Manual', value: 35, color: '#3b82f6' },
    { name: 'AI Generated', value: 65, color: '#a855f7' },
];

const AnalyticsCharts = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Tasks Completed (Weekly)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataWeekly}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Task Status Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-sm text-slate-500 mt-2">
                            {dataStatus.map((item) => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">AI vs Manual Tasks</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataAi} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} width={100} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {dataAi.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 flex flex-col justify-center items-center text-center">
                        <h4 className="text-slate-500 font-medium mb-1">Productivity Score</h4>
                        <p className="text-4xl font-bold text-blue-600">92%</p>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2">+5% vs last week</span>
                    </Card>
                    <Card className="p-6 flex flex-col justify-center items-center text-center">
                        <h4 className="text-slate-500 font-medium mb-1">Avg Completion Time</h4>
                        <p className="text-4xl font-bold text-slate-800">1.2d</p>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2">-0.3d vs last week</span>
                    </Card>
                    <Card className="p-6 flex flex-col justify-center items-center text-center col-span-2">
                        <h4 className="text-slate-500 font-medium mb-1">AI Accuracy %</h4>
                        <p className="text-4xl font-bold text-purple-600">98.5%</p>
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full mt-2">Consistent performance</span>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
