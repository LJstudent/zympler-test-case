import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const SKELETON_ITEMS = ["solar", "charger", "battery"] as const;

export function SystemInfoSkeleton() {
  return (
    <Card
      aria-label="Loading system information"
      aria-busy="true"
      className="overflow-hidden p-5 shadow-panel"
    >
      <CardHeader className="mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </CardHeader>

      <CardContent className="space-y-2.5">
        {SKELETON_ITEMS.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200/90 px-4 py-3.5">
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
              <Skeleton className="row-span-2 size-11 rounded-xl" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
