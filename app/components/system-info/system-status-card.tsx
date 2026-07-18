import type { CSSProperties } from "react";

import { Card } from "~/components/ui/card";
import type { SystemStatus } from "~/types/system-status";

import { LiveStatusIndicator } from "./live-status-indicator";

type SystemStatusCardProps = {
  system: SystemStatus;
  entranceDelay: number;
};

export function SystemStatusCard({ system, entranceDelay }: SystemStatusCardProps) {
  const animationStyle = { "--entrance-delay": `${entranceDelay}ms` } as CSSProperties;

  return (
    <Card
      aria-labelledby={`${system.id}-name`}
      className="animate-card-in overflow-hidden border-slate-200/90 px-4 py-3.5 shadow-none motion-reduce:animate-none"
      style={animationStyle}
    >
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3">
        <div className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-brand-blue-light/35 text-brand-blue">
          <img className="size-5.5" src={system.iconSrc} alt="" aria-hidden="true" />
        </div>

        <h3 id={`${system.id}-name`} className="truncate text-sm font-semibold text-slate-950">
          {system.name}
        </h3>
        <p className="text-sm font-semibold tabular-nums text-slate-900">
          {system.currentErrors} errors
        </p>

        <LiveStatusIndicator status={system.status} />
        <p className="text-[0.6875rem] leading-4 tabular-nums text-slate-500">
          Last 30 days: {system.errorsLastThirtyDays} errors
        </p>
      </div>
    </Card>
  );
}
