import React from 'react';

// ─── Generic skeleton block ───────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

// ─── Stats Card Skeleton ──────────────────────────────────────────────────────
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// ─── Task Card Skeleton ───────────────────────────────────────────────────────
export const TaskCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-4" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-7 w-7 rounded-full" />
    </div>
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className={`h-4 ${i === 0 ? 'w-40' : 'w-20'}`} />
      </td>
    ))}
  </tr>
);

// ─── Message Skeleton ─────────────────────────────────────────────────────────
export const MessageSkeleton = () => (
  <div className="flex items-start gap-3 p-3">
    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// ─── Full Page Skeleton ───────────────────────────────────────────────────────
export const PageSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={`h-20 w-full`} />
    ))}
  </div>
);

export default Skeleton;
