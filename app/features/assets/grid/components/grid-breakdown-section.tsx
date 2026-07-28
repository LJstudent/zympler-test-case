import { EmptyState, ErrorState } from "~/components/ui/content-state";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { createGridBreakdownPresentation } from "../lib/create-grid-kpi-presentation";
import type { GridKpiPanelStatus, GridKpiSummary } from "../types/grid-kpi-types";
import { GridBreakdownItem } from "./grid-breakdown-item";

type GridBreakdownSectionProps = {
  summary: GridKpiSummary | null;
  status: GridKpiPanelStatus;
  onRetry?: () => void;
  locale?: string;
};

function BreakdownItemsSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden="true" className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="mt-4 h-7 w-24" />
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function GridBreakdownSection({
  summary,
  status,
  onRetry,
  locale = "en",
}: GridBreakdownSectionProps) {
  const importedItems =
    summary === null
      ? []
      : createGridBreakdownPresentation(summary.importedBreakdown, "imported", locale);
  const exportedItems =
    summary === null
      ? []
      : createGridBreakdownPresentation(summary.exportedBreakdown, "exported", locale);
  const isEmpty = importedItems.length === 0 && exportedItems.length === 0;

  return (
    <section aria-labelledby="grid-breakdown-title">
      <Separator className="my-6" />
      <h3 id="grid-breakdown-title" className="text-sm font-semibold text-slate-950">
        Breakdown
      </h3>
      {status === "loading" ? (
        <div aria-label="Loading Grid energy breakdown" aria-busy="true">
          <span className="sr-only">Loading Grid energy breakdown</span>
          <BreakdownItemsSkeleton count={4} />
          <BreakdownItemsSkeleton count={2} />
        </div>
      ) : status === "error" ? (
        <div className="mt-4">
          <ErrorState
            message="The energy breakdown could not be calculated."
            onRetry={onRetry}
            retryLabel="Try again"
            compact
          />
        </div>
      ) : status === "empty" || summary === null || isEmpty ? (
        <div className="mt-4">
          <EmptyState message="No energy breakdown is available for the selected period." compact />
        </div>
      ) : (
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
                  <GridBreakdownItem key={item.id} item={item} />
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
                  <GridBreakdownItem key={item.id} item={item} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
