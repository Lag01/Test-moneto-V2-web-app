'use client';

import type { PlanSyncStatus } from '@/lib/supabase/types';

interface PlanSyncStatusBadgeProps {
  status: PlanSyncStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function PlanSyncStatusBadge({
  status,
  size = 'sm',
  showLabel = true,
}: PlanSyncStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Synchronisé',
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        };
      case 'not_synced':
        return {
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ),
          label: 'Non synchronisé',
          colorClass: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700',
        };
      case 'cloud_only':
        return {
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          ),
          label: 'Cloud uniquement',
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        };
      case 'local_newer':
        return {
          icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Local plus récent',
          colorClass: 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700',
        };
      case 'cloud_newer':
        return {
          icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Cloud plus récent',
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        };
      case 'syncing':
        return {
          icon: (
            <svg className="w-full h-full animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
          label: 'Synchronisation...',
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        };
      case 'error':
        return {
          icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Erreur',
          colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
        };
      default:
        return {
          icon: null,
          label: 'Inconnu',
          colorClass: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700',
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const paddingSize = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.colorClass} ${paddingSize} transition-all`}
    >
      <div className={iconSize}>{config.icon}</div>
      {showLabel && <span className={textSize}>{config.label}</span>}
    </div>
  );
}
