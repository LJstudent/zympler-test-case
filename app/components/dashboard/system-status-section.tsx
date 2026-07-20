import type { ContentState } from "~/components/common/content-state";
import { SystemInfoPanel } from "~/components/system-info/system-info-panel";
import type { SupportedLocale } from "~/components/system-info/system-status-labels";

type SystemStatusSectionProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  locale?: SupportedLocale;
};

export function SystemStatusSection({
  state = "ready",
  errorMessage,
  onRetry,
  locale = "en",
}: SystemStatusSectionProps) {
  return (
    <section aria-labelledby="system-status-heading">
      <SystemInfoPanel
        state={state}
        errorMessage={errorMessage}
        onRetry={onRetry}
        locale={locale}
      />
    </section>
  );
}
