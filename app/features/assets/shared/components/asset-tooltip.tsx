import { formatAssetTooltipTimestamp, formatAssetValue } from "../lib/format-asset-chart";
import type {
  AssetAggregation,
  AssetChartDatum,
  AssetChartSeries,
  AssetMetric,
  AssetTimeView,
  AssetTooltipTotal,
} from "../types/asset-detail-types";

type TooltipPayloadItem = {
  payload?: AssetChartDatum;
};

type AssetTooltipProps<Key extends string> = {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  series: readonly AssetChartSeries<Key>[];
  metric: AssetMetric;
  timeView: AssetTimeView;
  aggregation: AssetAggregation;
  totals?: readonly AssetTooltipTotal[];
  totalsFirst?: boolean;
  hideZeroSeries?: boolean;
  footer?: string;
};

function readNumber(datum: AssetChartDatum, key: string): number {
  const value = datum[key];
  return typeof value === "number" ? value : 0;
}

function TooltipRow({
  label,
  value,
  metric,
  color,
  emphasized = false,
}: {
  label: string;
  value: number;
  metric: AssetMetric;
  color?: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">
      <dt
        className={`flex items-center gap-2 ${emphasized ? "font-medium text-slate-300" : "text-slate-300"}`}
      >
        {color !== undefined && (
          <span className="size-2 rounded-sm" style={{ backgroundColor: color }} />
        )}
        {label}
      </dt>
      <dd className={`${emphasized ? "font-semibold" : "font-medium"} tabular-nums`}>
        {formatAssetValue(value, metric)}
      </dd>
    </div>
  );
}

export function AssetTooltip<Key extends string>({
  active,
  payload: activePayload,
  series,
  metric,
  timeView,
  aggregation,
  totals = [],
  totalsFirst = false,
  hideZeroSeries = false,
  footer,
}: AssetTooltipProps<Key>) {
  const activePoint = activePayload?.[0]?.payload;
  if (active !== true || activePoint === undefined) return null;

  const visibleSeries = hideZeroSeries
    ? series.filter((item) => readNumber(activePoint, item.key) > 0)
    : series;
  const totalRows = totals.map((total) => (
    <TooltipRow
      key={total.key}
      label={total.label}
      value={readNumber(activePoint, total.key)}
      metric={metric}
      emphasized
    />
  ));
  const seriesRows = visibleSeries.map((item) => (
    <TooltipRow
      key={item.key}
      label={item.label}
      value={readNumber(activePoint, item.key)}
      metric={metric}
      color={item.color}
    />
  ));

  return (
    <div className="min-w-56 rounded-xl border border-slate-700 bg-slate-950 p-3 text-white shadow-xl">
      <p className="mb-2 text-xs font-semibold">
        {formatAssetTooltipTimestamp(
          new Date(activePoint.timestamp),
          timeView,
          aggregation,
          new Date(activePoint.intervalEndMs),
        )}
      </p>
      <dl className="space-y-1.5">
        {totalsFirst && totalRows.length > 0 && (
          <div className="mb-2 space-y-1.5 border-b border-slate-700 pb-2">{totalRows}</div>
        )}
        {seriesRows}
        {!totalsFirst && totalRows.length > 0 && (
          <div className="mt-2 space-y-1.5 border-t border-slate-700 pt-2">{totalRows}</div>
        )}
      </dl>
      {footer !== undefined && (
        <p className="mt-3 max-w-64 text-[0.625rem] leading-4 text-slate-400">{footer}</p>
      )}
    </div>
  );
}
