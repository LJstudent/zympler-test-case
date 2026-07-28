import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { ResponsiveTooltip } from "~/components/ui/responsive-tooltip";

type InfoTooltipProps = {
  accessibleLabel: string;
  content: ReactNode;
  size?: "compact" | "touch";
};

export function InfoTooltip({ accessibleLabel, content, size = "compact" }: InfoTooltipProps) {
  return (
    <ResponsiveTooltip content={content} side="top" align="end">
      <button
        type="button"
        className={`pointer-events-auto inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-blue transition-colors duration-200 hover:border-brand-blue-light hover:bg-brand-blue-light/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${size === "touch" ? "size-10" : "size-8"}`}
        aria-label={accessibleLabel}
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
    </ResponsiveTooltip>
  );
}
