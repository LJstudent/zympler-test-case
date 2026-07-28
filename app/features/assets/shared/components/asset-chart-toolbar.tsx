import type { ReactNode } from "react";

import { ASSET_AGGREGATIONS, ASSET_TIME_VIEWS } from "../constants/asset-detail-constants";
import type {
  AssetAggregation,
  AssetPeriodOption,
  AssetTimeView,
} from "../types/asset-detail-types";
import { AssetSegmentedControl } from "./asset-segmented-control";
import { AssetToggle } from "./asset-toggle";

type AssetChartToolbarProps = {
  timeView: AssetTimeView;
  aggregation: AssetAggregation;
  breakdown: boolean;
  periodKey: string;
  periodOptions: readonly AssetPeriodOption[];
  onTimeViewChange: (value: AssetTimeView) => void;
  onAggregationChange: (value: AssetAggregation) => void;
  onPeriodChange: (value: string) => void;
  onBreakdownChange: (value: boolean) => void;
  extraControls?: ReactNode;
  extraToggles?: ReactNode;
};

export function AssetChartToolbar({
  timeView,
  aggregation,
  breakdown,
  periodKey,
  periodOptions,
  onTimeViewChange,
  onAggregationChange,
  onPeriodChange,
  onBreakdownChange,
  extraControls,
  extraToggles,
}: AssetChartToolbarProps) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-end gap-4">
        <AssetSegmentedControl
          label="Period"
          value={timeView}
          options={ASSET_TIME_VIEWS}
          onChange={onTimeViewChange}
        />
        <AssetSegmentedControl
          label="Detail"
          value={aggregation}
          options={ASSET_AGGREGATIONS}
          onChange={onAggregationChange}
        />
        {extraControls}
        <label className="min-w-40">
          <span className="mb-1.5 block text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Selected
          </span>
          <select
            value={periodKey}
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
          <AssetToggle label="Breakdown" checked={breakdown} onChange={onBreakdownChange} />
          {extraToggles}
        </div>
      </div>
    </div>
  );
}
