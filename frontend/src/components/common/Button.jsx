import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  className,
  isLoading,
  disabled,
  ...props
}) => {
  const base = [
    'inline-flex items-center justify-center font-semibold select-none',
    'transition-all duration-150 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.97]',
    'rounded-[10px]',
  ].join(' ');

  const variants = {
    primary: [
      'bg-indigo-600 text-white',
      'hover:bg-indigo-700 active:bg-indigo-800',
      'focus-visible:ring-indigo-500',
      'shadow-[0_2px_8px_rgba(99,102,241,0.35)]',
      'hover:shadow-[0_4px_16px_rgba(99,102,241,0.45)]',
    ].join(' '),

    secondary: [
      'bg-white text-slate-700',
      'border border-slate-200',
      'hover:bg-slate-50 hover:border-slate-300',
      'active:bg-slate-100',
      'focus-visible:ring-slate-300',
      'shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
    ].join(' '),

    outline: [
      'bg-transparent text-indigo-600',
      'border-2 border-indigo-500',
      'hover:bg-indigo-50',
      'focus-visible:ring-indigo-500',
    ].join(' '),

    ghost: [
      'bg-transparent text-slate-600',
      'hover:bg-slate-100 hover:text-slate-900',
      'active:bg-slate-200',
      'focus-visible:ring-slate-200',
    ].join(' '),

    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700 active:bg-red-800',
      'focus-visible:ring-red-500',
      'shadow-[0_2px_8px_rgba(239,68,68,0.30)]',
      'hover:shadow-[0_4px_16px_rgba(239,68,68,0.40)]',
    ].join(' '),

    success: [
      'bg-emerald-600 text-white',
      'hover:bg-emerald-700 active:bg-emerald-800',
      'focus-visible:ring-emerald-500',
      'shadow-[0_2px_8px_rgba(16,185,129,0.30)]',
    ].join(' '),

    'danger-ghost': [
      'bg-transparent text-red-600',
      'hover:bg-red-50',
      'focus-visible:ring-red-300',
    ].join(' '),
  };

  const sizes = {
    xs: 'px-2.5 py-1   text-xs   gap-1',
    sm: 'px-3.5 py-1.5 text-xs   gap-1.5',
    md: 'px-4   py-2.5 text-sm   gap-1.5',
    lg: 'px-5   py-3   text-sm   gap-2',
    xl: 'px-7   py-3.5 text-base gap-2',
  };

  return (
    <button
      className={twMerge(clsx(
        base,
        variants[variant] ?? variants.primary,
        sizes[size]       ?? sizes.md,
        className
      ))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
