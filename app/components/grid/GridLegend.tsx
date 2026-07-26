import type { GridSeriesDefinition, GridSeriesKey } from "~/types/grid-chart";

type GridLegendProps = {
  series: readonly GridSeriesDefinition[];
  visibleKeys: ReadonlySet<GridSeriesKey>;
  onToggle: (key: GridSeriesKey) => void;
};

export function GridLegend({ series, visibleKeys, onToggle }: GridLegendProps) {
  return (
    <div
      className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-4 sm:px-6"
      aria-label="Grid chart series"
    >
      {series.map((item) => {
        const active = visibleKeys.has(item.key);

        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(item.key)}
            className={`group inline-flex items-center gap-2 rounded-md py-1 text-left text-xs transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
              active ? "text-slate-700" : "text-slate-400 opacity-60 hover:opacity-90"
            }`}
          >
            <span
              className="size-2.5 rounded-[3px] ring-1 ring-inset ring-black/5"
              style={{ backgroundColor: active ? item.color : "#cbd5e1" }}
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold">{item.label}</span>
              <span className="ml-1 text-slate-400">{item.detail}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
