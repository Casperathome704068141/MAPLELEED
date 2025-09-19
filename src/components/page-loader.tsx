"use client";

import * as React from 'react';

import { cn } from '@/lib/utils';

type LoaderVisualProps = React.ComponentPropsWithoutRef<'svg'> & {
  paused?: boolean;
};

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function LoaderVisual({ className, paused = false, ...props }: LoaderVisualProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={cn('pl text-primary', className)}
      data-paused={paused ? 'true' : undefined}
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

const FADE_OUT_DELAY = 240;

type PageLoaderProps = {
  active: boolean;
  label?: string;
  className?: string;
};

export function PageLoader({ active, label = 'Preparing your MapleLeed experience…', className }: PageLoaderProps) {
  const [shouldRender, setShouldRender] = React.useState(active);
  const hideTimerRef = React.useRef<number>();

  React.useEffect(() => {
    if (active) {
      setShouldRender(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = undefined;
      }
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      hideTimerRef.current = undefined;
    }, FADE_OUT_DELAY);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = undefined;
      }
    };
  }, [active]);

  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  const isHidden = !active;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isHidden ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100',
        className,
      )}
      aria-hidden={isHidden}
      data-state={isHidden ? 'hidden' : 'visible'}
    >
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-6 text-center">
        <LoaderVisual
          className="size-28 text-primary"
          aria-hidden="true"
          focusable="false"
          paused={isHidden}
        />
        {label ? (
          <p className="max-w-xs text-sm font-medium text-muted-foreground">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  );
}
