import { useMemo } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { useAssetDetailSelection } from "../../shared";

import { transformSolarData } from "../lib/transform-solar-data";

export function useSolarView(rows: readonly EnergyDataRow[]) {
  const detail = useAssetDetailSelection(rows);
  const { selection } = detail;
  const chartData = useMemo(
    () => transformSolarData(rows, selection.timeView, selection.aggregation, selection.periodKey),
    [rows, selection.aggregation, selection.periodKey, selection.timeView],
  );

  return { ...detail, chartData };
}
