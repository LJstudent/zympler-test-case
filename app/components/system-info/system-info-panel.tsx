import { EmptyState, ErrorState } from "~/components/common/content-state";
import type { ContentState } from "~/components/common/content-state";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSystemInfo } from "~/hooks/use-system-info";

import { SystemInfoTooltip } from "./system-info-tooltip";
import { SystemInfoSkeleton } from "./system-info-skeleton";
import { SystemStatusCard } from "./system-status-card";
import type { SupportedLocale } from "./system-status-labels";

const SYSTEM_INFO_TOOLTIP = "System information tooltip content will be added later.";

type SystemInfoPanelProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  locale?: SupportedLocale;
};

export function SystemInfoPanel({
  state = "ready",
  errorMessage,
  onRetry,
  locale = "en",
}: SystemInfoPanelProps) {
  const { data, isLoading } = useSystemInfo();

  if (state === "loading" || (state === "ready" && (isLoading || data === null))) {
    return <SystemInfoSkeleton />;
  }

  return (
    <div className="p-5">
      <CardHeader className="mb-5 items-start gap-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <CardTitle className="text-lg tracking-[-0.025em]">System info</CardTitle>
          <span className="text-xs text-slate-400">Last updated 1 min ago</span>
        </div>
        <SystemInfoTooltip
          accessibleLabel="About system information"
          content={SYSTEM_INFO_TOOLTIP}
        />
      </CardHeader>

      <CardContent>
        {state === "error" && (
          <ErrorState message={errorMessage ?? "Unable to load system status."} onRetry={onRetry} />
        )}
        {state === "empty" && <EmptyState />}
        {state === "ready" && data !== null && (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {data.map((system, index) => (
              <SystemStatusCard
                key={system.id}
                system={system}
                entranceDelay={90 + index * 70}
                locale={locale}
                onRetry={onRetry}
              />
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
