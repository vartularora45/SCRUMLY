import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'primary', className }) => {
    const variants = {
        primary: 'bg-blue-50 text-blue-700 border-blue-100',
        secondary: 'bg-slate-100 text-slate-700 border-slate-200',
        success: 'bg-green-50 text-green-700 border-green-100',
        warning: 'bg-orange-50 text-orange-700 border-orange-100',
        danger: 'bg-red-50 text-red-700 border-red-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };

    return (
        <span className={twMerge(clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            variants[variant],
            className
        ))}>
            {children}
        </span>
    );
};

export default Badge;
