import { useState } from "react";
import {
  FaArrowRightArrowLeft,
  FaBatteryHalf,
  FaBolt,
  FaChartSimple,
  FaCircleCheck,
  FaSolarPanel,
  FaTriangleExclamation,
} from "react-icons/fa6";

import SectionHeading from "~/components/dashboard/section-heading";
import type {
  CapacityDirection,
  CapacityMode,
  EnergyRecord,
  GridCapacityMetrics,
  ZymplerAction,
} from "~/data/zympler-actions";
import {
  formatDashboardTime,
  formatPower,
  getDailyZymplerActions,
  getGridExportCapacityMetrics,
  getGridImportCapacityMetrics,
} from "~/data/zympler-actions";

const ACTION_ICONS: Record<ZymplerAction["id"], typeof FaBolt> = {
  "grid-charging": FaBolt,
  "battery-supply": FaBatteryHalf,
  "solar-usage": FaSolarPanel,
  "grid-import": FaChartSimple,
  "grid-export": FaArrowRightArrowLeft,
  "capacity-warning": FaTriangleExclamation,
};

const panelClassName =
  "status-card group relative overflow-hidden rounded-2xl border border-secondary-blue/15 bg-slate-900/90 p-6 shadow-[0_22px_55px_-30px_rgba(0,62,208,0.9)] transition duration-300 hover:-translate-y-1 hover:border-mint/35 hover:shadow-[0_26px_65px_-28px_rgba(0,255,166,0.28)] motion-reduce:transform-none motion-reduce:transition-none sm:p-7";

const STATUS_LABELS = {
  "within-limit": "Within limit",
  "approaching-limit": "Approaching limit",
  exceeded: "Limit exceeded",
  unavailable: "Unavailable",
} as const;

function PanelAccent() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-mint/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-azure/10 blur-3xl transition-colors group-hover:bg-mint/10 motion-reduce:transition-none"
      />
    </>
  );
}

