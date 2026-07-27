import { useMemo, useState } from "react";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  calculateGridCapacityViolations,
  getGridDayKey,
  getGridPeriodOptions,
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
  const [timeView, setTimeViewState] = useState<GridTimeView>("year");
  const [aggregation, setAggregationState] = useState<GridAggregation>("combined");
  const [metric, setMetricState] = useState<GridMetric>("energy");
  const [breakdown, setBreakdown] = useState(false);
  const [showViolations, setShowViolations] = useState(false);
  const [periodByView, setPeriodByView] = useState<Partial<Record<GridTimeView, string>>>({});
  const [highlightedViolationId, setHighlightedViolationId] = useState<string | null>(null);

  const periodOptions = useMemo(() => getGridPeriodOptions(rows, timeView), [rows, timeView]);
  const periodKey = periodByView[timeView] ?? periodOptions[0]?.key ?? "";
  const violations = useMemo(() => calculateGridCapacityViolations(rows), [rows]);
  const chartData = useMemo(
    () => transformGridData(rows, timeView, aggregation, metric, periodKey),
    [aggregation, metric, periodKey, rows, timeView],
  );

  const selection: GridViewSelection = {
    timeView,
    aggregation,
    metric,
    breakdown,
    showViolations,
    periodKey,
  };

  function setTimeView(next: GridTimeView) {
    setTimeViewState(next);
    setAggregationState("combined");
    setMetricState("energy");
    setHighlightedViolationId(null);
  }

  function setAggregation(next: GridAggregation) {
    setAggregationState(next);
    if (next === "combined") setMetricState("energy");
    setHighlightedViolationId(null);
  }

  function setMetric(next: GridMetric) {
    setMetricState(next);
    setHighlightedViolationId(null);
  }

  function setPeriodKey(next: string) {
    setPeriodByView((current) => ({ ...current, [timeView]: next }));
    setHighlightedViolationId(null);
  }

  function selectViolation(violation: GridCapacityViolation) {
    setTimeViewState("day");
    setAggregationState("raw");
    setMetricState("power");
    setPeriodByView((current) => ({ ...current, day: getGridDayKey(violation.timestamp) }));
    setHighlightedViolationId(violation.id);
  }

  return {
    selection,
    periodOptions,
    chartData,
    violations,
    highlightedViolationId,
    setTimeView,
    setAggregation,
    setMetric,
    setBreakdown,
    setShowViolations,
    setPeriodKey,
    selectViolation,
  };
}
