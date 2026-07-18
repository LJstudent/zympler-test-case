import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSystemInfo } from "~/hooks/use-system-info";

import { SystemInfoSkeleton } from "./system-info-skeleton";
import { SystemStatusCard } from "./system-status-card";

const SYSTEM_INFO_TOOLTIP = "System information tooltip content will be added later.";

export function SystemInfoPanel() {
  const { data, isLoading } = useSystemInfo();

  if (isLoading || data === null) {
    return <SystemInfoSkeleton />;
  }

  return (
    <Card className="animate-panel-in overflow-hidden p-5 shadow-panel motion-reduce:animate-none">
      <CardHeader className="mb-4">
        <CardTitle className="text-base tracking-[-0.02em]">System info</CardTitle>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-brand-blue transition-colors hover:border-brand-blue-light hover:bg-brand-blue-light/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                aria-label="About system information"
              >
                <Info className="size-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="end">
              {SYSTEM_INFO_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {data.map((system, index) => (
          <SystemStatusCard key={system.id} system={system} entranceDelay={90 + index * 70} />
        ))}
      </CardContent>
    </Card>
  );
}
