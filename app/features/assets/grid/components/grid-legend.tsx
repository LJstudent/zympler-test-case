import type { GridChartSeries } from "../types/grid-types";

export function GridLegend({ series }: { series: readonly GridChartSeries[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Chart legend">
      {series.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
