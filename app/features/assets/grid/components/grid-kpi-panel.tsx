import { Card } from "~/components/ui/card";
import { EmptyState, ErrorState } from "~/components/ui/content-state";

import { createGridKpiPresentation } from "../lib/create-grid-kpi-presentation";
import type { GridKpiPanelStatus, GridKpiSummary } from "../types/grid-kpi-types";
import type { GridTimeView } from "../types/grid-types";
import { GridBreakdownSection } from "./grid-breakdown-section";
import { GridKpiItem } from "./grid-kpi-item";

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
  const panelTitleId = "grid-kpi-panel-title";

  if (status === "error") {
    return (
      <Card aria-labelledby={panelTitleId} className="min-h-64 p-5 shadow-panel sm:p-6">
        <h2 id={panelTitleId} className="text-base font-semibold text-slate-950">
          Grid performance
        </h2>
        <div className="mt-6">
          <ErrorState
            message="Grid statistics could not be loaded. The chart is still available, but its summary could not be calculated."
            onRetry={onRetry}
            retryLabel="Try again"
          />
        </div>
      </Card>
    );
  }

  if (status === "empty" || summary === null || summary.measurementCount === 0) {
    return (
      <Card aria-labelledby={panelTitleId} className="min-h-64 p-5 shadow-panel sm:p-6">
        <h2 id={panelTitleId} className="text-base font-semibold text-slate-950">
          Grid performance
        </h2>
        <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
        <div className="mt-6">
          <EmptyState message="No Grid data available. There are no import or export measurements for the selected period." />
        </div>
      </Card>
    );
  }

  const items = createGridKpiPresentation({ summary, timeView, locale });

  return (
    <Card aria-labelledby={panelTitleId} className="overflow-hidden p-5 shadow-panel sm:p-6">
      <header>
        <h2 id={panelTitleId} className="text-base font-semibold text-slate-950">
          Grid performance
        </h2>
        <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
      </header>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12">
        {items.map((item, index) => (
          <GridKpiItem
            key={item.id}
            item={item}
            desktopSpanClassName={
              items.length === 7 && index >= 4 ? "xl:col-span-4" : "xl:col-span-3"
            }
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
    </Card>
  );
}
