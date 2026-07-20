import type { ContentState } from "~/components/common/content-state";
import { DashboardSidebar } from "~/components/sidebar/sidebar";

import { OverviewSection } from "./overview-section";
import { SystemStatusSection } from "./system-status-section";

type DashboardLayoutProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
};

export function DashboardLayout({ state = "ready", errorMessage, onRetry }: DashboardLayoutProps) {
  const overviewState = state === "ready" ? "empty" : state;

  return (
    <main className="min-h-dvh bg-white p-3 sm:p-4">
      <div className="mx-auto grid w-full max-w-[112rem] gap-6 lg:grid-cols-[minmax(17rem,25%)_minmax(0,1fr)]">
        <DashboardSidebar state={state} />

        <div className="min-w-0 space-y-12 px-1 py-4 sm:px-2 lg:py-6 xl:px-4">
          <SystemStatusSection state={state} errorMessage={errorMessage} onRetry={onRetry} />
          <OverviewSection state={overviewState} errorMessage={errorMessage} onRetry={onRetry} />
        </div>
      </div>
    </main>
  );
}
