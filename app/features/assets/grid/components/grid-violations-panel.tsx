import { AlertTriangle } from "lucide-react";

import { formatGridValue } from "../lib/format-grid-chart";
import type { GridCapacityViolation } from "../types/grid-types";

type GridViolationsPanelProps = {
  violations: readonly GridCapacityViolation[];
  highlightedId: string | null;
  onSelect: (violation: GridCapacityViolation) => void;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function GridViolationsPanel({
  violations,
  highlightedId,
  onSelect,
}: GridViolationsPanelProps) {
  return (
    <aside className="flex min-h-[24rem] flex-col rounded-xl border border-rose-100 bg-rose-50/40 lg:w-80 lg:shrink-0">
      <header className="flex items-center gap-2 border-b border-rose-100 px-4 py-3">
        <AlertTriangle className="size-4 text-rose-600" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Capacity violations</h3>
          <p className="text-[0.6875rem] text-slate-500">
            Newest first · {violations.length} total
          </p>
        </div>
      </header>
      {violations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
          No capacity violations found.
        </div>
      ) : (
        <div className="max-h-[24rem] flex-1 overflow-y-auto overscroll-contain p-2">
          {violations.map((violation) => (
            <button
              key={violation.id}
              type="button"
              aria-current={highlightedId === violation.id ? "true" : undefined}
              onClick={() => onSelect(violation)}
              className="mb-1 w-full rounded-lg border border-transparent p-3 text-left transition-colors hover:border-rose-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-500 aria-current:border-rose-300 aria-current:bg-white aria-current:shadow-sm"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-800">
                  {formatDate(violation.timestamp)}
                </span>
                <span className="text-xs tabular-nums text-slate-500">
                  {formatTime(violation.timestamp)}
                </span>
              </span>
              <span className="mt-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-rose-700">
                  {violation.direction}
                </span>
                <span className="text-xs font-semibold tabular-nums text-rose-700">
                  {formatGridValue(violation.measuredKw, "power")}
                </span>
              </span>
              <span className="mt-1.5 block text-[0.6875rem] text-slate-500">
                Limit {formatGridValue(violation.limitKw, "power")} · exceeded by{" "}
                {formatGridValue(violation.exceededByKw, "power")}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
