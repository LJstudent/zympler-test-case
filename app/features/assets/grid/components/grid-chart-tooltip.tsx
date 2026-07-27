import { GRID_EXPLANATIONS } from "../constants/grid-constants";
import { formatGridTooltipTimestamp, formatGridValue } from "../lib/format-grid-chart";
import type {
  GridAggregation,
  GridChartDatum,
  GridChartSeries,
  GridMetric,
  GridTimeView,
} from "../types/grid-types";

type TooltipPayloadItem = {
  dataKey?: string | number;
  payload?: GridChartDatum;
  value?: number | string;
};

type GridChartTooltipProps = {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  series: readonly GridChartSeries[];
  metric: GridMetric;
  timeView: GridTimeView;
  aggregation: GridAggregation;
  breakdown: boolean;
};

export function GridChartTooltip({
  active,
  payload: activePayload,
  series,
  metric,
  timeView,
  aggregation,
  breakdown,
}: GridChartTooltipProps) {
  const activePoint = activePayload?.[0]?.payload;
  if (active !== true || activePoint === undefined) return null;

  return (
    <div className="min-w-56 rounded-xl border border-slate-700 bg-slate-950 p-3 text-white shadow-xl">
      <p className="mb-2 text-xs font-semibold">
        {formatGridTooltipTimestamp(new Date(activePoint.timestamp), timeView, aggregation)}
      </p>
      <dl className="space-y-1.5">
        {series.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-5 text-xs">
            <dt className="flex items-center gap-2 text-slate-300">
              <span className="size-2 rounded-sm" style={{ backgroundColor: item.color }} />
              {item.label}
            </dt>
            <dd className="font-medium tabular-nums">
              {formatGridValue(activePoint[item.key], metric)}
            </dd>
          </div>
        ))}
        {breakdown && (
          <div className="mt-2 space-y-1.5 border-t border-slate-700 pt-2 text-xs">
            <div className="flex items-center justify-between gap-5">
              <dt className="font-medium text-slate-300">Import total</dt>
              <dd className="font-semibold tabular-nums">
                {formatGridValue(activePoint.gridImport, metric)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-5">
              <dt className="font-medium text-slate-300">Export total</dt>
              <dd className="font-semibold tabular-nums">
                {formatGridValue(activePoint.gridExport, metric)}
              </dd>
            </div>
          </div>
        )}
      </dl>
      {breakdown && (
        <p className="mt-3 max-w-64 text-[0.625rem] leading-4 text-slate-400">
          {GRID_EXPLANATIONS.signs}
        </p>
      )}
    </div>
  );
}
