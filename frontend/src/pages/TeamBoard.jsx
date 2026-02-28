import React from 'react';
import Layout from '../components/layout/Layout';
import TeamChat from '../components/features/team/TeamChat';
import KanbanBoard from '../components/features/team/KanbanBoard';
import { useAuth } from '../context/AuthContext.jsx';

const TeamBoard = () => {
        const { activeTeam } = useAuth();
        console.log('Active Team:', activeTeam);
        const team_id = activeTeam ? activeTeam._id : null;
        console.log('Team ID:', team_id);
    return (
        <Layout>
            <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-slide-up">
                {/* Left Sidebar - Chat */}
                <div className="w-full md:w-1/3 lg:w-1/4 min-w-[300px] flex flex-col">
                    <TeamChat teamId={team_id} />
                </div>

                {/* Right Content - Kanban */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="mb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Team Board</h2>
                            <p className="text-slate-500">Track project progress in real-time.</p>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="Member" />
                            ))}
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-medium">+3</div>
                        </div>
                    </div>
                    <KanbanBoard />
                </div>
            </div>
        </Layout>
    );
};

export default TeamBoard;
