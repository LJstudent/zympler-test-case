import { InfoTooltip } from "~/components/ui/info-tooltip";

import { GRID_EXPLANATIONS, GRID_TIME_VIEWS } from "../constants/grid-constants";
import type {
  GridAggregation,
  GridMetric,
  GridPeriodOption,
  GridTimeView,
  GridViewSelection,
} from "../types/grid-types";
import { GridSegmentedControl } from "./grid-segmented-control";
import { GridToggle } from "./grid-toggle";

type GridToolbarProps = {
  selection: GridViewSelection;
  periodOptions: readonly GridPeriodOption[];
  onTimeViewChange: (value: GridTimeView) => void;
  onAggregationChange: (value: GridAggregation) => void;
  onMetricChange: (value: GridMetric) => void;
  onPeriodChange: (value: string) => void;
  onBreakdownChange: (value: boolean) => void;
  onViolationsChange: (value: boolean) => void;
};

export function GridToolbar({
  selection,
  periodOptions,
  onTimeViewChange,
  onAggregationChange,
  onMetricChange,
  onPeriodChange,
  onBreakdownChange,
  onViolationsChange,
}: GridToolbarProps) {
  const showMetric = selection.timeView === "day";
  const powerDisabled = selection.aggregation === "combined";

  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-end gap-4">
        <GridSegmentedControl
          label="Period"
          value={selection.timeView}
          options={GRID_TIME_VIEWS}
          onChange={onTimeViewChange}
        />
        <GridSegmentedControl
          label="Detail"
          value={selection.aggregation}
          options={[
            { value: "raw", label: "Raw" },
            { value: "combined", label: "Combined" },
          ]}
          onChange={onAggregationChange}
        />
        {showMetric && (
          <div className="flex items-end gap-2">
            <GridSegmentedControl
              label="Measure"
              value={selection.metric}
              options={[
                { value: "energy", label: "Energy" },
                { value: "power", label: "Power", disabled: powerDisabled },
              ]}
              onChange={onMetricChange}
            />
            <InfoTooltip
              accessibleLabel="About energy and power"
              content={
                powerDisabled
                  ? GRID_EXPLANATIONS.powerDisabled
                  : `${GRID_EXPLANATIONS.energy} ${GRID_EXPLANATIONS.power}`
              }
            />
          </div>
        )}
        <label className="min-w-40">
          <span className="mb-1.5 block text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Selected
          </span>
          <select
            value={selection.periodKey}
            onChange={(event) => onPeriodChange(event.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:border-brand-blue-light focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light/40"
          >
            {periodOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex min-h-9 flex-wrap items-center gap-5">
          <GridToggle
            label="Breakdown"
            checked={selection.breakdown}
            onChange={onBreakdownChange}
          />
          <GridToggle
            label="Show Violations"
            checked={selection.showViolations}
            onChange={onViolationsChange}
          />
        </div>
      </div>
    </div>
  );
}
