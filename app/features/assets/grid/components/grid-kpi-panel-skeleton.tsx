import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

import type { GridTimeView } from "../types/grid-types";
import { GridBreakdownSection } from "./grid-breakdown-section";

type GridKpiPanelSkeletonProps = {
  timeView: GridTimeView;
  showBreakdown: boolean;
};

export function GridKpiPanelSkeleton({ timeView, showBreakdown }: GridKpiPanelSkeletonProps) {
  const itemCount = timeView === "year" ? 7 : 8;

  return (
    <Card
      aria-label="Loading Grid performance summary"
      aria-busy="true"
      className="overflow-hidden p-5 shadow-panel sm:p-6"
    >
      <span className="sr-only">Loading Grid performance summary</span>
      <div aria-hidden="true">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12">
          {Array.from({ length: itemCount }, (_, index) => (
            <div
              key={index}
              className={`border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0 ${
                itemCount === 7 && index >= 4 ? "xl:col-span-4" : "xl:col-span-3"
              }`}
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-4 h-7 w-24" />
              <Skeleton className="mt-3 h-3 w-20" />
            </div>
          ))}
        </div>
        {showBreakdown && <GridBreakdownSection summary={null} status="loading" />}
      </div>
    </Card>
  );
}
