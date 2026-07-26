import { memo, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "~/components/ui/chart";
import { buildStackedSeries } from "~/lib/grid/buildStackedSeries";
import type {
  AggregatedGridDatum,
  GridPeriod,
  GridSeriesDefinition,
  GridViolation,
} from "~/types/grid-chart";

import { GridLimitIndicators } from "./GridLimitIndicators";
import { GridTooltip } from "./GridTooltip";

const CHART_MARGIN = { top: 12, right: 20, bottom: 8, left: 8 } as const;
const PLOT_INSETS = { top: 12, right: 20, bottom: 38, left: 68 } as const;

type GridChartProps = {
  data: readonly AggregatedGridDatum[];
  domain: readonly [number, number];
  period: GridPeriod;
  activeSeries: readonly GridSeriesDefinition[];
  violations: readonly GridViolation[];
};

function formatAxisDate(timestamp: number, period: GridPeriod): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...(period === "day"
      ? { hour: "2-digit", minute: "2-digit" }
      : period === "month"
        ? { day: "numeric", month: "short" }
        : { month: "short" }),
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp);
}

function formatEnergyTick(value: number): string {
  const absolute = Math.abs(value);
  return absolute >= 1_000 ? `${(absolute / 1_000).toFixed(1)}k` : String(Math.round(absolute));
}

export const GridChart = memo(function GridChart({
  data,
  domain,
  period,
  activeSeries,
  violations,
}: GridChartProps) {
  const chartData = useMemo(() => buildStackedSeries(data), [data]);
  const chartConfig = useMemo(
    () => Object.fromEntries(activeSeries.map((series) => [series.key, { color: series.color }])),
    [activeSeries],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[30rem] items-center justify-center text-sm text-slate-500">
        No grid measurements are available for this period.
      </div>
    );
  }

  return (
    <div className="relative pt-5">
      <ChartContainer config={chartConfig} className="h-[30rem] w-full">
        <BarChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid vertical={false} stroke="#e8edf5" strokeDasharray="3 4" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[domain[0], domain[1]]}
            tickFormatter={(value: number) => formatAxisDate(value, period)}
            tickLine={false}
            axisLine={false}
            minTickGap={period === "day" ? 28 : 42}
            tick={{ fill: "#64748b", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            tickFormatter={formatEnergyTick}
            tickLine={false}
            axisLine={false}
            width={60}
            tick={{ fill: "#64748b", fontSize: 11 }}
            label={{
              value: "Energy (kWh)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 10,
            }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Tooltip
            cursor={{ fill: "#f1f5f9", opacity: 0.65 }}
            content={<GridTooltip period={period} activeSeries={activeSeries} />}
          />
          {activeSeries.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              stackId="grid-flow"
              fill={series.color}
              maxBarSize={period === "day" ? 14 : 8}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <GridLimitIndicators violations={violations} domain={domain} plotInsets={PLOT_INSETS} />
    </div>
  );
});
