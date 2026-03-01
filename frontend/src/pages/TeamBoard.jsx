import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import TeamChat from '../components/features/team/TeamChat';
import KanbanBoard from '../components/features/team/KanbanBoard';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutGrid, MessageSquare, ChevronLeft, Users, Sparkles } from 'lucide-react';

const TeamBoard = () => {
    const { activeTeam } = useAuth();
    const team_id = activeTeam ? activeTeam._id : null;
    const [view, setView] = useState('chat'); // 'chat' | 'board'

    const memberCount = activeTeam?.members?.length || 0;

    return (
        <Layout>
            <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden">

                {/* ── Top bar ─────────────────────────────────────────────── */}
                <div className="shrink-0 flex items-center justify-between mb-4">

                    {/* Left: project info */}
                    <div className="flex items-center gap-3">
                        {view === 'board' && (
                            <button
                                onClick={() => setView('chat')}
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
                            >
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                Back
                            </button>
                        )}
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
                                <span className="text-white font-bold text-sm">
                                    {activeTeam?.name?.charAt(0) || 'P'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800 leading-tight">
                                    {activeTeam?.name || 'Select a Project'}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-400">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                                    {activeTeam?.settings?.autoCreateTasks && (
                                        <>
                                            <span className="text-slate-200">·</span>
                                            <Sparkles className="w-3 h-3 text-indigo-400" />
                                            <span className="text-xs text-indigo-400">AI active</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: view toggle pill */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setView('chat')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${view === 'chat'
                                    ? 'bg-white text-slate-800 shadow-sm shadow-slate-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </button>
                        <button
                            onClick={() => setView('board')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${view === 'board'
                                    ? 'bg-white text-slate-800 shadow-sm shadow-slate-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Tasks
                        </button>
                    </div>
                </div>

                {/* ── Main content — animated slide ───────────────────────── */}
                <div className="flex-1 min-h-0 relative overflow-hidden">

                    {/* Chat view */}
                    <div
                        className={`absolute inset-0 transition-all duration-300 ease-in-out
                            ${view === 'chat'
                                ? 'translate-x-0 opacity-100 pointer-events-auto'
                                : '-translate-x-8 opacity-0 pointer-events-none'
                            }`}
                    >
                        <div className="h-full max-w-2xl mx-auto flex flex-col">
                            {/* Chat container */}
                            <TeamChat teamId={team_id} />

                            {/* View Tasks CTA — pinned at bottom */}
                            <div className="shrink-0 pt-3">
                                <button
                                    onClick={() => setView('board')}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6
                                        bg-gradient-to-r from-slate-800 to-slate-900
                                        hover:from-slate-700 hover:to-slate-800
                                        text-white font-semibold text-sm rounded-2xl
                                        shadow-lg shadow-slate-900/20
                                        transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/30
                                        hover:-translate-y-0.5 active:translate-y-0 group"
                                >
                                    <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    View Tasks
                                    <span className="ml-auto flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Board
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Board view */}
                    <div
                        className={`absolute inset-0 transition-all duration-300 ease-in-out
                            ${view === 'board'
                                ? 'translate-x-0 opacity-100 pointer-events-auto'
                                : 'translate-x-8 opacity-0 pointer-events-none'
                            }`}
                    >
                        <KanbanBoard />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeamBoard;