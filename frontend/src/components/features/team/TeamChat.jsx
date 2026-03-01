import React, { useState, useEffect, useRef } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { Send, Smile, Trash2, Sparkles, CheckCircle, XCircle, Edit3, ChevronDown, FolderKanban } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// ─── AI Task Confirmation Modal ───────────────────────────────────────────────
const AITaskModal = ({ aiResult, task, onConfirm, onReject }) => {
    const [editedTask, setEditedTask] = useState({
        title:       task?.title || aiResult?.task || aiResult?.title || '',
        status:      task?.status || aiResult?.status || 'TODO',
        description: task?.description || aiResult?.description || '',
    });

    const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
    const statusColors = {
        TODO:        'bg-slate-100 text-slate-600',
        IN_PROGRESS: 'bg-blue-100 text-blue-600',
        DONE:        'bg-green-100 text-green-600',
        BLOCKED:     'bg-red-100 text-red-600',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onReject} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">AI Detected a Task</h3>
                        <p className="text-xs text-slate-400">
                            Confidence: {Math.round((aiResult?.confidence || 0) * 100)}% — Already saved, you can edit it
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Task Title</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={editedTask.title}
                            onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                            className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Edit3 className="w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Status</label>
                    <div className="relative">
                        <select
                            value={editedTask.status}
                            onChange={e => setEditedTask({ ...editedTask, status: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                            {statuses.map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[editedTask.status]}`}>
                        {editedTask.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                        Description <span className="text-slate-300 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                        value={editedTask.description}
                        onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                        placeholder="Add more context..."
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onReject}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                    >
                        <XCircle className="w-4 h-4 text-red-400" /> Dismiss
                    </button>
                    <button
                        onClick={() => onConfirm(editedTask)}
                        disabled={!editedTask.title.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm text-white transition-colors font-medium shadow-lg shadow-blue-200"
                    >
                        <CheckCircle className="w-4 h-4" /> Looks Good ✓
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Chat Message ─────────────────────────────────────────────────────────────
const ChatMessage = ({ message, isMe, onDelete }) => (
    <div className={`flex gap-2.5 group ${isMe ? 'flex-row-reverse' : ''}`}>
        <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name || message.user || 'user'}`}
            alt="avatar"
            className="w-7 h-7 rounded-full border border-slate-200 shrink-0 mt-1"
        />
        <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            {!isMe && (
                <span className="text-xs text-slate-500 mb-1 ml-1 font-medium">
                    {message.sender?.name || message.user}
                </span>
            )}
            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                {message.content || message.text}
            </div>
            {message.aiResultSnapshot && (
                <div className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-full">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-500 font-medium">AI task created</span>
                </div>
            )}
            <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-xs text-slate-400">
                    {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : message.time || ''}
                </span>
                {isMe && (
                    <button
                        onClick={() => onDelete(message._id || message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    </div>
);

// ─── Main TeamChat ────────────────────────────────────────────────────────────
const TeamChat = ({ teamId }) => {
    const { token, user: currentUser, activeTeam } = useAuth();
    const [messages,    setMessages]    = useState([]);
    const [inputValue,  setInputValue]  = useState('');
    const [isLoading,   setIsLoading]   = useState(false);
    const [isSending,   setIsSending]   = useState(false);
    const [error,       setError]       = useState('');
    const [pendingAI,   setPendingAI]   = useState(null); // { aiResult, task }
    const [onlineCount, setOnlineCount] = useState(1);
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // ── Socket.IO ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!teamId || !token) return;

        if (socketRef.current) socketRef.current.disconnect();

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
        });
        socketRef.current = socket;

        socket.emit('join_team', teamId);

        socket.on('new_message', (message) => {
            // Skip messages from self — sender already handled via HTTP response
            if (message.author?._id === currentUser?._id?.toString()) return;
            if (message.author === currentUser?._id?.toString()) return;

            setMessages(prev => {
                const exists = prev.some(m => (m._id || m.id)?.toString() === message._id?.toString());
                if (exists) return prev;
                return [...prev, message];
            });

            // ✅ Socket se sirf OTHER users ke AI tasks add karo
            // Apna task HTTP response se already add ho chuka hai
        });

        socket.on('message_deleted', (messageId) => {
            setMessages(prev => prev.filter(m => (m._id || m.id)?.toString() !== messageId?.toString()));
        });

        socket.on('team_online_count', (count) => setOnlineCount(count));

        return () => {
            socket.emit('leave_team', teamId);
            socket.disconnect();
        };
    }, [teamId, token]);

    // ── Fetch messages ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!teamId || !token) return;
        setMessages([]);
        fetchMessages();
    }, [teamId, token]);

    // ── Auto scroll ──────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/messages/${teamId}`, authHeaders);
            setMessages(data.data?.messages || []);
        } catch {
            setError('Failed to load messages.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id:      tempId,
            user:    currentUser?.name || 'You',
            content: inputValue,
            time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe:    true,
        };

        setMessages(prev => [...prev, tempMessage]);
        setInputValue('');
        setIsSending(true);

        try {
            const { data } = await api.post('/messages', { content: tempMessage.content, teamId }, authHeaders);
            const newMsg = data.data?.message || data.message || data;

            // Replace temp message with real one
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...newMsg, isMe: true } : msg
            ));

            // ✅ Backend ne task already banaya — sirf review modal dikhao
            // handleTaskConfirm mein DOBARA POST /tasks NAHI karenge
            if (data.data?.aiResult && data.data?.task) {
                setPendingAI({
                    aiResult: data.data.aiResult,
                    task:     data.data.task, // already created task
                });
            }
        } catch {
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setError('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    // ✅ FIX: Sirf system message dikhao — NO api.post('/tasks') here
    // Backend ne task already bana diya tha createMessage mein
    const handleTaskConfirm = (editedTask) => {
        setPendingAI(null);
        // Just show a confirmation message in chat
        setMessages(prev => [...prev, {
            id:       `system-${Date.now()}`,
            content:  `✅ Task saved: "${editedTask.title}" [${editedTask.status.replace('_', ' ')}]`,
            isSystem: true,
            time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
    };

    const handleTaskReject = () => {
        setPendingAI(null);
    };

    const handleDelete = async (messageId) => {
        if (!messageId || String(messageId).startsWith('temp-')) return;
        setMessages(prev => prev.filter(msg => (msg._id || msg.id)?.toString() !== messageId?.toString()));
        try {
            await api.delete(`/messages/${messageId}`, authHeaders);
        } catch {
            fetchMessages();
        }
    };

    return (
        <>
            {pendingAI && (
                <AITaskModal
                    aiResult={pendingAI.aiResult}
                    task={pendingAI.task}
                    onConfirm={handleTaskConfirm}
                    onReject={handleTaskReject}
                />
            )}

            <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="shrink-0 px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight">Project Chat</h3>
                            <p className="text-xs text-slate-400 leading-tight truncate max-w-[140px]">
                                {activeTeam?.name || 'Select a project'}
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {onlineCount} Online
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar min-h-0">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    )}
                    {!isLoading && !teamId && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <FolderKanban className="w-8 h-8 text-slate-200" />
                            <p className="text-slate-400 text-sm text-center">Select a project to see its chat</p>
                        </div>
                    )}
                    {!isLoading && teamId && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <span className="text-2xl">👋</span>
                            <p className="text-slate-400 text-sm">No messages yet. Say hello!</p>
                        </div>
                    )}
                    {messages.map(msg =>
                        msg.isSystem ? (
                            <div key={msg.id} className="flex justify-center">
                                <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs text-emerald-600 font-medium">
                                    {msg.content}
                                </span>
                            </div>
                        ) : (
                            <ChatMessage
                                key={msg._id || msg.id}
                                message={msg}
                                isMe={msg.isMe || msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id}
                                onDelete={handleDelete}
                            />
                        )
                    )}
                    {error && (
                        <div className="text-center text-red-400 text-xs bg-red-50 rounded-lg py-2">{error}</div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 px-3 py-3 border-t border-slate-100 bg-slate-50/80">
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input
                                className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                disabled={!teamId}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Smile className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isSending || !teamId}
                            className="w-10 h-10 shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                        >
                            {isSending
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send className="w-4 h-4" />
                            }
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default TeamChat;