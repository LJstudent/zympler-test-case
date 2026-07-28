import type { AssetChartSeries } from "../types/asset-detail-types";

type AssetLegendProps<Key extends string> = {
  series: readonly AssetChartSeries<Key>[];
  hiddenKeys: ReadonlySet<Key>;
  onToggle: (key: Key) => void;
};

export function AssetLegend<Key extends string>({
  series,
  hiddenKeys,
  onToggle,
}: AssetLegendProps<Key>) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Chart legend">
      {series.map((item) => {
        const hidden = hiddenKeys.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={!hidden}
            onClick={() => onToggle(item.key)}
            className="inline-flex items-center gap-2 rounded-md text-xs text-slate-500 transition-opacity hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <span
              className="size-2.5 rounded-sm transition-opacity"
              style={{ backgroundColor: item.color, opacity: hidden ? 0.25 : 1 }}
            />
            <span className={hidden ? "opacity-45 line-through" : undefined}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
