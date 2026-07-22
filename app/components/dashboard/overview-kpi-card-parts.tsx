import { SquareArrowOutUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { SystemInfoTooltip } from "~/components/system-info/system-info-tooltip";
import { INTERACTIVE_CARD_STYLES } from "~/components/ui/interactive-card-styles";

export const OVERVIEW_KPI_CARD_STYLES = `group relative h-full overflow-hidden border-slate-200/90 p-5 shadow-sm focus-within:border-brand-blue-light focus-within:shadow-panel ${INTERACTIVE_CARD_STYLES} sm:p-6`;

type OverviewKpiNavigationLinkProps = {
  accessibleLabel: string;
  to: string;
};

export function OverviewKpiNavigationLink({ accessibleLabel, to }: OverviewKpiNavigationLinkProps) {
  return (
    <Link
      to={to}
      className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue"
      aria-label={accessibleLabel}
    >
      <span className="sr-only">{accessibleLabel}</span>
    </Link>
  );
}

type OverviewKpiActionsProps = {
  tooltipLabel: string;
  tooltipContent: string;
};

export function OverviewKpiActions({ tooltipLabel, tooltipContent }: OverviewKpiActionsProps) {
  return (
    <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-1">
      <SystemInfoTooltip accessibleLabel={tooltipLabel} content={tooltipContent} />
      <span className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 group-hover:text-brand-blue group-focus-within:text-brand-blue">
        <SquareArrowOutUpRight className="size-4.5" aria-hidden="true" />
      </span>
    </div>
  );
}

export function OverviewKpiFlowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/30 transition-colors duration-200 group-hover:bg-brand-blue-light/45">
      {children}
    </span>
  );
}
