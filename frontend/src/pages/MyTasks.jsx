import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import TaskCard from '../components/features/tasks/TaskCard';
import Input from '../components/common/Input';
import { Search, Filter, Share2, Plus } from 'lucide-react';
import Button from '../components/common/Button';

const MyTasks = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    const tasks = [
        { id: 1, title: 'Design System Implementation', status: 'In Progress', priority: 'High', confidence: 92, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vartul' },
        { id: 2, title: 'API Authentication Flow', status: 'Todo', priority: 'Medium', confidence: 85, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
        { id: 3, title: 'Database Schema Migration', status: 'Done', priority: 'High', confidence: 98, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
        { id: 4, title: 'Frontend Unit Tests', status: 'Todo', priority: 'Low', confidence: 70, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: 5, title: 'User Profile Settings', status: 'In Progress', priority: 'Medium', confidence: 88, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vartul' },
        { id: 6, title: 'Jira Integration Setup', status: 'Todo', priority: 'High', confidence: 65, assignee: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    ];

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
        return matchesStatus && matchesPriority;
    });

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
                    <p className="text-slate-500 mt-1">Manage and track your assigned work.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="md"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                    <Button><Plus className="w-4 h-4 mr-2" /> New Task</Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-full md:w-1/3">
                    <Input icon={Search} placeholder="Search tasks..." />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>

                    <select
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <Button variant="secondary" className="px-3"><Filter className="w-4 h-4" /></Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} {...task} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                        <p>No tasks found matching your filters.</p>
                        <Button variant="ghost" className="mt-2" onClick={() => { setStatusFilter('All'); setPriorityFilter('All') }}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyTasks;
