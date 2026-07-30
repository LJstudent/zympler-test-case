import { EmptyState } from "~/components/ui/content-state";
import {
  AssetBreakdownItem,
  AssetBreakdownSection,
  AssetKpiItem,
  AssetKpiPanel,
} from "../../shared";

import {
  createGridBreakdownPresentation,
  createGridKpiPresentation,
} from "../lib/create-grid-kpi-presentation";
import type { GridKpiSummary } from "../types/grid-kpi-types";
import type { GridTimeView } from "../types/grid-types";

type GridKpiPanelProps = {
  timeView: GridTimeView;
  periodLabel: string;
  summary: GridKpiSummary;
  showBreakdown?: boolean;
  locale?: string;
};

export function GridKpiPanel({
  timeView,
  periodLabel,
  summary,
  showBreakdown = false,
  locale = "en",
}: GridKpiPanelProps) {
  const items = createGridKpiPresentation({
    summary,
    timeView,
    locale,
  });

  const importedItems = createGridBreakdownPresentation(
    summary.importedBreakdown,
    "imported",
    locale,
  );

  const exportedItems = createGridBreakdownPresentation(
    summary.exportedBreakdown,
    "exported",
    locale,
  );

  const hasBreakdown = importedItems.length > 0 || exportedItems.length > 0;

  return (
    <AssetKpiPanel title="Grid performance" periodLabel={periodLabel}>
      {summary.measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Grid data is available for the selected period." />
        </div>
      ) : (
        <>
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

          {showBreakdown && hasBreakdown && (
            <AssetBreakdownSection title="Breakdown">
              <div className="mt-3 space-y-6">
                {importedItems.length > 0 && (
                  <section aria-labelledby="grid-imported-breakdown-title">
                    <h4
                      id="grid-imported-breakdown-title"
                      className="text-xs font-semibold text-slate-500"
                    >
                      Imported energy
                    </h4>

                    <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                      {importedItems.map((item) => (
                        <AssetBreakdownItem
                          key={item.id}
                          label={item.label}
                          iconSrc={item.iconSrc}
                          tooltip={item.tooltip}
                          value={item.value}
                          supportingText={item.percentageText}
                        />
                      ))}
                    </ul>
                  </section>
                )}

                {exportedItems.length > 0 && (
                  <section aria-labelledby="grid-exported-breakdown-title">
                    <h4
                      id="grid-exported-breakdown-title"
                      className="text-xs font-semibold text-slate-500"
                    >
                      Exported energy
                    </h4>

                    <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                      {exportedItems.map((item) => (
                        <AssetBreakdownItem
                          key={item.id}
                          label={item.label}
                          iconSrc={item.iconSrc}
                          tooltip={item.tooltip}
                          value={item.value}
                          supportingText={item.percentageText}
                        />
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </AssetBreakdownSection>
          )}
        </>
      )}
    </AssetKpiPanel>
  );
}
