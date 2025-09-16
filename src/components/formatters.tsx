
'use client';

import { format, intervalToDuration } from 'date-fns';

export function TimeFormatter({ time }: { time: string }) {
  if (!time) return null;
  return <>{format(new Date(time), 'HH:mm')}</>;
}

export function DateFormatter({ date }: { date: string }) {
  if (!date) return null;
  return <>{format(new Date(date), 'eee, LLL d')}</>;
}

export function DurationFormatter({ duration }: { duration: string }) {
  if (!duration) return null;
  // PT11H35M -> 11h 35m
  const matches = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!matches) return <span>{duration}</span>;

  const hours = matches[1] ? matches[1].replace('H', 'h') : '';
  const minutes = matches[2] ? matches[2].replace('M', 'm') : '';
  return (
    <span>
      {hours} {minutes}
    </span>
  );
}
