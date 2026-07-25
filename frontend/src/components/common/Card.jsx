import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={twMerge(clsx(
                'bg-white rounded-2xl border border-slate-100 overflow-hidden',
                hover && 'transition-all duration-200 hover:-translate-y-0.5',
                className
            ))}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)' }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
