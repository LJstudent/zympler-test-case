import { EmptyState, ErrorState } from "~/components/ui/content-state";
import { AssetKpiItem, AssetKpiPanel } from "../../shared";

import { createGridKpiPresentation } from "../lib/create-grid-kpi-presentation";
import type { GridKpiPanelStatus, GridKpiSummary } from "../types/grid-kpi-types";
import type { GridTimeView } from "../types/grid-types";
import { GridBreakdownSection } from "./grid-breakdown-section";

type GridKpiPanelProps = {
  timeView: GridTimeView;
  periodLabel: string;
  summary: GridKpiSummary | null;
  status: GridKpiPanelStatus;
  onRetry?: () => void;
  showBreakdown?: boolean;
  breakdownStatus?: GridKpiPanelStatus;
  onBreakdownRetry?: () => void;
  locale?: string;
};

export function GridKpiPanel({
  timeView,
  periodLabel,
  summary,
  status,
  onRetry,
  showBreakdown = false,
  breakdownStatus = status,
  onBreakdownRetry,
  locale = "en",
}: GridKpiPanelProps) {
  if (status === "error") {
    return (
      <AssetKpiPanel title="Grid performance" className="min-h-64">
        <div className="mt-6">
          <ErrorState
            message="Grid statistics could not be loaded. The chart is still available, but its summary could not be calculated."
            onRetry={onRetry}
            retryLabel="Try again"
          />
        </div>
      </AssetKpiPanel>
    );
  }

  if (status === "empty" || summary === null || summary.measurementCount === 0) {
    return (
      <AssetKpiPanel title="Grid performance" periodLabel={periodLabel} className="min-h-64">
        <div className="mt-6">
          <EmptyState message="No Grid data available. There are no import or export measurements for the selected period." />
        </div>
      </AssetKpiPanel>
    );
  }

  const items = createGridKpiPresentation({ summary, timeView, locale });

  return (
    <AssetKpiPanel title="Grid performance" periodLabel={periodLabel}>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12">
        {items.map((item, index) => (
          <AssetKpiItem
            key={item.id}
            label={item.label}
            iconSrc={item.iconSrc}
            tooltip={item.tooltip}
            value={item.value}
            valueAvailable={item.valueAvailable}
            supportingText={item.supportingText}
            context={item.context}
            className={`border-t border-slate-100 first:border-t-0 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0 ${
              items.length === 7 && index >= 4 ? "xl:col-span-4" : "xl:col-span-3"
            }`}
          />
        ))}
      </div>
      {showBreakdown && (
        <GridBreakdownSection
          summary={summary}
          status={breakdownStatus}
          onRetry={onBreakdownRetry}
          locale={locale}
        />
      )}
    </AssetKpiPanel>
  );
}
