import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import { InfoTooltip } from "~/components/ui/info-tooltip";
import { Separator } from "~/components/ui/separator";

import { formatChargerEnergy, formatChargerPercentage } from "../lib/format-charger-kpi";
import type { ChargerKpiSummary } from "../types/charger-kpi-types";
import type { ChargerBreakdownSeriesKey } from "../types/charger-types";

type ChargerKpiPanelProps = {
  periodLabel: string;
  summary: ChargerKpiSummary;
  showBreakdown: boolean;
};

type KpiPresentation = {
  label: string;
  iconSrc: string;
  tooltip: string;
};

const BREAKDOWN_PRESENTATION: Record<ChargerBreakdownSeriesKey, KpiPresentation> = {
  solarToCharger: {
    label: "Solar → Charger",
    iconSrc: solarIcon,
    tooltip: "Solar energy supplied directly to the chargers during the selected period.",
  },
  batterySolarToCharger: {
    label: "Battery → Charger (Solar)",
    iconSrc: batteryIcon,
    tooltip:
      "Solar-origin energy supplied from the battery to the chargers during the selected period.",
  },
  batteryGridToCharger: {
    label: "Battery → Charger (Grid)",
    iconSrc: batteryIcon,
    tooltip:
      "Grid-origin energy supplied from the battery to the chargers during the selected period.",
  },
  gridToCharger: {
    label: "Grid → Charger",
    iconSrc: gridIcon,
    tooltip: "Grid energy supplied directly to the chargers during the selected period.",
  },
};

function KpiItem({
  label,
  iconSrc,
  tooltip,
  value,
  supportingText,
}: KpiPresentation & { value: string; supportingText?: string }) {
  return (
    <article className="min-w-0 py-5 sm:px-5">
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25">
          <img src={iconSrc} alt="" aria-hidden="true" className="size-4" />
        </span>
        <h3 className="min-w-0 text-xs font-semibold leading-5 text-slate-700">{label}</h3>
        <InfoTooltip
          accessibleLabel={`More information about ${label.toLowerCase()}`}
          content={tooltip}
        />
      </div>
      <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums">
        {value}
      </p>
      {supportingText !== undefined && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{supportingText}</p>
      )}
    </article>
  );
}

export function ChargerKpiPanel({ periodLabel, summary, showBreakdown }: ChargerKpiPanelProps) {
  return (
    <Card className="overflow-hidden p-5 shadow-panel sm:p-6">
      <header>
        <h2 className="text-base font-semibold text-slate-950">Charger performance</h2>
        <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
      </header>
      {summary.measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Charger data is available for the selected period." />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <KpiItem
              label="Solar charging"
              iconSrc={solarIcon}
              tooltip="Percentage of total charged energy supplied directly by solar during the selected period."
              value={formatChargerPercentage(summary.solarChargingPercentage)}
            />
            <KpiItem
              label="Charged energy"
              iconSrc={chargerIcon}
              tooltip="Total energy delivered to the chargers during the selected period."
              value={formatChargerEnergy(summary.totalChargedKwh)}
            />
          </div>
          {showBreakdown && (
            <section aria-labelledby="charger-breakdown-title">
              <Separator className="my-6" />
              <h3 id="charger-breakdown-title" className="text-sm font-semibold text-slate-950">
                Breakdown
              </h3>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {summary.breakdown.map((item) => {
                  const presentation = BREAKDOWN_PRESENTATION[item.id];
                  return (
                    <li
                      key={item.id}
                      className="min-w-0 border-t border-slate-100 first:border-t-0 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0"
                    >
                      <KpiItem
                        {...presentation}
                        value={formatChargerEnergy(item.energyKwh)}
                        supportingText={`${formatChargerPercentage(item.percentage)} of charged energy`}
                      />
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
