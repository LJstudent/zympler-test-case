import { CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

import { SystemStatusCardSkeleton } from "./system-status-card-skeleton";

const SKELETON_ITEMS = ["solar", "charger", "battery"] as const;

export function SystemInfoSkeleton() {
  return (
    <div aria-label="Loading system information" aria-busy="true" className="overflow-hidden p-5">
      <CardHeader className="mb-5 items-start gap-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="size-8 rounded-lg" />
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {SKELETON_ITEMS.map((item) => (
          <SystemStatusCardSkeleton key={item} />
        ))}
      </CardContent>
    </div>
  );
}
