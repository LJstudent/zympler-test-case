import { FaBatteryFull, FaChargingStation, FaCircleInfo, FaSolarPanel } from "react-icons/fa6";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { SystemId, SystemStatus } from "~/data/system-status";

const SYSTEM_ICONS: Record<SystemId, typeof FaSolarPanel> = {
  solar: FaSolarPanel,
  charger: FaChargingStation,
  battery: FaBatteryFull,
};

export default function SystemStatusCard({
  system,
  index,
}: {
  system: SystemStatus;
  index: number;
}) {
  const SystemIcon = SYSTEM_ICONS[system.id];
  const errorLabel = `${system.currentErrorCount} ${system.currentErrorCount === 1 ? "error" : "errors"}`;
  const historyLabel = `${system.lastThirtyDaysErrorCount} ${system.lastThirtyDaysErrorCount === 1 ? "error" : "errors"}`;

  return (
    <article
      className="status-card group relative min-h-64 overflow-hidden rounded-2xl border border-secondary-blue/15 bg-slate-900/90 p-6 shadow-[0_22px_55px_-30px_rgba(0,62,208,0.9)] transition duration-300 hover:-translate-y-1 hover:border-mint/35 hover:shadow-[0_26px_65px_-28px_rgba(0,255,166,0.28)] motion-reduce:transform-none motion-reduce:transition-none"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-mint/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-azure/10 blur-3xl transition-colors group-hover:bg-mint/10 motion-reduce:transition-none"
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-200">
          <span
            aria-hidden="true"
            className="status-live-indicator h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_12px_rgba(0,255,166,0.65)]"
          />
          <span>{system.statusLabel}</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`More information about ${system.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-secondary-blue/15 bg-slate-800/75 text-secondary-blue transition hover:border-mint/40 hover:text-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint motion-reduce:transition-none"
            >
              <FaCircleInfo aria-hidden="true" className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{system.tooltip}</TooltipContent>
        </Tooltip>
      </div>

      <div className="relative mt-9 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-azure/35 bg-azure/10 text-mint shadow-inner shadow-azure/15">
          <SystemIcon aria-hidden="true" className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-white">{system.name}</h3>
      </div>

      <div className="relative mt-8">
        <p className="text-lg font-medium text-slate-100">{errorLabel}</p>
        <p className="mt-1.5 text-sm text-slate-400">Last 30 days: {historyLabel}</p>
      </div>
    </article>
  );
}
