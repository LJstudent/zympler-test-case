import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

import { getCalendarDayKey } from "../lib/asset-time";

export type AssetDatePickerProps = {
  value: Date;
  availableDates: readonly Date[];
  onChange: (date: Date) => void;
};

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function AssetDatePicker({ value, availableDates, onChange }: AssetDatePickerProps) {
  const [open, setOpen] = useState(false);
  const availableDayKeys = useMemo(
    () => new Set(availableDates.map(getCalendarDayKey)),
    [availableDates],
  );
  const bounds = useMemo(() => {
    if (availableDates.length === 0) return undefined;
    const sorted = [...availableDates].sort((left, right) => left.getTime() - right.getTime());
    return { start: sorted[0], end: sorted.at(-1) };
  }, [availableDates]);

  function handleDateSelect(date: Date | undefined) {
    if (date === undefined || !availableDayKeys.has(getCalendarDayKey(date))) return;
    onChange(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 max-w-full justify-start px-3 text-xs font-semibold"
          aria-label={`Select day. Currently selected: ${DATE_LABEL_FORMATTER.format(value)}`}
          aria-expanded={open}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{DATE_LABEL_FORMATTER.format(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-x-auto" collisionPadding={16}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          defaultMonth={value}
          startMonth={bounds?.start}
          endMonth={bounds?.end}
          disabled={(date) => !availableDayKeys.has(getCalendarDayKey(date))}
        />
      </PopoverContent>
    </Popover>
  );
}
