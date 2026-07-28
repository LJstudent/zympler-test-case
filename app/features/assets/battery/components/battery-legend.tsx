import type { BatteryChartSeries, BatteryEnergySeriesKey } from "../types/battery-types";

type LegendButtonProps = {
  item: BatteryChartSeries;
  active: boolean;
  onClick: () => void;
};

function LegendButton({ item, active, onClick }: LegendButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md text-xs text-slate-500 transition-opacity hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <span
        className={`${item.kind === "line" ? "h-0 w-4 border-t-2 border-dashed" : "size-2.5 rounded-sm"} transition-opacity`}
        style={
          item.kind === "line"
            ? { borderColor: item.color, opacity: active ? 1 : 0.25 }
            : { backgroundColor: item.color, opacity: active ? 1 : 0.25 }
        }
        aria-hidden="true"
      />
      <span className={active ? undefined : "opacity-45 line-through"}>{item.label}</span>
    </button>
  );
}

type BatteryLegendProps = {
  energySeries: readonly BatteryChartSeries[];
  profitSeries?: BatteryChartSeries;
  hiddenEnergyKeys: ReadonlySet<BatteryEnergySeriesKey>;
  profitVisible: boolean;
  onToggleEnergy: (key: BatteryEnergySeriesKey) => void;
  onToggleProfit: () => void;
};

export function BatteryLegend({
  energySeries,
  profitSeries,
  hiddenEnergyKeys,
  profitVisible,
  onToggleEnergy,
  onToggleProfit,
}: BatteryLegendProps) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-4" aria-label="Battery chart legend">
      <div>
        <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Energy
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {energySeries.map((item) => (
            <LegendButton
              key={item.key}
              item={item}
              active={!hiddenEnergyKeys.has(item.key as BatteryEnergySeriesKey)}
              onClick={() => onToggleEnergy(item.key as BatteryEnergySeriesKey)}
            />
          ))}
        </div>
      </div>
      {profitSeries !== undefined && (
        <div>
          <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Financial
          </p>
          <LegendButton item={profitSeries} active={profitVisible} onClick={onToggleProfit} />
        </div>
      )}
    </div>
  );
}
