import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";
import solarIcon from "~/assets/systems/solar.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import { InfoTooltip } from "~/components/ui/info-tooltip";
import { Separator } from "~/components/ui/separator";
import { formatEnergy } from "~/features/energy-data";
import { formatAssetMoney } from "../../shared/lib/format-asset-chart";

import type { SolarFlowId, SolarKpiSummary } from "../types/solar-types";

type SolarKpiPanelProps = {
  periodLabel: string;
  summary: SolarKpiSummary;
  showBreakdown: boolean;
};

const FLOW_PRESENTATION: Record<SolarFlowId, { label: string; iconSrc: string; tooltip: string }> =
  {
    ownUse: {
      label: "Own use",
      iconSrc: solarIcon,
      tooltip: "Solar energy consumed directly on site.",
    },
    solarToCharger: {
      label: "Solar → Charger",
      iconSrc: chargerIcon,
      tooltip: "Solar energy supplied directly to connected EV chargers.",
    },
    solarToBattery: {
      label: "Solar → Battery",
      iconSrc: batteryIcon,
      tooltip: "Solar energy stored in the battery.",
    },
    solarToGrid: {
      label: "Solar → Grid",
      iconSrc: gridIcon,
      tooltip: "Solar energy exported to the grid.",
    },
  };

function percentage(value: number): string {
  return `${value.toLocaleString("en", { maximumFractionDigits: 1 })}%`;
}

function Kpi({
  label,
  value,
  energyKwh,
  tooltip,
  supportingLabel,
}: {
  label: string;
  value: string;
  energyKwh: number;
  tooltip: string;
  supportingLabel: string;
}) {
  return (
    <article className="min-w-0 py-5 sm:px-5">
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25">
          <img src={solarIcon} alt="" aria-hidden="true" className="size-4" />
        </span>
        <h3 className="text-xs font-semibold text-slate-700">{label}</h3>
        <InfoTooltip
          accessibleLabel={`More information about ${label.toLowerCase()}`}
          content={tooltip}
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">
        {formatEnergy(energyKwh)} {supportingLabel}
      </p>
    </article>
  );
}

export function SolarKpiPanel({ periodLabel, summary, showBreakdown }: SolarKpiPanelProps) {
  return (
    <Card className="overflow-hidden p-5 shadow-panel sm:p-6">
      <header>
        <h2 className="text-base font-semibold text-slate-950">Solar performance</h2>
        <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
      </header>
      {summary.measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Solar data is available for the selected period." />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <Kpi
              label="Solar used locally"
              value={percentage(summary.localUsePercentage)}
              energyKwh={summary.localUseKwh}
              tooltip="Own use plus solar energy sent to chargers and batteries, divided by total solar production."
              supportingLabel="used locally"
            />
            <Kpi
              label="Exported"
              value={percentage(summary.exportedPercentage)}
              energyKwh={summary.exportedKwh}
              tooltip="Solar energy sent to the grid, divided by total solar production."
              supportingLabel="exported"
            />
          </div>
          {showBreakdown && (
            <section aria-labelledby="solar-breakdown-title">
              <Separator className="my-6" />
              <h3 id="solar-breakdown-title" className="text-sm font-semibold text-slate-950">
                Breakdown
              </h3>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {summary.breakdown.map((flow) => {
                  const presentation = FLOW_PRESENTATION[flow.id];
                  return (
                    <li
                      key={flow.id}
                      className="min-w-0 border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0"
                    >
                      <div className="flex min-h-8 items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25">
                          <img
                            src={presentation.iconSrc}
                            alt=""
                            aria-hidden="true"
                            className="size-4"
                          />
                        </span>
                        <h4 className="text-xs font-semibold text-slate-700">
                          {presentation.label}
                        </h4>
                        <InfoTooltip
                          accessibleLabel={`More information about ${presentation.label.toLowerCase()}`}
                          content={presentation.tooltip}
                        />
                      </div>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums">
                        {formatEnergy(flow.energyKwh)}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500">
                        Estimated value {formatAssetMoney(flow.estimatedValue)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </Card>
  );
}
