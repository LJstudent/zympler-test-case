import { Skeleton } from "~/components/ui/skeleton";

export default function SystemStatusCardSkeleton() {
  return (
    <div
      className="min-h-64 rounded-2xl border border-secondary-blue/10 bg-slate-900/80 p-6 shadow-xl shadow-black/15"
      role="status"
      aria-label="Loading system status"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="mt-9 flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="mt-8 h-6 w-20" />
      <Skeleton className="mt-3 h-4 w-40" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
