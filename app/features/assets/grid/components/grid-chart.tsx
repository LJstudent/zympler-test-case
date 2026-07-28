import { AssetChart, AssetTooltip } from "../../shared";

import { GRID_CAPACITY_LIMITS, GRID_EXPLANATIONS } from "../constants/grid-constants";
import type {
  GridAggregation,
  GridChartDatum,
  GridChartSeries,
  GridMetric,
  GridTimeView,
} from "../types/grid-types";

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

  return (
    <AssetChart
      data={data}
      series={series}
      timeView={timeView}
      aggregation={aggregation}
      breakdown={breakdown}
      animationKey={animationKey}
      ariaLabel={`Grid ${metric} bar chart`}
      tooltip={
        <AssetTooltip
          series={series}
          metric={metric}
          timeView={timeView}
          aggregation={aggregation}
          totals={
            breakdown
              ? [
                  { key: "gridImport", label: "Import total" },
                  { key: "gridExport", label: "Export total" },
                ]
              : undefined
          }
          footer={breakdown ? GRID_EXPLANATIONS.signs : undefined}
        />
      }
      referenceLines={
        showCapacity
          ? [
              {
                value: GRID_CAPACITY_LIMITS.importKw,
                label: `Import ${GRID_CAPACITY_LIMITS.importKw} kW`,
                labelPosition: "insideTopRight",
              },
              {
                value: -GRID_CAPACITY_LIMITS.exportKw,
                label: `Export −${GRID_CAPACITY_LIMITS.exportKw} kW`,
                labelPosition: "insideBottomRight",
              },
            ]
          : undefined
      }
      getCellStyle={(datum) => {
        const violated = datum.importViolation === true || datum.exportViolation === true;
        const highlighted = datum.timestampMs === highlightedTimestampMs;
        return {
          fill: violated ? "#e11d48" : undefined,
          stroke: highlighted ? "#881337" : "transparent",
          strokeWidth: highlighted ? 2 : 0,
          opacity: highlightedTimestampMs === undefined || highlighted ? 1 : 0.72,
        };
      }}
    />
  );
}
