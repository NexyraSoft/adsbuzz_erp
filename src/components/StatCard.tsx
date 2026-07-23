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
    bg: 'bg-[#F0F7FF]',
    border: 'border-[#CFE1F5]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  purple: {
    bg: 'bg-[#F8F3FF]',
    border: 'border-[#E7D7FB]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  amber: {
    bg: 'bg-[#FFF7ED]',
    border: 'border-[#FBD9B9]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  rose: {
    bg: 'bg-[#FFF1F2]',
    border: 'border-[#F8D6DC]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  emerald: {
    bg: 'bg-[#F1FBF5]',
    border: 'border-[#CFEBDD]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  indigo: {
    bg: 'bg-[#F3F6FF]',
    border: 'border-[#D8E1FB]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
  },
  pink: {
    bg: 'bg-[#FFF3FA]',
    border: 'border-[#F7D4E8]',
    label: 'text-[#0c4275]',
    value: 'text-[#0c4275]',
    sub: 'text-[#0c4275]/75',
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
