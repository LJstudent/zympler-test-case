import type { ContentState } from "~/components/ui/content-state";

import { SystemInfoPanel } from "./system-info-panel";
import type { SupportedLocale } from "./system-status-labels";

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
