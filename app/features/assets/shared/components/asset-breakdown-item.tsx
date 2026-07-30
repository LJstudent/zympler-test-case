import { AssetMetricContent, type AssetKpiItemProps } from "./asset-kpi-item";
import { cn } from "~/lib/utils";

export type AssetBreakdownItemProps = AssetKpiItemProps;

export function AssetBreakdownItem({ className = "", ...props }: AssetBreakdownItemProps) {
  return (
    <li
      className={cn(
        "min-w-0 border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0",
        className,
      )}
    >
      <AssetMetricContent {...props} headingLevel={4} />
    </li>
  );
}
