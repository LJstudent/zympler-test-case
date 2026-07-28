import { InfoTooltip } from "~/components/ui/info-tooltip";
import { AssetChartToolbar, AssetSegmentedControl, AssetToggle } from "../../shared";

import { GRID_EXPLANATIONS } from "../constants/grid-constants";
import type {
  GridAggregation,
  GridMetric,
  GridPeriodOption,
  GridTimeView,
  GridViewSelection,
} from "../types/grid-types";

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
    <AssetChartToolbar
      timeView={selection.timeView}
      aggregation={selection.aggregation}
      breakdown={selection.breakdown}
      periodKey={selection.periodKey}
      periodOptions={periodOptions}
      onTimeViewChange={onTimeViewChange}
      onAggregationChange={onAggregationChange}
      onPeriodChange={onPeriodChange}
      onBreakdownChange={onBreakdownChange}
      extraControls={
        showMetric ? (
          <div className="flex items-end gap-2">
            <AssetSegmentedControl
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
        ) : undefined
      }
      extraToggles={
        <AssetToggle
          label="Show Violations"
          checked={selection.showViolations}
          onChange={onViolationsChange}
        />
      }
    />
  );
}
