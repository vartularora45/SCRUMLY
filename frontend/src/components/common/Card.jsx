import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge(clsx(
                'bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden',
                className
            ))}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
