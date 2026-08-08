'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';

interface TimePickerProps {
  time?: string; // HH:MM format
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = 'Select time',
  disabled = false,
  className,
}: TimePickerProps) {
  const [hours, setHours] = React.useState(time?.split(':')[0] || '09');
  const [minutes, setMinutes] = React.useState(time?.split(':')[1] || '00');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleApply = () => {
    const timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    onTimeChange?.(timeString);
    setIsOpen(false);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 23) {
      setHours(value.toString());
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 59) {
      setMinutes(value.toString());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !time && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">Hours</label>
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={handleHoursChange}
                className="w-20"
              />
            </div>
            <span className="text-2xl mt-6">:</span>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">Minutes</label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={handleMinutesChange}
                className="w-20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
