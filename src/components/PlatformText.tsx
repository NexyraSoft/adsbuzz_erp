import React from 'react';

export type PlatformType = 'Facebook' | 'TikTok' | 'Google' | 'Snapchat';

/**
 * Returns the exact Tailwind class name list for the brand text color of each platform
 * as per the professional SaaS theme requirements.
 */
export function getPlatformTextColorClass(platform: string): string {
  const lower = platform.trim().toLowerCase();
  if (lower === 'facebook' || lower === 'fb' || lower.includes('facebook')) {
    return 'text-[#1877F2] font-semibold';
  }
  if (lower === 'google' || lower === 'gg' || lower.includes('google')) {
    return 'bg-gradient-to-r from-[#34A853] to-[#FBBC05] bg-clip-text text-transparent inline-block font-semibold';
  }
  if (lower === 'tiktok' || lower === 'tt' || lower.includes('tiktok')) {
    return 'bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent inline-block font-semibold';
  }
  if (lower === 'snapchat' || lower === 'snap' || lower.includes('snapchat')) {
    return 'text-amber-600 dark:text-amber-400 font-semibold';
  }
  return 'font-semibold';
}

/**
 * Returns a soft tinted background + dark text color for use inside pills/badges
 * (the gradient text style of Google/TikTok is unreadable on dark backgrounds,
 * so we pair colored backgrounds with dark text for badges).
 */
export function getPlatformBadgeClasses(platform: string): string {
  const lower = platform.trim().toLowerCase();
  if (lower === 'facebook' || lower === 'fb' || lower.includes('facebook')) {
    return 'bg-[#E7F0FE] text-[#1877F2] border-[#1877F2]/25';
  }
  if (lower === 'google' || lower === 'gg' || lower.includes('google')) {
    return 'bg-gradient-to-r from-[#E6F4EA] via-[#FEF7E0] to-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]/25';
  }
  if (lower === 'tiktok' || lower === 'tt' || lower.includes('tiktok')) {
    return 'bg-gradient-to-r from-[#E6FFFB] via-[#FFE7EC] to-[#FFE7EC] text-[#FE2C55] border-[#FE2C55]/25';
  }
  if (lower === 'snapchat' || lower === 'snap' || lower.includes('snapchat')) {
    return 'bg-[#FEF7E0] text-[#B45309] border-[#F59E0B]/30';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

interface PlatformTextProps {
  platform: string;
  className?: string;
  fallbackText?: string;
  variant?: 'text' | 'badge';
}

export const PlatformText: React.FC<PlatformTextProps> = ({ platform, className = '', fallbackText, variant = 'text' }) => {
  const text = fallbackText || platform;
  const styleClass = variant === 'badge' ? getPlatformBadgeClasses(platform) : getPlatformTextColorClass(platform);

  return (
    <span className={`${styleClass} ${className}`}>
      {text}
    </span>
  );
};
