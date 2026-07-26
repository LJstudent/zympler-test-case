import { SlidersHorizontal } from "lucide-react";

import type { GridPeriod } from "~/types/grid-chart";

const PERIODS: readonly GridPeriod[] = ["year", "month", "day"];

type GridToolbarProps = {
  period: GridPeriod;
  rangeLabel: string;
  breakdownEnabled: boolean;
  onPeriodChange: (period: GridPeriod) => void;
  onBreakdownChange: (enabled: boolean) => void;
};

export function GridToolbar({
  period,
  rangeLabel,
  breakdownEnabled,
  onPeriodChange,
  onBreakdownChange,
}: GridToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Grid</h1>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-slate-500">
            {rangeLabel}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">Grid import, export and contracted limits</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={breakdownEnabled}
          onClick={() => onBreakdownChange(!breakdownEnabled)}
          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
            breakdownEnabled
              ? "border-brand-blue bg-blue-50 text-brand-blue"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Breakdown
        </button>

        <div
          className="inline-flex rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Chart period"
        >
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={period === item}
              onClick={() => onPeriodChange(item)}
              className={`h-7 rounded-md px-3 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-blue ${
                period === item
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
