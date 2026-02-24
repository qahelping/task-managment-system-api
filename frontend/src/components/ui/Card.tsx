import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  hover?: boolean;
  'data-qa'?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
  'data-qa': dataQa,
}) => {
  return (
    <div
      className={cn(
        'card',
        (hover || onClick) && 'card-clickable',
        className
      )}
      onClick={onClick}
      data-qa={dataQa}
    >
      {children}
    </div>
  );
};