function CapacityBlock({
  direction,
  metrics,
  mode,
}: {
  direction: CapacityDirection;
  metrics: GridCapacityMetrics;
  mode: CapacityMode;
}) {
  const point = metrics.maximumUtilisationPoint;
  const isExceeded = metrics.status === "exceeded";
  const isWarning = metrics.status === "approaching-limit";
  const statusColour = isExceeded
    ? "text-red-300"
    : isWarning
      ? "text-amber-300"
      : point
        ? "text-mint"
        : "text-slate-400";
  const dotColour = isExceeded
    ? "bg-red-400"
    : isWarning
      ? "bg-amber-300"
      : point
        ? "bg-mint shadow-[0_0_10px_rgba(0,255,166,0.55)]"
        : "bg-slate-500";

  return (
    <div className="rounded-xl border border-secondary-blue/10 bg-slate-800/45 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium text-slate-100">
          Grid {direction === "import" ? "Import" : "Export"}
        </h4>
        <span className={`inline-flex items-center gap-2 text-xs font-medium ${statusColour}`}>
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotColour}`} />
          {STATUS_LABELS[metrics.status]}
        </span>
      </div>

      {point ? (
        <div className="mt-5">
          <p className="text-xs text-slate-400">Maximum capacity used</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-white">
            {formatPower(point.powerWatts)}
            <span className="font-normal text-slate-500"> / </span>
            {formatPower(point.limitWatts)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            at {formatDashboardTime(point.timestamp)} local time
          </p>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700/70"
            role="progressbar"
            aria-label={`${mode === "planned" ? "Planned" : "Actual"} grid ${direction} capacity utilisation`}
            aria-valuemin={0}
            aria-valuemax={Math.max(100, Math.ceil(point.utilisationPercentage))}
            aria-valuenow={Math.round(point.utilisationPercentage)}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none ${isExceeded ? "bg-red-400" : isWarning ? "bg-amber-300" : "bg-linear-to-r from-azure-400 to-mint"}`}
              style={{ width: `${point.visualPercentage}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs">
            <span
              className={
                isExceeded ? "text-red-300" : isWarning ? "text-amber-300" : "text-slate-300"
              }
            >
              {Math.round(point.utilisationPercentage)}% utilised
            </span>
            <span className="text-slate-400">
              {isExceeded
                ? `Limit exceeded by ${formatPower(point.exceededByWatts)}`
                : `${formatPower(point.headroomWatts)} available`}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-400">
          No {mode === "actual" ? "actual" : "planned"} data available for this direction.
        </p>
      )}
    </div>
  );
}

export default function ZymplerActionsSection({
  plan,
  telemetry,
}: {
  plan: readonly EnergyRecord[];
  telemetry: readonly EnergyRecord[];
}) {
  const [mode, setMode] = useState<CapacityMode>("planned");
  const selectedRecords = mode === "planned" ? plan : telemetry;
  const importMetrics = getGridImportCapacityMetrics(selectedRecords);
  const exportMetrics = getGridExportCapacityMetrics(selectedRecords);
  const actions = getDailyZymplerActions(plan);
  const hasSelectedData =
    importMetrics.maximumUtilisationPoint !== null ||
    exportMetrics.maximumUtilisationPoint !== null;

  return (
    <section aria-labelledby="zympler-actions-heading" className="mt-14 sm:mt-18">
      <SectionHeading id="zympler-actions-heading">Zympler Actions Today</SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
        <article className={panelClassName}>
          <PanelAccent />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-white">Grid Capacity</h3>
              <div
                className="inline-flex rounded-lg border border-secondary-blue/15 bg-slate-950/55 p-1"
                role="group"
                aria-label="Grid capacity data"
              >
                {(["planned", "actual"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => setMode(option)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint motion-reduce:transition-none ${mode === option ? "bg-azure/35 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div id="grid-capacity-panel" aria-live="polite" className="mt-6">
              {!hasSelectedData && mode === "actual" ? (
                <div className="rounded-xl border border-secondary-blue/10 bg-slate-800/45 px-5 py-10 text-center text-sm text-slate-400">
                  No actual data available for this period.
                </div>
              ) : (
                <div className="grid gap-4">
                  <CapacityBlock direction="import" metrics={importMetrics} mode={mode} />
                  <CapacityBlock direction="export" metrics={exportMetrics} mode={mode} />
                </div>
              )}
            </div>
          </div>
        </article>

        <article className={panelClassName} style={{ animationDelay: "90ms" }}>
          <PanelAccent />
          <div className="relative">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Today&apos;s Actions
            </h3>

            {actions.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {actions.map((action, index) => {
                  const ActionIcon = ACTION_ICONS[action.id];
                  const isDanger = action.tone === "danger";
                  const isWarning = action.tone === "warning";
                  const toneClasses = isDanger
                    ? "border-red-400/25 bg-red-400/8 text-red-300"
                    : isWarning
                      ? "border-amber-300/25 bg-amber-300/8 text-amber-300"
                      : "border-mint/20 bg-mint/8 text-mint";
                  return (
                    <li
                      key={`${action.id}-${index}`}
                      className="flex min-h-24 gap-3 rounded-xl border border-secondary-blue/10 bg-slate-800/55 p-4 transition-colors hover:border-mint/25 hover:bg-slate-800/80 motion-reduce:transition-none"
                    >
                      <div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses}`}
                      >
                        <ActionIcon aria-hidden="true" className="h-4 w-4" />
                        {!isDanger && !isWarning && (
                          <FaCircleCheck
                            aria-hidden="true"
                            className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-slate-900 text-mint"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-5 text-slate-100">
                          {action.title}
                        </p>
                        {action.supportingValue && (
                          <p className="mt-1.5 text-xs leading-5 text-slate-400">
                            {action.supportingValue}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-6 rounded-xl border border-secondary-blue/10 bg-slate-800/45 px-5 py-10 text-center text-sm text-slate-400">
                No optimisation actions detected today.
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
