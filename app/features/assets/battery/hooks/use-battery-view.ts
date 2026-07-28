import { useMemo } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { useAssetDetailSelection } from "../../shared";
import { BATTERY_DEFAULT_SELECTION } from "../constants/battery-constants";
import { calculateBatteryAnalytics } from "../lib/calculate-battery-analytics";
import { createBatteryPresentation } from "../lib/format-battery-presentation";

export function useBatteryView(rows: readonly EnergyDataRow[]) {
  const detail = useAssetDetailSelection(rows, BATTERY_DEFAULT_SELECTION.timeView);
  const { selection } = detail;
  const periodLabel =
    detail.periodOptions.find((option) => option.key === selection.periodKey)?.label ??
    "the selected period";
  const analytics = useMemo(
    () =>
      calculateBatteryAnalytics(
        rows,
        selection.timeView,
        selection.aggregation,
        selection.periodKey,
      ),
    [rows, selection.aggregation, selection.periodKey, selection.timeView],
  );
  const presentation = useMemo(
    () =>
      createBatteryPresentation(
        analytics,
        selection.timeView,
        selection.aggregation,
        periodLabel,
        selection.breakdown,
      ),
    [analytics, periodLabel, selection.aggregation, selection.breakdown, selection.timeView],
  );

  return { ...detail, analytics, presentation, periodLabel };
}
