import { useState } from "react";

import { GRID_LIMITS } from "~/lib/grid/detectGridViolations";
import type { GridViolation } from "~/types/grid-chart";

type GridLimitIndicatorsProps = {
  violations: readonly GridViolation[];
  domain: readonly [number, number];
  plotInsets: { top: number; right: number; bottom: number; left: number };
};

const powerFormatter = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export function GridLimitIndicators({ violations, domain, plotInsets }: GridLimitIndicatorsProps) {
  const [active, setActive] = useState<GridViolation | null>(null);
  const duration = domain[1] - domain[0];

  if (duration <= 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        top: plotInsets.top,
        right: plotInsets.right,
        bottom: plotInsets.bottom,
        left: plotInsets.left,
      }}
      aria-label={`${violations.length} grid limit violations`}
    >
      {violations.map((violation, index) => {
        const position = ((violation.timestamp - domain[0]) / duration) * 100;

        return (
          <button
            key={`${violation.timestamp}-${index}`}
            type="button"
            aria-label="Grid limit exceeded"
            onMouseEnter={() => setActive(violation)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(violation)}
            onBlur={() => setActive(null)}
            className="pointer-events-auto absolute top-0 h-full w-2 -translate-x-1/2 cursor-help border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-orange-500"
            style={{ left: `${position}%` }}
          >
            <span className="absolute top-0 left-1/2 h-full -translate-x-1/2 border-l border-dashed border-orange-500" />
          </button>
        );
      })}

      {active !== null && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-3 left-1/2 z-20 min-w-48 -translate-x-1/2 rounded-xl border border-orange-200 bg-white p-3 text-xs shadow-[0_14px_36px_rgb(15_23_42_/_0.16)]"
        >
          <p className="font-semibold text-slate-950">Grid limit exceeded</p>
          <dl className="mt-2 space-y-2">
            {active.importKw !== undefined && (
              <>
                <div className="flex justify-between gap-5">
                  <dt className="text-slate-500">Import</dt>
                  <dd className="font-semibold text-slate-900">
                    {powerFormatter.format(active.importKw)} kW
                  </dd>
                </div>
                <div className="flex justify-between gap-5">
                  <dt className="text-slate-500">Limit</dt>
                  <dd className="font-semibold text-slate-900">{GRID_LIMITS.importKw} kW</dd>
                </div>
              </>
            )}
            {active.exportKw !== undefined && (
              <>
                <div className="flex justify-between gap-5 border-t border-slate-100 pt-2">
                  <dt className="text-slate-500">Export</dt>
                  <dd className="font-semibold text-slate-900">
                    {powerFormatter.format(active.exportKw)} kW
                  </dd>
                </div>
                <div className="flex justify-between gap-5">
                  <dt className="text-slate-500">Limit</dt>
                  <dd className="font-semibold text-slate-900">{GRID_LIMITS.exportKw} kW</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
