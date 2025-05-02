import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type TimeFrame = 'short_term' | 'medium_term' | 'long_term';

interface TimeFrameSelectorProps {
  currentTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  isLoading: boolean;
}

export default function TimeFrameSelector({
  currentTimeFrame,
  onTimeFrameChange,
  isLoading
}: TimeFrameSelectorProps) {
  
  const timeFrameOptions = [
    { id: 'short_term', label: 'Last month' },
    { id: 'medium_term', label: 'Last 6 months' },
    { id: 'long_term', label: 'All time' }
  ] as const;

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-spotify-dark-gray rounded-lg p-1 flex">
        {timeFrameOptions.map((option) => (
          <button
            key={option.id}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-center font-medium transition-colors",
              currentTimeFrame === option.id 
                ? "bg-spotify-green text-white" 
                : "text-spotify-light-gray hover:text-white"
            )}
            onClick={() => onTimeFrameChange(option.id)}
            disabled={isLoading || currentTimeFrame === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
