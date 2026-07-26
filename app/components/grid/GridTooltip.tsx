import type { GridChartDatum, GridPeriod, GridSeriesDefinition } from "~/types/grid-chart";

type GridTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: GridChartDatum }>;
  period: GridPeriod;
  activeSeries: readonly GridSeriesDefinition[];
};

const energyFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 1,
});

function formatTimestamp(timestamp: number, period: GridPeriod): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(period === "day" ? { hour: "2-digit", minute: "2-digit" } : {}),
    year: "numeric",
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp);
}

export function GridTooltip({ active, payload, period, activeSeries }: GridTooltipProps) {
  const datum = payload?.[0]?.payload;

  if (!active || datum === undefined) {
    return null;
  }

  return (
    <div className="min-w-56 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_14px_36px_rgb(15_23_42_/_0.16)]">
      <p className="text-xs font-semibold text-slate-900">
        {formatTimestamp(datum.timestamp, period)}
      </p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6 text-xs">
          <dt className="text-slate-500">Total import</dt>
          <dd className="font-semibold text-slate-900">
            {energyFormatter.format(datum.gridImport)} kWh
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6 text-xs">
          <dt className="text-slate-500">Total export</dt>
          <dd className="font-semibold text-slate-900">
            {energyFormatter.format(Math.abs(datum.gridExport))} kWh
          </dd>
        </div>
        {activeSeries
          .filter((series) => series.kind === "breakdown")
          .map((series) => (
            <div
              key={series.key}
              className="flex items-center justify-between gap-6 border-t border-slate-100 pt-2 text-xs"
            >
              <dt className="flex items-center gap-2 text-slate-500">
                <span
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: series.color }}
                  aria-hidden="true"
                />
                {series.label}
              </dt>
              <dd className="font-semibold text-slate-900">
                {energyFormatter.format(Math.abs(datum[series.key]))} kWh
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
