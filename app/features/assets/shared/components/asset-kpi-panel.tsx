import { useId } from "react";
import type { ReactNode } from "react";

import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type AssetKpiPanelProps = {
  title: string;
  periodLabel?: string;
  children: ReactNode;
  className?: string;
};

export function AssetKpiPanel({
  title,
  periodLabel,
  children,
  className = "",
}: AssetKpiPanelProps) {
  const titleId = useId();

  return (
    <Card
      aria-labelledby={titleId}
      className={cn("overflow-hidden p-5 shadow-panel sm:p-6", className)}
    >
      <header>
        <h2 id={titleId} className="text-base font-semibold text-slate-950">
          {title}
        </h2>
        {periodLabel !== undefined && (
          <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
        )}
      </header>
      {children}
    </Card>
  );
}
