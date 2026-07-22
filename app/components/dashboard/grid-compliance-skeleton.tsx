import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function PeakGroupSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
      <Skeleton className="h-2.5 w-12" />
      <div className="mt-3 flex justify-between gap-3">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-2 ml-auto h-3 w-24" />
      <Skeleton className="mt-2 ml-auto h-3 w-20" />
      <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
    </div>
  );
}

export function GridComplianceSkeleton() {
  return (
    <Card
      aria-label="Loading grid compliance KPI"
      aria-busy="true"
      className="h-full overflow-hidden border-slate-200/90 p-5 shadow-sm sm:p-6"
    >
      <CardHeader className="items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="mt-7">
        <Skeleton className="h-14 w-36 sm:h-16" />
        <Skeleton className="mt-4 h-4 w-full max-w-72" />
        <div className="mt-6 space-y-3 border-y border-slate-100 py-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PeakGroupSkeleton />
          <PeakGroupSkeleton />
        </div>
      </CardContent>
    </Card>
  );
}
