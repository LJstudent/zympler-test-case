import { InfoTooltip } from "~/components/ui/info-tooltip";

import type { GridKpiPresentationItem } from "../types/grid-kpi-types";

type GridKpiItemProps = {
  item: GridKpiPresentationItem;
  desktopSpanClassName: "xl:col-span-3" | "xl:col-span-4";
};

export function GridKpiItem({ item, desktopSpanClassName }: GridKpiItemProps) {
  return (
    <div
      className={`min-w-0 border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0 ${desktopSpanClassName}`}
    >
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25 text-brand-blue">
          <img src={item.iconSrc} alt="" aria-hidden="true" className="size-4" />
        </span>
        <h3 className="min-w-0 text-xs font-semibold leading-5 text-slate-700">{item.label}</h3>
        <InfoTooltip accessibleLabel={item.accessibleLabel} content={item.tooltip} />
      </div>
      <p
        className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums"
        aria-label={item.valueAvailable ? undefined : "Value unavailable"}
      >
        {item.value}
      </p>
      {item.supportingText !== undefined && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.supportingText}</p>
      )}
      {item.context !== undefined && (
        <div className="mt-2 space-y-1">
          {item.context.map((line) => (
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
    </div>
  );
}
