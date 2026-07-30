import type { ReactNode } from "react";

import { InfoTooltip } from "~/components/ui/info-tooltip";
import { cn } from "~/lib/utils";

export type AssetMetricContextLine = {
  text: string;
  tone?: "muted" | "warning";
};

export type AssetKpiItemProps = {
  label: string;
  iconSrc: string;
  tooltip: ReactNode;
  value: string;
  valueAvailable?: boolean;
  supportingText?: ReactNode;
  context?: readonly AssetMetricContextLine[];
  className?: string;
};

export type AssetMetricContentProps = Omit<AssetKpiItemProps, "className"> & {
  headingLevel: 3 | 4;
};

export function AssetMetricContent({
  label,
  iconSrc,
  tooltip,
  value,
  valueAvailable = true,
  supportingText,
  context,
  headingLevel,
}: AssetMetricContentProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <>
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25">
          <img src={iconSrc} alt="" aria-hidden="true" className="size-4" />
        </span>
        <Heading className="min-w-0 text-xs font-semibold leading-5 text-slate-700">
          {label}
        </Heading>
        <InfoTooltip
          accessibleLabel={`More information about ${label.toLowerCase()}`}
          content={tooltip}
        />
      </div>
      <p
        className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums"
        aria-label={valueAvailable ? undefined : "Value unavailable"}
      >
        {value}
      </p>
      {supportingText !== undefined && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{supportingText}</p>
      )}
      {context !== undefined && (
        <div className="mt-2 space-y-1">
          {context.map((line) => (
            <p
              key={line.text}
              className={`text-xs leading-4 tabular-nums ${
                line.tone === "warning" ? "font-medium text-orange-600" : "text-slate-500"
              }`}
            >
              {line.text}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

export function AssetKpiItem({ className = "", ...props }: AssetKpiItemProps) {
  return (
    <article className={cn("min-w-0 py-5 sm:px-5", className)}>
      <AssetMetricContent {...props} headingLevel={3} />
    </article>
  );
}
