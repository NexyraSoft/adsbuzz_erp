/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type StatCardVariant = 'blue' | 'purple' | 'amber' | 'rose' | 'emerald' | 'indigo' | 'pink';

export interface StatCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  variant?: StatCardVariant;
  subtext?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  id?: string;
  size?: 'default' | 'compact';
}

const VARIANT_STYLES: Record<StatCardVariant, {
  bg: string;
  border: string;
  label: string;
  value: string;
  sub: string;
}> = {
  blue: {
    bg: 'bg-[#eff6ff] dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    label: 'text-blue-600 dark:text-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
    sub: 'text-blue-500/80 dark:text-blue-300/80',
  },
  purple: {
    bg: 'bg-[#faf5ff] dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/60',
    label: 'text-purple-600 dark:text-purple-400',
    value: 'text-purple-600 dark:text-purple-400',
    sub: 'text-purple-500/80 dark:text-purple-300/80',
  },
  amber: {
    bg: 'bg-[#fffbeb] dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    label: 'text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    sub: 'text-amber-500/80 dark:text-amber-300/80',
  },
  rose: {
    bg: 'bg-[#fff1f2] dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/60',
    label: 'text-rose-600 dark:text-rose-400',
    value: 'text-rose-600 dark:text-rose-400',
    sub: 'text-rose-500/80 dark:text-rose-300/80',
  },
  emerald: {
    bg: 'bg-[#ecfdf5] dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    label: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
    sub: 'text-emerald-500/80 dark:text-emerald-300/80',
  },
  indigo: {
    bg: 'bg-[#eef2ff] dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    label: 'text-indigo-600 dark:text-indigo-400',
    value: 'text-indigo-600 dark:text-indigo-400',
    sub: 'text-indigo-500/80 dark:text-indigo-300/80',
  },
  pink: {
    bg: 'bg-[#fdf2f8] dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800/60',
    label: 'text-pink-600 dark:text-pink-400',
    value: 'text-pink-600 dark:text-pink-400',
    sub: 'text-pink-500/80 dark:text-pink-300/80',
  },
};

const SIZE_STYLES = {
  default: {
    card: 'p-5 rounded-xl',
    stack: 'space-y-2',
    title: 'text-xs sm:text-sm',
    value: 'text-2xl sm:text-3xl',
    subtext: 'text-[11px]',
    icon: '',
  },
  compact: {
    card: 'p-3.5 rounded-lg',
    stack: 'space-y-1.5',
    title: 'text-[10px] sm:text-[11px] leading-snug',
    value: 'text-lg sm:text-xl leading-tight',
    subtext: 'text-[9px] sm:text-[10px]',
    icon: '[&>svg]:h-4 [&>svg]:w-4',
  },
};

export function StatCard({
  title,
  value,
  variant = 'blue',
  subtext,
  badge,
  icon,
  onClick,
  className = '',
  id,
  size = 'default'
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;
  const sizing = SIZE_STYLES[size];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`${sizing.card} border ${styles.bg} ${styles.border} transition-all ${
        onClick ? 'cursor-pointer hover:opacity-95 active:scale-[0.995]' : ''
      } ${className}`}
    >
      <div className={`flex flex-col justify-between h-full ${sizing.stack}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`${sizing.title} font-medium tracking-normal ${styles.label}`}>
            {title}
          </span>
          {badge && <div>{badge}</div>}
        </div>
        
        <div className="flex items-baseline justify-between gap-2">
          <div className={`${sizing.value} font-bold tracking-tight ${styles.value}`}>
            {value}
          </div>
          {icon && <div className={`${styles.label} ${sizing.icon} opacity-80 flex-shrink-0`}>{icon}</div>}
        </div>

        {subtext && (
          <div className={`${sizing.subtext} pt-0.5 font-medium ${styles.sub}`}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
