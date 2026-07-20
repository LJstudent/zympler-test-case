import type { SystemAvailability } from "~/types/system-status";

type LiveStatusIndicatorProps = {
  status: SystemAvailability;
  visibleLabel: string;
  accessibleLabel: string;
};

export function LiveStatusIndicator({
  status,
  visibleLabel,
  accessibleLabel,
}: LiveStatusIndicatorProps) {
  const isOnline = status === "online";

  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
      aria-label={accessibleLabel}
    >
      <span
        className={`size-2.5 shrink-0 rounded-full ${isOnline ? "animate-status-pulse bg-brand-green motion-reduce:animate-none" : "bg-slate-300"}`}
        aria-hidden="true"
      />
      {isOnline ? visibleLabel : status}
    </span>
  );
}
