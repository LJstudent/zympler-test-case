import { useCallback, useMemo, useState } from "react";

import type { GridSeriesDefinition, GridSeriesKey } from "~/types/grid-chart";

export const GRID_SERIES: readonly GridSeriesDefinition[] = [
  {
    key: "gridImport",
    label: "Import",
    detail: "from grid",
    color: "#003ed0",
    direction: "import",
    kind: "total",
  },
  {
    key: "gridExport",
    label: "Export",
    detail: "to grid",
    color: "#00a978",
    direction: "export",
    kind: "total",
  },
  {
    key: "gridToCharger",
    label: "Grid → charger",
    detail: "import breakdown",
    color: "#4f7ee8",
    direction: "import",
    kind: "breakdown",
  },
  {
    key: "gridToBattery",
    label: "Grid → battery",
    detail: "import breakdown",
    color: "#8aa8ef",
    direction: "import",
    kind: "breakdown",
  },
  {
    key: "solarToGrid",
    label: "Solar → grid",
    detail: "export breakdown",
    color: "#00c991",
    direction: "export",
    kind: "breakdown",
  },
  {
    key: "gridBatteryToGrid",
    label: "Battery (grid) → grid",
    detail: "export breakdown",
    color: "#71dfbe",
    direction: "export",
    kind: "breakdown",
  },
] as const;

const DEFAULT_VISIBLE: ReadonlySet<GridSeriesKey> = new Set(["gridImport", "gridExport"]);
const BREAKDOWN_KEYS = GRID_SERIES.filter((series) => series.kind === "breakdown").map(
  (series) => series.key,
);

export function useGridSeries() {
  const [visibleKeys, setVisibleKeys] = useState<ReadonlySet<GridSeriesKey>>(DEFAULT_VISIBLE);

  const setBreakdownEnabled = useCallback((enabled: boolean) => {
    setVisibleKeys(
      enabled ? new Set(BREAKDOWN_KEYS) : new Set<GridSeriesKey>(["gridImport", "gridExport"]),
    );
  }, []);

  const toggleSeries = useCallback((key: GridSeriesKey) => {
    setVisibleKeys((current) => {
      const next = new Set(current);
      const definition = GRID_SERIES.find((series) => series.key === key);

      if (next.has(key)) {
        next.delete(key);
        return next;
      }

      next.add(key);

      if (definition?.kind === "total") {
        for (const series of GRID_SERIES) {
          if (series.kind === "breakdown" && series.direction === definition.direction) {
            next.delete(series.key);
          }
        }
      } else if (definition !== undefined) {
        const total = GRID_SERIES.find(
          (series) => series.kind === "total" && series.direction === definition.direction,
        );
        if (total !== undefined) next.delete(total.key);
      }

      return next;
    });
  }, []);

  const activeSeries = useMemo(
    () => GRID_SERIES.filter((series) => visibleKeys.has(series.key)),
    [visibleKeys],
  );
  const breakdownEnabled = activeSeries.some((series) => series.kind === "breakdown");

  return {
    series: GRID_SERIES,
    activeSeries,
    visibleKeys,
    breakdownEnabled,
    setBreakdownEnabled,
    toggleSeries,
  };
}
