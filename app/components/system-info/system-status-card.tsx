import type { CSSProperties } from "react";

import { ErrorState } from "~/components/common/content-state";
import { Card } from "~/components/ui/card";
import type { SystemStatus } from "~/types/system-status";

import { LiveStatusIndicator } from "./live-status-indicator";
import { SYSTEM_STATUS_CARD_STYLES } from "./system-status-card-styles";
import { systemStatusTranslations } from "./system-status-labels";
import type { SupportedLocale } from "./system-status-labels";

type SystemStatusCardProps = {
  system: SystemStatus;
  entranceDelay: number;
  locale?: SupportedLocale;
  onRetry?: () => void;
};

export function SystemStatusCard({
  system,
  entranceDelay,
  locale = "en",
  onRetry,
}: SystemStatusCardProps) {
  const animationStyle = { "--entrance-delay": `${entranceDelay}ms` } as CSSProperties;
  const labels = systemStatusTranslations[locale];
  const systemName = labels.systemNames[system.id];
  const systemIdentity = (
    <div className={SYSTEM_STATUS_CARD_STYLES.identity}>
      <div className={SYSTEM_STATUS_CARD_STYLES.iconContainer}>
        <img className="size-5.5" src={system.iconSrc} alt="" aria-hidden="true" />
      </div>
      <h3 id={`${system.id}-name`} className={SYSTEM_STATUS_CARD_STYLES.systemName}>
        {systemName}
      </h3>
    </div>
  );

  return (
    <Card
      aria-labelledby={`${system.id}-name`}
      className={`animate-card-in ${SYSTEM_STATUS_CARD_STYLES.shell} ${SYSTEM_STATUS_CARD_STYLES.interactive} motion-reduce:animate-none`}
      style={animationStyle}
    >
      <div className={SYSTEM_STATUS_CARD_STYLES.topRow}>
        <LiveStatusIndicator
          status={system.status}
          visibleLabel={labels.online}
          accessibleLabel={
            system.status === "online"
              ? labels.onlineDescription(systemName)
              : `${systemName} status: ${system.status}`
          }
        />
      </div>

      {system.status === "error" ? (
        <div className="mt-4 space-y-3">
          {systemIdentity}
          <ErrorState message="Unable to load system status." onRetry={onRetry} compact />
        </div>
      ) : (
        <div className={SYSTEM_STATUS_CARD_STYLES.content}>
          {systemIdentity}

          <div className={SYSTEM_STATUS_CARD_STYLES.metrics}>
            <p className={SYSTEM_STATUS_CARD_STYLES.currentMetric}>
              {labels.errors(system.currentErrors)}
            </p>
            <p className={SYSTEM_STATUS_CARD_STYLES.historicalMetric}>
              {labels.lastThirtyDaysErrors(system.errorsLastThirtyDays)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
