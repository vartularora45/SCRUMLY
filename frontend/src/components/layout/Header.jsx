import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, X, CheckCircle2, MessageSquare, Zap, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_META = {
  '/':             { title: 'Dashboard',        sub: 'Engineering Intelligence'        },
  '/tasks':        { title: 'My Tasks',         sub: 'Manage your assigned work'       },
  '/team':         { title: 'Team Board',       sub: 'Chat, collaborate & ship faster' },
  '/teams':        { title: 'Projects',         sub: 'Manage teams and members'        },
  '/analytics':    { title: 'Analytics',        sub: 'Velocity & performance insights'  },
  '/jira':         { title: 'Jira Integration', sub: 'Connect your Jira workspace'     },
  '/integrations': { title: 'Integrations',     sub: 'Connect external services'       },
  '/settings':     { title: 'Settings',         sub: 'Account & preferences'           },
  '/modules':      { title: 'Modules',          sub: 'Sprint modules and releases'     },
};

const NOTIF_ICONS = {
  task:    { Icon: CheckCircle2, color: '#6366f1', bg: '#eef2ff' },
  mention: { Icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb' },
  jira:    { Icon: Zap,          color: '#3b82f6', bg: '#eff6ff' },
  system:  { Icon: AlertCircle,  color: '#94a3b8', bg: '#f8fafc' },
};

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'task',    text: 'AI created 3 tasks from your chat',     time: '2m ago',  read: false },
  { id: 2, type: 'mention', text: 'You were mentioned in Team Board',      time: '18m ago', read: false },
  { id: 3, type: 'jira',   text: 'Jira sync completed: 5 tasks updated',  time: '1h ago',  read: true  },
  { id: 4, type: 'system', text: 'Sprint #4 ends in 2 days',               time: '3h ago',  read: true  },
];

export default function Header({ setMobileMenuOpen }) {
  const { pathname } = useLocation();
  const { activeTeam, user } = useAuth();
  const meta = PAGE_META[pathname] || { title: 'Scrumlyn', sub: '' };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifs,     setNotifs]     = useState(DEMO_NOTIFICATIONS);
  const notifRef  = useRef(null);
  const searchRef = useRef(null);

  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  return (
    <header className="header-glass h-14 flex items-center px-6 sticky top-0 z-10">

      {/* Left: Hamburger menu + breadcrumb / page title */}
      <div className="flex-1 flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div>
          <h1 className="text-[15px] font-bold text-slate-900 leading-tight">{meta.title}</h1>
          {meta.sub && (
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{meta.sub}</p>
          )}
        </div>
        {activeTeam?.name && (
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {activeTeam.name}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">

        {/* Search */}
        <div className={`relative transition-all duration-250 ${searchOpen ? 'w-56' : 'w-8'}`}>
          {searchOpen ? (
            <div
              className="flex items-center rounded-xl px-3 gap-2 h-8"
              style={{ background: 'white', border: '1.5px solid #e0e7ff', boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' }}
            >
              <Search className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search tasks, teams…"
                className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchVal(''); }}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); if (!notifOpen) markAllRead(); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            aria-label={`${unread} unread notifications`}
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 top-10 w-80 bg-white rounded-2xl overflow-hidden z-50 animate-scale-in"
              style={{ border: '1px solid #e8ecf0', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                  {unread > 0 && (
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {notifs.map(n => {
                  const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.system;
                  const IconComp = cfg.Icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 transition-colors cursor-default
                        ${!n.read ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                      style={{ borderBottom: '1px solid #f8fafc' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: cfg.bg }}
                      >
                        <IconComp className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {n.text}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid #f1f5f9' }}>
                <Link
                  to="/settings"
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
                  onClick={() => setNotifOpen(false)}
                >
                  <SettingsIcon className="w-3 h-3" />
                  Notification settings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link to="/settings" className="ml-1">
          <div
            className="w-8 h-8 rounded-full overflow-hidden transition-all hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1"
            style={{ border: '2px solid #e0e7ff' }}
          >
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}&backgroundColor=b6e3f4`}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
