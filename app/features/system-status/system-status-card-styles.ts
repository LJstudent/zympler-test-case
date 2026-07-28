import { INTERACTIVE_CARD_STYLES } from "~/components/ui/interactive-card-styles";

export const SYSTEM_STATUS_CARD_STYLES = {
  shell: "overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm",
  interactive: INTERACTIVE_CARD_STYLES,
  topRow: "flex items-center",
  content: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-3",
  identity: "flex min-w-0 flex-1 items-center gap-3",
  iconContainer:
    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light/35 text-brand-blue",
  systemName: "min-w-0 text-sm font-semibold text-slate-950",
  metrics: "ml-auto min-w-0 text-right",
  currentMetric: "text-sm font-semibold tabular-nums text-slate-900",
  historicalMetric: "mt-1 text-[0.6875rem] leading-4 tabular-nums text-slate-500",
} as const;
