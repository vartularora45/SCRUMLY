import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart2,
    Trello,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
        { path: '/teams', icon: Users, label: 'NEW PROJECT'},
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/jira', icon: Trello, label: 'Jira Integration' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];
    const logouthandler = ()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return (
        <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10 transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md cursor-pointer hover:scale-105 transition-transform">
                        S
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Scrumly</span>
                </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 transition-colors" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden relative border-2 border-white shadow-sm">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vartul" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">Vartul Arora</p>
                        <p className="text-xs text-slate-500 truncate">vartul@scrumly.app</p>
                    </div>
                    <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors cursor-pointer" onClick={logouthandler} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
