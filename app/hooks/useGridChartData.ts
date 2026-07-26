import { useMemo } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { aggregateGridData, getGridPeriodRange } from "~/lib/grid/aggregateGridData";
import { detectGridViolations } from "~/lib/grid/detectGridViolations";
import type { GridChartData, GridPeriod } from "~/types/grid-chart";

const DAY_MS = 24 * 60 * 60 * 1_000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1_000;

const rangeFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatRangeLabel(range: readonly [number, number], period: GridPeriod): string {
  const start = new Date(range[0]);

  if (period === "year") {
    return String(start.getUTCFullYear());
  }

  if (period === "month") {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(start);
  }

  return rangeFormatter.format(start);
}

export function useGridChartData(
  rows: readonly EnergyDataRow[],
  period: GridPeriod,
): GridChartData {
  return useMemo(() => {
    const range = getGridPeriodRange(rows, period);
    const data = aggregateGridData(rows, period);
    const bucketDuration = period === "day" ? FIFTEEN_MINUTES_MS : DAY_MS;
    const domain: [number, number] =
      data.length === 0
        ? [range[0], range[1]]
        : [
            data[0].timestamp - bucketDuration / 2,
            data[data.length - 1].timestamp + bucketDuration / 2,
          ];

    return {
      data,
      domain,
      rangeLabel: formatRangeLabel(range, period),
      violations: detectGridViolations(rows, range),
    };
  }, [period, rows]);
}
