import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function SmartChargingSkeleton() {
  return (
    <Card
      aria-label="Loading smart charging KPI"
      aria-busy="true"
      className="h-full overflow-hidden border-slate-200/90 p-5 shadow-sm sm:p-6"
    >
      <CardHeader className="items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-lg" />
      </CardHeader>
      <CardContent className="mt-7">
        <Skeleton className="h-14 w-36 sm:h-16" />
        <Skeleton className="mt-3 h-4 w-28" />
        <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
