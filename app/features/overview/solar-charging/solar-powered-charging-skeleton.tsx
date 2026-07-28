import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function SolarPoweredChargingSkeleton() {
  return (
    <Card
      aria-label="Loading solar-powered charging KPI"
      aria-busy="true"
      className="overflow-hidden border-slate-200/90 p-5 shadow-panel sm:p-6"
    >
      <CardHeader className="items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-4 w-40 max-w-[45vw]" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="mt-7">
        <Skeleton className="h-14 w-36 sm:h-16" />
        <Skeleton className="mt-4 h-4 w-full max-w-72" />
        <Skeleton className="mt-7 h-2.5 w-full rounded-full" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
