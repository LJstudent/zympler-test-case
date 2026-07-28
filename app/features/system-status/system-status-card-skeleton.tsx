import { Skeleton } from "~/components/ui/skeleton";

import { SYSTEM_STATUS_CARD_STYLES } from "./system-status-card-styles";

export function SystemStatusCardSkeleton() {
  return (
    <div
      className={`${SYSTEM_STATUS_CARD_STYLES.shell} motion-reduce:animate-none`}
      aria-hidden="true"
    >
      <div className={SYSTEM_STATUS_CARD_STYLES.topRow}>
        <div className="flex items-center gap-2">
          <Skeleton className="size-2.5 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      <div className={SYSTEM_STATUS_CARD_STYLES.content}>
        <div className={SYSTEM_STATUS_CARD_STYLES.identity}>
          <div className={SYSTEM_STATUS_CARD_STYLES.iconContainer}>
            <Skeleton className="size-5.5 rounded-sm" />
          </div>

          <Skeleton className="h-4 w-16" />
        </div>

        <div className={SYSTEM_STATUS_CARD_STYLES.metrics}>
          <p className={SYSTEM_STATUS_CARD_STYLES.currentMetric}>
            <Skeleton className="ml-auto h-3 w-14" />
          </p>

          <p className={SYSTEM_STATUS_CARD_STYLES.historicalMetric}>
            <Skeleton className="ml-auto h-3 w-28" />
          </p>
        </div>
      </div>
    </div>
  );
}
