import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart2,
    Trello,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {

    const { user } = useAuth();
    const [openModal, setOpenModal] = useState(false);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
        { path: '/teams', icon: Users, label: 'NEW PROJECT' },
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/jira', icon: Trello, label: 'Jira Integration' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const logoutHandler = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10">

                {/* Logo */}
                <div className="p-6 border-b border-slate-100 flex justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="text-xl font-bold text-blue-700">
                            Scrumly
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button in Sidebar */}
                <div className="px-4">
                    <button
                        onClick={logoutHandler}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>

                {/* Profile Section */}
                <div className="p-4 border-t border-slate-100">
                    <div
                        onClick={() => setOpenModal(true)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                                alt="User"
                                className="w-full h-full"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

                    <div className="bg-white w-96 rounded-2xl shadow-xl p-6 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setOpenModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                        >
                            <X />
                        </button>

                        {/* Profile Info Only */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                                    alt="User"
                                />
                            </div>

                            <h2 className="text-lg font-bold">{user?.name}</h2>
                            <p className="text-sm text-slate-500">{user?.email}</p>

                            <p className="text-xs text-slate-400 mt-2">
                                User ID: {user?.id}
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;