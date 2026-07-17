import { FaBatteryHalf, FaBolt, FaChartSimple, FaCircleCheck, FaSolarPanel } from "react-icons/fa6";

import SectionHeading from "~/components/dashboard/section-heading";
import type { EnergyRecord, ZymplerAction } from "~/data/zympler-actions";
import { getDailyZymplerActions, getGridCapacityMetrics } from "~/data/zympler-actions";

const ACTION_ICONS: Record<ZymplerAction["id"], typeof FaBolt> = {
  "grid-charging": FaBolt,
  "battery-supply": FaBatteryHalf,
  "solar-usage": FaSolarPanel,
  "grid-optimisation": FaChartSimple,
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function formatPower(watts: number | null): string {
  return watts === null ? "—" : `${numberFormat.format(watts / 1_000)} kW`;
}

const panelClassName =
  "status-card group relative overflow-hidden rounded-2xl border border-secondary-blue/15 bg-slate-900/90 p-6 shadow-[0_22px_55px_-30px_rgba(0,62,208,0.9)] transition duration-300 hover:-translate-y-1 hover:border-mint/35 hover:shadow-[0_26px_65px_-28px_rgba(0,255,166,0.28)] motion-reduce:transform-none motion-reduce:transition-none sm:p-7";

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

export default function ZymplerActionsSection({
  plan,
  telemetry,
}: {
  plan: readonly EnergyRecord[];
  telemetry: readonly EnergyRecord[];
}) {
  const capacity = getGridCapacityMetrics(plan);
  const actions = getDailyZymplerActions(plan, telemetry.length > 0 ? telemetry : plan);
  const isExceeded = capacity.status === "exceeded";
  const isUnavailable = capacity.status === "unavailable";
  const capacityDetail = isExceeded
    ? `${formatPower(capacity.exceededByWatts)} over limit`
    : capacity.availableHeadroomWatts === null
      ? "Capacity data unavailable"
      : `${formatPower(capacity.availableHeadroomWatts)} available`;

  return (
    <section aria-labelledby="zympler-actions-heading" className="mt-14 sm:mt-18">
      <SectionHeading id="zympler-actions-heading">Zympler Actions Today</SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-8 lg:gap-6">
        <article className={`${panelClassName} md:col-span-3`}>
          <PanelAccent />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-white">Grid Capacity</h3>
              <span
                className={`inline-flex items-center gap-2 text-xs font-medium ${isUnavailable ? "text-slate-400" : isExceeded ? "text-red-300" : "text-mint"}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${isUnavailable ? "bg-slate-500" : isExceeded ? "bg-red-400" : "bg-mint shadow-[0_0_10px_rgba(0,255,166,0.55)]"}`}
                />
                {isUnavailable ? "Unavailable" : isExceeded ? "Limit exceeded" : "Within limit"}
              </span>
            </div>

            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Peak planned load</dt>
                <dd className="font-medium text-slate-100">
                  {formatPower(capacity.peakPlannedLoadWatts)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Contract limit</dt>
                <dd className="font-medium text-slate-100">
                  {formatPower(capacity.contractLimitWatts)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Available headroom</dt>
                <dd className="font-medium text-slate-100">
                  {formatPower(capacity.availableHeadroomWatts)}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-secondary-blue/10 pt-6">
              <div className="flex items-end justify-between gap-4 text-sm">
                <span className="text-slate-400">Capacity used</span>
                <span className="font-medium text-slate-100">
                  {formatPower(capacity.peakPlannedLoadWatts)} /{" "}
                  {formatPower(capacity.contractLimitWatts)}
                </span>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
                role="progressbar"
                aria-label="Planned grid capacity utilisation"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(capacity.progressPercentage)}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none ${isExceeded ? "bg-red-400" : "bg-linear-to-r from-azure-400 to-mint"}`}
                  style={{ width: `${capacity.progressPercentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {capacity.utilisationPercentage === null
                  ? capacityDetail
                  : `${Math.round(capacity.utilisationPercentage)}% utilised · ${capacityDetail}`}
              </p>
            </div>
          </div>
        </article>

        <article className={`${panelClassName} md:col-span-5`} style={{ animationDelay: "90ms" }}>
          <PanelAccent />
          <div className="relative">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Today&apos;s Actions
            </h3>

            {actions.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {actions.map((action) => {
                  const ActionIcon = ACTION_ICONS[action.id];
                  return (
                    <li
                      key={action.id}
                      className="flex min-h-24 gap-3 rounded-xl border border-secondary-blue/10 bg-slate-800/55 p-4 transition-colors hover:border-mint/25 hover:bg-slate-800/80 motion-reduce:transition-none"
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mint/20 bg-mint/8 text-mint">
                        <ActionIcon aria-hidden="true" className="h-4 w-4" />
                        <FaCircleCheck
                          aria-hidden="true"
                          className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-slate-900 text-mint"
                        />
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
