import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({ label, error, icon: Icon, hint, className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          type={resolvedType}
          className={twMerge(clsx(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
            // Icon padding
            Icon && 'pl-10',
            // Password toggle padding
            isPassword && 'pr-10',
            // Error vs normal state
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50/20'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100/60 hover:border-slate-300',
            className
          ))}
          {...props}
        />
        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
