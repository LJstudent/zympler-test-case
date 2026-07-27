import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "~/components/ui/chart";

import { GRID_CAPACITY_LIMITS } from "../constants/grid-constants";
import { formatGridAxisTimestamp, getMonthRawAxisTicks } from "../lib/format-grid-chart";
import type {
  GridAggregation,
  GridChartDatum,
  GridChartSeries,
  GridMetric,
  GridTimeView,
} from "../types/grid-types";
import { GridChartTooltip } from "./grid-chart-tooltip";

type GridChartProps = {
  data: readonly GridChartDatum[];
  series: readonly GridChartSeries[];
  metric: GridMetric;
  timeView: GridTimeView;
  aggregation: GridAggregation;
  breakdown: boolean;
  animationKey: string;
  highlightedTimestampMs?: number;
};

function yAxisValue(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString("en", { maximumFractionDigits: 0 });
}

export function GridChart({
  data,
  series,
  metric,
  timeView,
  aggregation,
  breakdown,
  animationKey,
  highlightedTimestampMs,
}: GridChartProps) {
  const showCapacity = timeView === "day" && metric === "power";
  const isMonthRaw = timeView === "month" && aggregation === "raw";
  const monthRawTicks = isMonthRaw ? getMonthRawAxisTicks(data) : undefined;

  return (
    <ChartContainer
      key={animationKey}
      config={Object.fromEntries(series.map((item) => [item.key, { color: item.color }]))}
      className="h-[24rem] w-full"
      aria-label={`Grid ${metric} bar chart`}
    >
      <BarChart
        data={data}
        stackOffset="sign"
        barCategoryGap={isMonthRaw ? 0 : "10%"}
        barGap={0}
        margin={{ top: 16, right: 12, bottom: 8, left: 2 }}
      >
        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 4" />
        <XAxis
          dataKey="timestampMs"
          type="category"
          allowDuplicatedCategory={false}
          tickLine={false}
          axisLine={false}
          ticks={monthRawTicks}
          interval={isMonthRaw ? 0 : "preserveStartEnd"}
          minTickGap={isMonthRaw ? 0 : 28}
          tickFormatter={(timestamp: number) =>
            formatGridAxisTimestamp(new Date(timestamp), timeView, aggregation)
          }
          tick={{ fill: "#64748b", fontSize: 11 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={yAxisValue}
          tick={{ fill: "#64748b", fontSize: 11 }}
        />
        <Tooltip
          cursor={
            isMonthRaw
              ? {
                  fill: "#315fa8",
                  fillOpacity: 0.12,
                  stroke: "#315fa8",
                  strokeOpacity: 0.45,
                  strokeWidth: 1,
                }
              : { fill: "#bdd2ff", fillOpacity: 0.16 }
          }
          shared
          content={
            <GridChartTooltip
              series={series}
              metric={metric}
              timeView={timeView}
              aggregation={aggregation}
              breakdown={breakdown}
            />
          }
          isAnimationActive={false}
          wrapperStyle={{ outline: "none" }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" />
        {showCapacity && (
          <>
            <ReferenceLine
              y={GRID_CAPACITY_LIMITS.importKw}
              stroke="#e11d48"
              strokeDasharray="7 5"
              label={{
                value: "Import 750 kW",
                fill: "#be123c",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <ReferenceLine
              y={-GRID_CAPACITY_LIMITS.exportKw}
              stroke="#e11d48"
              strokeDasharray="7 5"
              label={{
                value: "Export −500 kW",
                fill: "#be123c",
                fontSize: 10,
                position: "insideBottomRight",
              }}
            />
          </>
        )}
        {series.map((item) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            fill={item.color}
            stackId={item.stackId}
            radius={
              isMonthRaw
                ? 0
                : breakdown
                  ? item.key === "ownUse"
                    ? [3, 3, 0, 0]
                    : item.key === "gridBatteryToGrid"
                      ? [0, 0, 3, 3]
                      : 0
                  : [3, 3, 0, 0]
            }
            maxBarSize={isMonthRaw ? 2 : timeView === "day" ? 14 : 28}
            isAnimationActive={!isMonthRaw}
            animationBegin={0}
            animationDuration={420}
            animationEasing="ease-out"
          >
            {data.map((datum) => {
              const violated = datum.importViolation || datum.exportViolation;
              const highlighted = datum.timestampMs === highlightedTimestampMs;
              return (
                <Cell
                  key={`${item.key}-${datum.timestampMs}`}
                  fill={violated ? "#e11d48" : item.color}
                  stroke={highlighted ? "#881337" : "transparent"}
                  strokeWidth={highlighted ? 2 : 0}
                  opacity={highlightedTimestampMs === undefined || highlighted ? 1 : 0.72}
                />
              );
            })}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
