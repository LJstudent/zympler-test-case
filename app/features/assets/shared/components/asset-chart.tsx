import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "~/components/ui/chart";

import { ASSET_CHART } from "../constants/asset-detail-constants";
import { formatAssetAxisTimestamp, getMonthRawAxisTicks } from "../lib/format-asset-chart";
import type {
  AssetAggregation,
  AssetChartDatum,
  AssetChartSeries,
  AssetReferenceLine,
  AssetTimeView,
} from "../types/asset-detail-types";

type AssetChartProps<Key extends string> = {
  data: readonly AssetChartDatum[];
  series: readonly AssetChartSeries<Key>[];
  timeView: AssetTimeView;
  aggregation: AssetAggregation;
  breakdown: boolean;
  animationKey: string;
  ariaLabel: string;
  tooltip: ReactElement;
  yAxisStartsAtZero?: boolean;
  referenceLines?: readonly AssetReferenceLine[];
  getCellStyle?: (
    datum: AssetChartDatum,
    series: AssetChartSeries<Key>,
  ) => { fill?: string; stroke?: string; strokeWidth?: number; opacity?: number };
};

function yAxisValue(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString("en", { maximumFractionDigits: 0 });
}

export function AssetChart<Key extends string>({
  data,
  series,
  timeView,
  aggregation,
  breakdown,
  animationKey,
  ariaLabel,
  tooltip,
  yAxisStartsAtZero = false,
  referenceLines = [],
  getCellStyle,
}: AssetChartProps<Key>) {
  const isMonthRaw = timeView === "month" && aggregation === "raw";
  const monthRawTicks = isMonthRaw ? getMonthRawAxisTicks(data) : undefined;

  return (
    <ChartContainer
      key={animationKey}
      config={Object.fromEntries(series.map((item) => [item.key, { color: item.color }]))}
      className="h-[24rem] w-full"
      aria-label={ariaLabel}
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
            formatAssetAxisTimestamp(new Date(timestamp), timeView, aggregation)
          }
          tick={{ fill: "#64748b", fontSize: 11 }}
          dy={8}
        />
        <YAxis
          domain={yAxisStartsAtZero ? [0, "auto"] : undefined}
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
          content={tooltip}
          isAnimationActive={false}
          wrapperStyle={{ outline: "none" }}
        />
        {!yAxisStartsAtZero && <ReferenceLine y={0} stroke="#94a3b8" />}
        {referenceLines.map((line) => (
          <ReferenceLine
            key={`${line.value}-${line.label}`}
            y={line.value}
            stroke="#e11d48"
            strokeDasharray="7 5"
            label={{
              value: line.label,
              fill: "#be123c",
              fontSize: 10,
              position: line.labelPosition,
            }}
          />
        ))}
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
                  ? item.stackPosition === "top"
                    ? [3, 3, 0, 0]
                    : item.stackPosition === "bottom"
                      ? [0, 0, 3, 3]
                      : 0
                  : [3, 3, 0, 0]
            }
            maxBarSize={
              isMonthRaw
                ? ASSET_CHART.rawMonthMaxBarSize
                : timeView === "day"
                  ? ASSET_CHART.dayMaxBarSize
                  : ASSET_CHART.defaultMaxBarSize
            }
            isAnimationActive={!isMonthRaw}
            animationBegin={0}
            animationDuration={ASSET_CHART.animationDurationMs}
            animationEasing="ease-out"
          >
            {data.map((datum) => {
              const style = getCellStyle?.(datum, item);
              return (
                <Cell
                  key={`${item.key}-${datum.timestampMs}`}
                  fill={style?.fill ?? item.color}
                  stroke={style?.stroke ?? "transparent"}
                  strokeWidth={style?.strokeWidth ?? 0}
                  opacity={style?.opacity ?? 1}
                />
              );
            })}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
