import React, { useState } from 'react';
import { Sparkles, Calendar, Edit3, Trash2, History } from 'lucide-react';

const PRIORITY_CONFIG = {
    High:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', border: '#fecaca' },
    Medium: { bg: '#fef9ee', color: '#92400e', dot: '#f59e0b', border: '#fde68a' },
    Low:    { bg: '#f0fdf4', color: '#166534', dot: '#22c55e', border: '#bbf7d0' },
};

const STATUS_CONFIG = {
    'Todo':        { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
    'In Progress': { bg: '#eef2ff', color: '#4338ca', dot: '#6366f1' },
    'Done':        { bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
    'Blocked':     { bg: '#fff1f2', color: '#9f1239', dot: '#f43f5e' },
};

const ACCENT_BY_STATUS = {
    'Todo':        '#94a3b8',
    'In Progress': '#6366f1',
    'Done':        '#10b981',
    'Blocked':     '#f43f5e',
};

const TaskCard = ({ title, description, status, priority, confidence, dueDate, assignee, onEdit, onDelete, onViewHistory }) => {
    const [hovered, setHovered] = useState(false);

    const priorityCfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
    const statusCfg   = STATUS_CONFIG[status]     || STATUS_CONFIG['Todo'];
    const accentColor = ACCENT_BY_STATUS[status]  || '#94a3b8';

    // Assignee avatar: if it's a URL use img, else show initials
    const isUrl = typeof assignee === 'string' && (assignee.startsWith('http') || assignee.startsWith('/'));
    const initials = typeof assignee === 'string' && !isUrl
        ? assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    // Confidence formatting: backend sends 0-1 float OR 0-100 int
    // Only show if meaningfully set (> 0), ignore null/undefined/0
    const rawPct = confidence != null
        ? confidence <= 1 ? confidence * 100 : confidence
        : 0;
    const confidencePct = rawPct > 0 ? Math.round(rawPct) : null;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '14px 14px 12px 16px',
                cursor: 'grab',
                transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
                boxShadow: hovered
                    ? `0 8px 28px -6px ${accentColor}25, 0 2px 8px -2px rgba(0,0,0,0.07)`
                    : '0 1px 3px rgba(0,0,0,0.05)',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                border: `1.5px solid ${hovered ? accentColor + '40' : '#f1f5f9'}`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Left accent bar */}
            <div style={{
                position: 'absolute', left: 0, top: '10px', bottom: '10px',
                width: '3px', borderRadius: '0 3px 3px 0',
                background: accentColor,
                opacity: hovered ? 0.9 : 0.45,
                transition: 'opacity 0.18s ease',
            }} />

            {/* Title row + action buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{
                    fontSize: '13.5px', fontWeight: 700, color: '#0f172a',
                    lineHeight: '1.35', margin: 0, flex: 1,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                    {title}
                </h3>

                {/* Action buttons — visible on hover */}
                <div style={{
                    display: 'flex', gap: '3px', flexShrink: 0,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                }}>
                    {onEdit && (
                        <button
                            onClick={e => { e.stopPropagation(); onEdit(); }}
                            title="Edit task"
                            style={actionBtnStyle('#f1f5f9', '#475569')}
                        >
                            <Edit3 size={11} />
                        </button>
                    )}
                    {onViewHistory && (
                        <button
                            onClick={e => { e.stopPropagation(); onViewHistory(); }}
                            title="View history"
                            style={actionBtnStyle('#eef2ff', '#6366f1')}
                        >
                            <History size={11} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={e => { e.stopPropagation(); onDelete(); }}
                            title="Delete task"
                            style={actionBtnStyle('#fff0f2', '#f43f5e')}
                        >
                            <Trash2 size={11} />
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            {description && (
                <p style={{
                    fontSize: '12px', color: '#94a3b8', lineHeight: '1.5',
                    margin: '0 0 10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                    {description}
                </p>
            )}

            {/* Meta: due date + confidence */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                        <Calendar size={10} strokeWidth={2.5} /> {dueDate}
                    </span>
                )}
                {confidencePct != null && (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600,
                        color: accentColor,
                        background: `${accentColor}12`,
                        padding: '2px 7px', borderRadius: '6px',
                    }}>
                        <Sparkles size={10} strokeWidth={2.5} /> {confidencePct}% Confidence
                    </span>
                )}
            </div>

            {/* Footer: priority badge + status chip + assignee */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '8px', borderTop: '1px solid #f8fafc',
            }}>
                {/* Priority */}
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 8px', borderRadius: '7px',
                    fontSize: '11px', fontWeight: 700,
                    background: priorityCfg.bg, color: priorityCfg.color,
                    border: `1px solid ${priorityCfg.border}`,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityCfg.dot, display: 'inline-block' }} />
                    {priority}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Status chip */}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 7px', borderRadius: '6px',
                        fontSize: '10.5px', fontWeight: 700,
                        background: statusCfg.bg, color: statusCfg.color,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.dot, display: 'inline-block' }} />
                        {status}
                    </span>

                    {/* Assignee avatar */}
                    {isUrl ? (
                        <img
                            src={assignee}
                            alt="Assignee"
                            style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${accentColor}40`, objectFit: 'cover' }}
                        />
                    ) : assignee ? (
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 800, color: '#fff',
                            border: `2px solid white`,
                            boxShadow: `0 1px 4px ${accentColor}40`,
                            flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// ─── Tiny helper for action button styles ─────────────────────────────────────
const actionBtnStyle = (bg, color) => ({
    width: 24, height: 24, borderRadius: 7,
    border: 'none', background: bg, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color, flexShrink: 0,
    transition: 'opacity 0.12s',
});

export default TaskCard;