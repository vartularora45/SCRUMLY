import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Users, BarChart2,
  Trello, Settings, LogOut, Zap, X,
  ChevronRight, ArrowLeftRight, Box, ChevronLeft, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

const NAV = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard',  end: true  },
  { path: '/tasks',     icon: CheckSquare,     label: 'My Tasks'              },
  { path: '/team',      icon: Users,           label: 'Team Board'            },
  { path: '/analytics', icon: BarChart2,       label: 'Analytics'             },
  { path: '/modules',   icon: Box,             label: 'Modules'               },
  { path: '/jira',      icon: Trello,          label: 'Jira'                  },
  { path: '/settings',  icon: Settings,        label: 'Settings'              },
];

export default function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout, teams, activeTeam, switchTeam } = useAuth();
  const navigate    = useNavigate();
  const toast       = useToast();
  const [teamOpen,    setTeamOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);


  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('You have been signed out.');
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {/* ── Mobile Overlay ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden animate-fade-in" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* ── Sidebar Shell ────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col z-40 sidebar-shell transition-all duration-300 scrollbar-dark
          w-64 ${collapsed ? 'md:w-[68px]' : 'md:w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >

        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white leading-tight truncate">Scrumlyn</p>
                <p className="text-[10px] text-indigo-400 leading-tight font-medium">AI Scrum Board</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.40)', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center bg-indigo-500 shadow-lg shadow-indigo-500/40 border-2 border-[#111827] transition-all hover:bg-indigo-600 z-10"
            >
              <ChevronRight className="w-3 h-3 text-white" />
            </button>
          )}
        </div>

        {/* Team Switcher */}
        {teams.length > 0 && !collapsed && (
          <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => setTeamOpen(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all group"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.20)' }}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {initials(activeTeam?.name || 'T')}
              </div>
              <span className="flex-1 text-left text-xs font-semibold text-indigo-300 truncate">
                {activeTeam?.name || 'Select Team'}
              </span>
              <ChevronDown className={`w-3 h-3 text-indigo-400 flex-shrink-0 transition-transform duration-200 ${teamOpen ? 'rotate-180' : ''}`} />
            </button>

            {teamOpen && (
              <div
                className="mt-2 rounded-xl overflow-hidden animate-scale-in"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.95)' }}
              >
                {teams.map(team => {
                  const active = (activeTeam?._id || activeTeam) === (team._id || team);
                  return (
                    <button
                      key={team._id || team}
                      onClick={() => { switchTeam(team); setTeamOpen(false); toast.info(`Switched to ${team.name}`); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors"
                      style={{
                        background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: active ? '#a5b4fc' : 'rgba(255,255,255,0.60)',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${active ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}`}>
                        {initials(team.name || 'T')}
                      </div>
                      <span className="truncate flex-1 text-left font-medium">{team.name || team}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-dark">
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Navigation
            </p>
          )}
          {NAV.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive ? 'nav-active' : 'nav-inactive'}
                ${collapsed ? 'md:justify-center' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`flex-shrink-0 transition-all ${collapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-indigo-400' : ''}`} />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '8px' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50
              ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'rgba(248,113,113,0.80)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = 'rgb(248,113,113)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.80)'; }}
          >
            <LogOut className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'} ${loggingOut ? 'animate-spin' : ''}`} />
            {!collapsed && (loggingOut ? 'Signing out…' : 'Sign Out')}
          </button>
        </div>

        {/* Profile */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setProfileOpen(true)}
            title={collapsed ? (user?.name || 'Profile') : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
              ${collapsed ? 'justify-center' : ''}`}
            style={{ background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(99,102,241,0.40)', boxShadow: '0 0 0 2px rgba(99,102,241,0.15)' }}>
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}&backgroundColor=b6e3f4`}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[11px] truncate leading-tight" style={{ color: 'rgba(255,255,255,0.40)' }}>{user?.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Profile Modal ──────────────────────────────────────── */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden animate-scale-in"
            style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.30)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <button
                onClick={() => setProfileOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>

            {/* Avatar + info */}
            <div className="flex flex-col items-center -mt-12 pb-6 px-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3" style={{ border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}&backgroundColor=b6e3f4`}
                  alt={user?.name}
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{user?.name}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="mt-2 text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 capitalize">
                {user?.provider || 'local'} account
              </span>

              <div className="w-full mt-5 grid grid-cols-2 gap-2">
                <NavLink
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <Settings className="w-4 h-4" /> Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}