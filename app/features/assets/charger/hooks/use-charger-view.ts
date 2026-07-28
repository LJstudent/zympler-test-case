import { useMemo } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { useAssetDetailSelection } from "../../shared";

import { transformChargerData } from "../lib/transform-charger-data";

export function useChargerView(rows: readonly EnergyDataRow[]) {
  const detail = useAssetDetailSelection(rows);
  const { selection } = detail;
  const chartData = useMemo(
    () =>
      transformChargerData(rows, selection.timeView, selection.aggregation, selection.periodKey),
    [rows, selection.aggregation, selection.periodKey, selection.timeView],
  );

  return { ...detail, chartData };
}
