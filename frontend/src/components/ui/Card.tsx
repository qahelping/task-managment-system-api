import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
}) => {
  return (
    <div
      className={cn(
        'card',
        (hover || onClick) && 'card-clickable',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

