import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
}

export function Button({
  variant = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        variant === 'outline' &&
          'border border-border bg-background text-foreground hover:bg-muted',
        variant === 'destructive' &&
          'bg-destructive text-destructive-foreground hover:bg-red-600',
        variant === 'default' &&
          'bg-primary text-primary-foreground hover:bg-blue-600',
        className
      )}
      {...props}
    />
  );
}
