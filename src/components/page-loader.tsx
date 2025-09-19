import * as React from 'react';

import { cn } from '@/lib/utils';

type LoaderVisualProps = React.ComponentPropsWithoutRef<'svg'>;

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function LoaderVisual({ className, ...props }: LoaderVisualProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={cn('pl text-primary', className)}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>MapleLeed loader</title>
      <g className="pl__ring-rotate">
        <circle
          className="pl__ring-stroke"
          cx="80"
          cy="80"
          r="72"
          strokeDasharray="452"
          strokeDashoffset="452"
        />
      </g>
      <g className="pl__arrows">
        <polyline
          points="112 52 80 84 48 52"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polyline
          points="48 108 80 76 112 108"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      {TICK_ANGLES.map(angle => (
        <circle
          key={angle}
          className="pl__tick"
          cx="80"
          cy="80"
          r="72"
          strokeDasharray="12 452"
          strokeDashoffset="-12"
          stroke="currentColor"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      ))}
    </svg>
  );
}

type PageLoaderProps = {
  active: boolean;
  label?: string;
  className?: string;
};

export function PageLoader({ active, label = 'Preparing your MapleLeed experience…', className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500',
        active ? 'pointer-events-auto opacity-100' : 'opacity-0',
        className,
      )}
      aria-hidden={!active}
    >
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-6 text-center">
        <LoaderVisual className="size-28 text-primary" aria-hidden="true" focusable="false" />
        {label ? (
          <p className="max-w-xs text-sm font-medium text-muted-foreground">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  );
}
