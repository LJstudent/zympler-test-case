import { BATTERY_TOOLTIP_DESCRIPTIONS } from "../constants/battery-constants";
import type { BatteryChartDatum, BatteryChartSeries } from "../types/battery-types";

type TooltipPayloadItem = { payload?: BatteryChartDatum };

type BatteryTooltipProps = {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  breakdown: boolean;
  series: readonly BatteryChartSeries[];
  raw: boolean;
};

function TooltipRow({
  label,
  value,
  color,
  emphasized = false,
  description,
}: {
  label: string;
  value: string;
  color?: string;
  emphasized?: boolean;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">
      <dt className={emphasized ? "font-medium text-slate-100" : "text-slate-300"}>
        <span className="flex items-center gap-2">
          {color !== undefined && (
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          )}
          {label}
          {description !== undefined && <span className="sr-only">. {description}</span>}
        </span>
      </dt>
      <dd className={`${emphasized ? "font-semibold" : "font-medium"} tabular-nums`}>{value}</dd>
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
      {children}
    </p>
  );
}

export function BatteryTooltip({
  active,
  payload: activePayload,
  breakdown,
  series,
  raw,
}: BatteryTooltipProps) {
  const point = activePayload?.[0]?.payload;
  if (active !== true || point === undefined) return null;
  const color = new Map(series.map((item) => [item.key, item.color]));

  return (
    <div className="min-w-72 rounded-xl border border-slate-700 bg-slate-950 p-3 text-white shadow-xl">
      <p className="mb-2 text-xs font-semibold">{point.tooltipTime}</p>
      <dl className="space-y-1.5">
        {breakdown ? (
          <>
            <div className="space-y-1.5">
              <GroupTitle>Incoming</GroupTitle>
              <TooltipRow
                label="Grid → Battery"
                value={point.gridToBatteryDisplay}
                color={color.get("gridToBattery")}
              />
              <TooltipRow
                label="Solar → Battery"
                value={point.solarToBatteryDisplay}
                color={color.get("solarToBattery")}
                description={BATTERY_TOOLTIP_DESCRIPTIONS.solarCharging}
              />
              <TooltipRow
                label="Total Battery Import"
                value={point.batteryImportDisplay}
                emphasized
              />
            </div>
            <div className="mt-2 space-y-1.5 border-t border-slate-700 pt-2">
              <GroupTitle>Outgoing</GroupTitle>
              <TooltipRow
                label="Battery → Grid"
                value={point.batteryToGridDisplay}
                color={color.get("batteryToGrid")}
              />
              <TooltipRow
                label="Battery → Charger"
                value={point.batteryToChargerDisplay}
                color={color.get("batteryToCharger")}
              />
              <TooltipRow
                label="Battery → Own Use"
                value={point.batteryToOwnUseDisplay}
                color={color.get("batteryToOwnUse")}
              />
              <TooltipRow
                label="Total Battery Export"
                value={point.batteryExportDisplay}
                emphasized
              />
            </div>
          </>
        ) : (
          <>
            <TooltipRow
              label="Battery Import"
              value={point.batteryImportDisplay}
              color={color.get("batteryImport")}
            />
            <TooltipRow
              label="Battery Export"
              value={point.batteryExportDisplay}
              color={color.get("batteryExport")}
            />
          </>
        )}
        {!raw && (
          <div className="mt-2 space-y-1.5 border-t border-slate-700 pt-2">
            <GroupTitle>Financial</GroupTitle>
            <TooltipRow
              label="Revenue"
              value={point.revenueDisplay}
              description={BATTERY_TOOLTIP_DESCRIPTIONS.revenue}
            />
            <TooltipRow
              label="Savings"
              value={point.savingsDisplay}
              description={BATTERY_TOOLTIP_DESCRIPTIONS.savings}
            />
            <TooltipRow
              label="Grid Charging Costs"
              value={point.gridChargingCostsDisplay}
              description={BATTERY_TOOLTIP_DESCRIPTIONS.costs}
            />
            <TooltipRow
              label="Period Profit"
              value={point.intervalProfitDisplay}
              description={BATTERY_TOOLTIP_DESCRIPTIONS.profit}
            />
            <TooltipRow
              label="Cumulative Profit"
              value={point.cumulativeProfitDisplay}
              color={color.get("cumulativeProfit")}
              emphasized
            />
          </div>
        )}
      </dl>
    </div>
  );
}
