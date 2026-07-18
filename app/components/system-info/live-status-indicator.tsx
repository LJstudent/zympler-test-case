import type { SystemAvailability } from "~/types/system-status";

type LiveStatusIndicatorProps = {
  status: SystemAvailability;
};

export function LiveStatusIndicator({ status }: LiveStatusIndicatorProps) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
      aria-label="Status: Online"
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        <span className="absolute inset-0 animate-status-pulse rounded-full bg-brand-green/45 motion-reduce:animate-none" />
        <span className="relative m-auto size-2 rounded-full bg-emerald-500" />
      </span>
      {status === "online" ? "Online" : status}
    </span>
  );
}
