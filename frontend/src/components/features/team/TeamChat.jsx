import React, { useState, useEffect, useRef } from 'react';
import Card from '../../common/Card';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { Send, Smile, Trash2, Sparkles, CheckCircle, XCircle, Edit3, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// ─── AI Task Confirmation Modal ───────────────────────────────────────────────
const AITaskModal = ({ aiResult, onConfirm, onReject }) => {
    const [task, setTask] = useState({
        title: aiResult?.task || aiResult?.title || '',
        status: aiResult?.status || 'TODO',
        description: aiResult?.description || '',
    });

    const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
    const statusColors = {
        TODO: 'bg-slate-100 text-slate-600',
        IN_PROGRESS: 'bg-blue-100 text-blue-600',
        DONE: 'bg-green-100 text-green-600',
        BLOCKED: 'bg-red-100 text-red-600',
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
                            Confidence: {Math.round((aiResult?.confidence || 0) * 100)}% — Review before saving
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Task Title</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={task.title}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Edit3 className="w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Status</label>
                    <div className="relative">
                        <select
                            value={task.status}
                            onChange={(e) => setTask({ ...task, status: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                        Description <span className="text-slate-300 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                        value={task.description}
                        onChange={(e) => setTask({ ...task, description: e.target.value })}
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
                        <XCircle className="w-4 h-4 text-red-400" /> Skip Task
                    </button>
                    <button
                        onClick={() => onConfirm(task)}
                        disabled={!task.title.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm text-white transition-colors font-medium shadow-lg shadow-blue-200"
                    >
                        <CheckCircle className="w-4 h-4" /> Create Task
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Chat Message ─────────────────────────────────────────────────────────────
const ChatMessage = ({ message, isMe, onDelete }) => {
    return (
        <div className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
            <div className="flex-shrink-0">
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name || message.user || 'user'}`}
                    alt={message.sender?.name || message.user}
                    className="w-8 h-8 rounded-full border border-slate-200"
                />
            </div>
            <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                    <span className="text-xs text-slate-500 mb-1 ml-1">{message.sender?.name || message.user}</span>
                )}
                <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                    {message.content || message.text}
                </div>
                {message.aiResultSnapshot && (
                    <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-50 border border-purple-100 rounded-full">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-500">AI task created</span>
                    </div>
                )}
                <div className="flex items-center gap-2 mt-1">
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
};

// ─── Main TeamChat ────────────────────────────────────────────────────────────
const TeamChat = ({ teamId }) => {
    const { token, user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [pendingAI, setPendingAI] = useState(null);
    const [onlineCount, setOnlineCount] = useState(1);
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // ── Socket.IO setup ──
    useEffect(() => {
        if (!teamId || !token) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
        });
        socketRef.current = socket;

        // Join team room
        socket.emit('join_team', teamId);

        // New message from any team member
        socket.on('new_message', (message) => {
            // ✅ Apna message skip karo — axios se already add ho chuka hai
            if (message.senderId === currentUser?._id?.toString()) return;

            setMessages((prev) => {
                const exists = prev.some(
                    (m) => (m._id || m.id)?.toString() === message._id?.toString()
                );
                if (exists) return prev;
                return [...prev, message];
            });
        });

        // Message deleted by someone
        socket.on('message_deleted', (messageId) => {
            setMessages((prev) => prev.filter((m) => (m._id || m.id)?.toString() !== messageId?.toString()));
        });

        // Online users count
        socket.on('team_online_count', (count) => {
            setOnlineCount(count);
        });

        return () => {
            socket.emit('leave_team', teamId);
            socket.disconnect();
        };
    }, [teamId, token]);

    // ── Fetch initial messages ──
    useEffect(() => {
        if (!teamId || !token) return;
        fetchMessages();
    }, [teamId, token]);

    // ── Auto scroll ──
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/messages/${teamId}`, authHeaders);
            setMessages(data.data?.messages || []);
        } catch (err) {
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
            id: tempId,
            user: currentUser?.name || 'You',
            content: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        setInputValue('');
        setIsSending(true);

        try {
            const { data } = await api.post('/messages', { content: tempMessage.content, teamId }, authHeaders);
            const newMsg = data.data?.message || data.message || data;

            // Replace temp with real — socket will broadcast to others
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempId ? { ...newMsg, isMe: true } : msg))
            );

            // AI task detected?
            if (data.data?.aiResult && data.data?.task) {
                setPendingAI({ aiResult: data.data.aiResult, task: data.data.task });
            }
        } catch (err) {
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            setError('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const handleTaskConfirm = async (editedTask) => {
        setPendingAI(null);
        try {
            // TODO: await api.post('/tasks', { ...editedTask, teamId }, authHeaders);
            console.log('✅ Task create:', editedTask);
            setMessages((prev) => [...prev, {
                id: `system-${Date.now()}`,
                content: `✅ Task created: "${editedTask.title}" [${editedTask.status}]`,
                isSystem: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        } catch (err) {
            console.error('Task create failed:', err);
        }
    };

    const handleTaskReject = () => setPendingAI(null);

    const handleDelete = async (messageId) => {
        if (!messageId || String(messageId).startsWith('temp-')) return;
        setMessages((prev) => prev.filter((msg) => (msg._id || msg.id)?.toString() !== messageId?.toString()));
        try {
            await api.delete(`/messages/${messageId}`, authHeaders);
        } catch (err) {
            fetchMessages();
        }
    };

    return (
        <>
            {pendingAI && (
                <AITaskModal
                    aiResult={pendingAI.aiResult}
                    onConfirm={handleTaskConfirm}
                    onReject={handleTaskReject}
                />
            )}

            <Card className="h-[calc(100vh-8rem)] flex flex-col bg-white border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Team Chat</h3>
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {onlineCount} Online
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {isLoading && (
                        <div className="text-center text-slate-400 text-sm py-8">Loading messages...</div>
                    )}
                    {!isLoading && messages.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-8">No messages yet. Say hello! 👋</div>
                    )}
                    {messages.map((msg) =>
                        msg.isSystem ? (
                            <div key={msg.id} className="flex justify-center">
                                <span className="px-3 py-1 bg-green-50 border border-green-100 rounded-full text-xs text-green-600">
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
                    {error && <div className="text-center text-red-400 text-xs">{error}</div>}
                    <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="pr-10"
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <Smile className="w-5 h-5" />
                            </button>
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3 rounded-lg aspect-square flex items-center justify-center"
                            isLoading={isSending}
                            disabled={!inputValue.trim() || isSending}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </>
    );
};

export default TeamChat;