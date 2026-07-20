import { Network } from "lucide-react";

import { EmptyState, ErrorState } from "~/components/common/content-state";
import type { ContentState } from "~/components/common/content-state";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type SidebarAssetCardProps = {
  title: string;
  iconSrc?: string;
  state?: ContentState;
};

const PLACEHOLDER_METRICS = ["Status", "Power", "Updated"] as const;

export function SidebarAssetCardSkeleton() {
  return (
    <Card aria-hidden="true" className="p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {PLACEHOLDER_METRICS.map((metric) => (
          <div key={metric} className="space-y-2">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-3.5 w-7" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SidebarAssetCard({ title, iconSrc, state = "ready" }: SidebarAssetCardProps) {
  if (state === "loading") {
    return <SidebarAssetCardSkeleton />;
  }

  return (
    <Card className="group overflow-hidden shadow-sm transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand-blue-light hover:shadow-panel motion-reduce:transform-none motion-reduce:transition-none">
      <button
        type="button"
        className="w-full cursor-pointer p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue"
        aria-label={`Open ${title} details`}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-blue-light/30 text-brand-blue transition-colors duration-150 group-hover:bg-brand-blue-light/45">
            {iconSrc === undefined ? (
              <Network className="size-4" aria-hidden="true" />
            ) : (
              <img src={iconSrc} alt="" aria-hidden="true" className="size-4" />
            )}
          </span>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        </div>

        {state === "error" && <ErrorState compact />}
        {state === "empty" && <EmptyState compact />}
        {state === "ready" && (
          <dl className="grid grid-cols-3 gap-3">
            {PLACEHOLDER_METRICS.map((metric) => (
              <div key={metric} className="min-w-0">
                <dt className="truncate text-[0.625rem] font-medium uppercase tracking-[0.08em] text-slate-400">
                  {metric}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-500">—</dd>
              </div>
            ))}
          </dl>
        )}
      </button>
    </Card>
  );
}
