import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "~/lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

type CalendarChevronProps = {
  className?: string;
  orientation?: "up" | "down" | "left" | "right";
};

function CalendarChevron({ className, orientation }: CalendarChevronProps) {
  const Icon =
    orientation === "right"
      ? ChevronRight
      : orientation === "up"
        ? ChevronUp
        : orientation === "down"
          ? ChevronDown
          : ChevronLeft;

  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col",
        month: "space-y-3",
        month_caption: "flex h-8 items-center justify-center px-9",
        caption_label: "text-sm font-semibold text-slate-900",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:pointer-events-none disabled:opacity-40",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:pointer-events-none disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex size-9 items-center justify-center text-[0.6875rem] font-medium text-slate-400",
        weeks: "block",
        week: "mt-1 flex",
        day: "relative size-9 p-0 text-center text-xs",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-blue disabled:pointer-events-none disabled:text-slate-300 disabled:opacity-50",
        selected:
          "[&>button]:bg-brand-blue [&>button]:text-white [&>button]:hover:bg-brand-blue/90",
        today: "[&>button]:font-bold [&>button]:text-brand-blue",
        outside: "[&>button]:text-slate-300 [&>button]:opacity-60",
        disabled: "[&>button]:cursor-not-allowed [&>button]:text-slate-300 [&>button]:opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}
