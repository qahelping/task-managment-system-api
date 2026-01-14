import React from 'react';
import { cn } from '@/utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className,
  fullScreen = false,
}) => {
  const sizes = {
    sm: { width: '16px', height: '16px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '48px', height: '48px' },
  };

  const spinner = (
    <div
      className={cn('animate-spin', className)}
      style={{
        ...sizes[size],
        border: '2px solid var(--stroke)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%'
      }}
    />
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 50
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};











