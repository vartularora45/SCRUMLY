import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, HelpCircle } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Dashboard';
            case '/tasks': return 'My Tasks';
            case '/team': return 'Team Board';
            case '/analytics': return 'Analytics';
            case '/jira': return 'Jira Integration';
            case '/settings': return 'Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-200">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-800">{getPageTitle(location.pathname)}</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-64 transition-all"
                    />
                </div>

                <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors">
                    <HelpCircle className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
