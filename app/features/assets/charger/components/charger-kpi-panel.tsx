import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";
import { EmptyState } from "~/components/ui/content-state";
import {
  AssetBreakdownItem,
  AssetBreakdownSection,
  AssetKpiItem,
  AssetKpiPanel,
} from "../../shared";

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

export function ChargerKpiPanel({ periodLabel, summary, showBreakdown }: ChargerKpiPanelProps) {
  return (
    <AssetKpiPanel title="Charger performance" periodLabel={periodLabel}>
      {summary.measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Charger data is available for the selected period." />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <AssetKpiItem
              label="Solar charging"
              iconSrc={solarIcon}
              tooltip="Percentage of total charged energy supplied directly by solar during the selected period."
              value={formatChargerPercentage(summary.solarChargingPercentage)}
              valueAvailable={summary.solarChargingPercentage !== null}
            />
            <AssetKpiItem
              label="Charged energy"
              iconSrc={chargerIcon}
              tooltip="Total energy delivered to the chargers during the selected period."
              value={formatChargerEnergy(summary.totalChargedKwh)}
            />
          </div>
          {showBreakdown && (
            <AssetBreakdownSection title="Breakdown">
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {summary.breakdown.map((item) => {
                  const presentation = BREAKDOWN_PRESENTATION[item.id];
                  return (
                    <AssetBreakdownItem
                      key={item.id}
                      {...presentation}
                      value={formatChargerEnergy(item.energyKwh)}
                      supportingText={`${formatChargerPercentage(item.percentage)} of charged energy`}
                    />
                  );
                })}
              </ul>
            </AssetBreakdownSection>
          )}
        </>
      )}
    </AssetKpiPanel>
  );
}
