import { useMemo, useState } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { useAssetDetailSelection } from "../../shared";

import {
  calculateGridCapacityViolations,
  getGridDayKey,
  transformGridData,
} from "../lib/transform-grid-data";
import type {
  GridAggregation,
  GridCapacityViolation,
  GridMetric,
  GridTimeView,
  GridViewSelection,
} from "../types/grid-types";

export function useGridView(rows: readonly EnergyDataRow[]) {
  const assetSelection = useAssetDetailSelection(rows);
  const [metric, setMetricState] = useState<GridMetric>("energy");
  const [showViolations, setShowViolations] = useState(false);
  const [highlightedViolationId, setHighlightedViolationId] = useState<string | null>(null);
  const { selection: sharedSelection } = assetSelection;

  const violations = useMemo(() => calculateGridCapacityViolations(rows), [rows]);
  const chartData = useMemo(
    () =>
      transformGridData(
        rows,
        sharedSelection.timeView,
        sharedSelection.aggregation,
        metric,
        sharedSelection.periodKey,
      ),
    [
      metric,
      rows,
      sharedSelection.aggregation,
      sharedSelection.periodKey,
      sharedSelection.timeView,
    ],
  );

  const selection: GridViewSelection = {
    ...sharedSelection,
    metric,
    showViolations,
  };

  function setTimeView(next: GridTimeView) {
    assetSelection.setTimeView(next);
    setMetricState("energy");
    setHighlightedViolationId(null);
  }

  function setAggregation(next: GridAggregation) {
    assetSelection.setAggregation(next);
    if (next === "combined") setMetricState("energy");
    setHighlightedViolationId(null);
  }

  function setMetric(next: GridMetric) {
    setMetricState(next);
    setHighlightedViolationId(null);
  }

  function setPeriodKey(next: string) {
    assetSelection.setPeriodKey(next);
    setHighlightedViolationId(null);
  }

  function selectViolation(violation: GridCapacityViolation) {
    assetSelection.setTimeView("day");
    assetSelection.setAggregation("raw");
    assetSelection.setPeriodForView("day", getGridDayKey(violation.timestamp));
    setMetricState("power");
    setHighlightedViolationId(violation.id);
  }

  return {
    selection,
    periodOptions: assetSelection.periodOptions,
    chartData,
    violations,
    highlightedViolationId,
    setTimeView,
    setAggregation,
    setMetric,
    setBreakdown: assetSelection.setBreakdown,
    setShowViolations,
    setPeriodKey,
    selectViolation,
  };
}
