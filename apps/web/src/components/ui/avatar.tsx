import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  const initials = fallback || alt?.substring(0, 2).toUpperCase() || '?';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden bg-gray-200',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-gray-600">{initials}</span>
      )}
    </div>
  );
}
