'use client';

import { useAppStore } from '@/store';
import { useState } from 'react';

interface SyncButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function SyncButton({
  variant = 'primary',
  size = 'md',
  showLabel = true,
}: SyncButtonProps) {
  const user = useAppStore((state) => state.user);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncWithCloud = useAppStore((state) => state.syncWithCloud);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSync = async () => {
    if (!user || syncStatus.isSyncing) return;

    try {
      await syncWithCloud();
      // Afficher un feedback de succès temporaire
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la synchronisation manuelle:', error);
    }
  };

  if (!user) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400';
      case 'secondary':
        return 'bg-slate-600 hover:bg-slate-700 text-white disabled:bg-slate-400';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (syncStatus.isSyncing) {
      return (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
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
      );
    }

    if (showSuccess) {
      return (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );
  };

  const getLabel = () => {
    if (syncStatus.isSyncing) return 'Synchronisation...';
    if (showSuccess) return 'Synchronisé';
    return 'Synchroniser';
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncStatus.isSyncing}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors
        disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
      `}
    >
      {getIcon()}
      {showLabel && <span>{getLabel()}</span>}
    </button>
  );
}
