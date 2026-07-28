import { InfoTooltip } from "~/components/ui/info-tooltip";

import type { GridBreakdownPresentationItem } from "../types/grid-kpi-types";

type GridBreakdownItemProps = {
  item: GridBreakdownPresentationItem;
};

export function GridBreakdownItem({ item }: GridBreakdownItemProps) {
  return (
    <li className="min-w-0 border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0">
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25 text-brand-blue">
          <img src={item.iconSrc} alt="" aria-hidden="true" className="size-4" />
        </span>
        <h4 className="min-w-0 text-xs font-semibold leading-5 text-slate-700">{item.label}</h4>
        <InfoTooltip accessibleLabel={item.accessibleLabel} content={item.tooltip} />
      </div>
      <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums">
        {item.value}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-slate-500" aria-label={item.percentageText}>
        {item.percentageText}
      </p>
    </li>
  );
}
