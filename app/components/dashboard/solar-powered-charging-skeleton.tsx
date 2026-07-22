import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function SolarPoweredChargingSkeleton() {
  return (
    <Card
      aria-label="Loading solar-powered charging KPI"
      aria-busy="true"
      className="overflow-hidden border-slate-200/90 p-5 shadow-panel sm:p-6"
    >
      <CardHeader className="items-start gap-4">
        <div>
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </CardHeader>
      <CardContent className="mt-6">
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
