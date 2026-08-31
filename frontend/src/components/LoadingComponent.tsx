'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingComponentProps {
  message?: string;
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Loading data...',
  fullPage = false,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center animate-pulse">
      <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-2xl border border-brand-200 dark:border-brand-800/40">
        <Loader2 className={`${iconSize} text-brand-600 dark:text-brand-400 animate-spin`} />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingComponent;
