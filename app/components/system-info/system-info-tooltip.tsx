import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

type SystemInfoTooltipProps = {
  accessibleLabel: string;
  content: string;
  size?: "compact" | "touch";
};

export function SystemInfoTooltip({
  accessibleLabel,
  content,
  size = "compact",
}: SystemInfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-blue transition-colors duration-200 hover:border-brand-blue-light hover:bg-brand-blue-light/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${size === "touch" ? "size-10" : "size-8"}`}
            aria-label={accessibleLabel}
          >
            <Info className="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
