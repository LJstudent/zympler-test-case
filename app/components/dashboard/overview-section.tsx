import type { ContentState } from "~/components/common/content-state";
import { EmptyState, ErrorState } from "~/components/common/content-state";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

import { SectionHeading } from "./section-heading";

type OverviewSectionProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
};

function OverviewSkeleton() {
  return (
    <Card
      aria-label="Loading Zympler overview"
      aria-busy="true"
      className="min-h-64 p-6 shadow-panel"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-xl border border-slate-100 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-5 h-7 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewSection({ state = "empty", errorMessage, onRetry }: OverviewSectionProps) {
  return (
    <section aria-labelledby="zympler-overview-heading" className="space-y-6">
      <div id="zympler-overview-heading">
        <SectionHeading>Zympler Overview</SectionHeading>
      </div>

      {state === "loading" && <OverviewSkeleton />}
      {state === "error" && (
        <Card className="min-h-64 p-6 shadow-panel">
          <ErrorState message={errorMessage} onRetry={onRetry} />
        </Card>
      )}
      {(state === "empty" || state === "ready") && (
        <Card className="flex min-h-64 items-center justify-center p-6 shadow-panel">
          <EmptyState message="Future KPI widgets will appear here." />
        </Card>
      )}
    </section>
  );
}
