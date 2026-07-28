import { useMemo, useState } from "react";

import type { EnergyDataRow } from "~/features/energy-data";

import { getAssetPeriodOptions } from "../lib/asset-time";
import type {
  AssetAggregation,
  AssetTimeView,
  AssetViewSelection,
} from "../types/asset-detail-types";

export function useAssetDetailSelection(rows: readonly EnergyDataRow[]) {
  const [timeView, setTimeViewState] = useState<AssetTimeView>("year");
  const [aggregation, setAggregationState] = useState<AssetAggregation>("combined");
  const [breakdown, setBreakdown] = useState(false);
  const [periodByView, setPeriodByView] = useState<Partial<Record<AssetTimeView, string>>>({});

  const periodOptions = useMemo(() => getAssetPeriodOptions(rows, timeView), [rows, timeView]);
  const periodKey = periodByView[timeView] ?? periodOptions[0]?.key ?? "";

  const selection: AssetViewSelection = {
    timeView,
    aggregation,
    breakdown,
    periodKey,
  };

  function setTimeView(next: AssetTimeView) {
    setTimeViewState(next);
    setAggregationState("combined");
  }

  function setPeriodKey(next: string) {
    setPeriodByView((current) => ({ ...current, [timeView]: next }));
  }

  function setPeriodForView(view: AssetTimeView, next: string) {
    setPeriodByView((current) => ({ ...current, [view]: next }));
  }

  return {
    selection,
    periodOptions,
    setTimeView,
    setAggregation: setAggregationState,
    setBreakdown,
    setPeriodKey,
    setPeriodForView,
  };
}
