'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export function ScrollArea({
  children,
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaProps) {
  const getScrollClasses = () => {
    switch (orientation) {
      case 'horizontal':
        return 'overflow-x-auto overflow-y-hidden';
      case 'both':
        return 'overflow-auto';
      case 'vertical':
      default:
        return 'overflow-y-auto overflow-x-hidden';
    }
  };

  return (
    <div
      className={cn(
        'relative',
        getScrollClasses(),
        'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ScrollBar({ className }: { className?: string }) {
  return <div className={cn('scrollbar', className)} />;
}
