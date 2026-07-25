import React, { useState } from 'react';
import { Sparkles, Calendar, Edit3, Trash2, History, User } from 'lucide-react';

const PRIORITY = {
  High:   { pill: 'bg-red-50 text-red-700 border border-red-200',    dot: 'bg-red-500',    bar: 'bg-red-400' },
  Medium: { pill: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400',  bar: 'bg-amber-400' },
  Low:    { pill: 'bg-slate-50 text-slate-500 border border-slate-200', dot: 'bg-slate-400',  bar: 'bg-slate-400' },
};

const STATUS = {
  'Todo':        { pill: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400',  accent: '#94a3b8' },
  'In Progress': { pill: 'bg-indigo-50 text-indigo-700',  dot: 'bg-indigo-400', accent: '#6366f1' },
  'Done':        { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400', accent: '#10b981' },
  'Blocked':     { pill: 'bg-red-50 text-red-700',        dot: 'bg-red-400',    accent: '#f43f5e' },
};

const TaskCard = ({ title, description, status, priority, confidence, dueDate, assignee, onEdit, onDelete, onViewHistory }) => {
  const [hovered, setHovered] = useState(false);

  const pCfg  = PRIORITY[priority] || PRIORITY.Medium;
  const sCfg  = STATUS[status]     || STATUS['Todo'];

  // Assignee: URL → <img>, string → initials badge, null → nothing
  const isUrl    = typeof assignee === 'string' && (assignee.startsWith('http') || assignee.startsWith('/'));
  const initials = typeof assignee === 'string' && !isUrl
    ? assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  // Confidence: backend sends 0–1 or 0–100
  const rawPct       = confidence != null ? (confidence <= 1 ? confidence * 100 : confidence) : 0;
  const confidencePct = rawPct > 0 ? Math.round(rawPct) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white rounded-[14px] overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        padding: '12px 12px 10px 14px',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
        boxShadow: hovered
          ? `0 8px 24px -4px ${sCfg.accent}22, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        border: `1.5px solid ${hovered ? sCfg.accent + '35' : '#f1f5f9'}`,
      }}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full ${pCfg.bar} transition-opacity`}
        style={{ opacity: hovered ? 0.85 : 0.40 }}
      />

      {/* Title row + hover actions */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3
          className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 flex-1 min-w-0"
          title={title}
        >
          {title}
        </h3>

        {/* Action buttons — appear on hover */}
        <div
          className="flex gap-1 flex-shrink-0 transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          {onEdit && (
            <ActionBtn onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit" bg="bg-slate-100" color="text-slate-600">
              <Edit3 size={11} />
            </ActionBtn>
          )}
          {onViewHistory && (
            <ActionBtn onClick={e => { e.stopPropagation(); onViewHistory(); }} title="History" bg="bg-indigo-50" color="text-indigo-600">
              <History size={11} />
            </ActionBtn>
          )}
          {onDelete && (
            <ActionBtn onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete" bg="bg-red-50" color="text-red-500">
              <Trash2 size={11} />
            </ActionBtn>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">{description}</p>
      )}

      {/* Meta row: due date + AI confidence */}
      {(dueDate || confidencePct != null) && (
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Calendar size={10} strokeWidth={2.5} />
              {dueDate}
            </span>
          )}
          {confidencePct != null && (
            <span
              className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ background: sCfg.accent + '14', color: sCfg.accent }}
            >
              <Sparkles size={10} strokeWidth={2.5} />
              {confidencePct}% AI
            </span>
          )}
        </div>
      )}

      {/* Footer: priority + status + assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        {/* Priority pill */}
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${pCfg.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pCfg.dot}`} />
          {priority || 'Medium'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Status */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sCfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sCfg.dot}`} />
            {status}
          </span>

          {/* Assignee */}
          {isUrl ? (
            <img
              src={assignee}
              alt="Assignee"
              className="w-6 h-6 rounded-full object-cover"
              style={{ border: `2px solid ${sCfg.accent}40` }}
            />
          ) : initials ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              title={assignee}
              style={{ background: `linear-gradient(135deg, ${sCfg.accent}cc, ${sCfg.accent})`, boxShadow: `0 1px 4px ${sCfg.accent}40` }}
            >
              {initials}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <User size={11} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Small inline action button ──────────────────────────────────────────────────
const ActionBtn = ({ children, onClick, title, bg, color }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80 ${bg} ${color}`}
    style={{ border: 'none' }}
  >
    {children}
  </button>
);

export default TaskCard;