import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";
import solarIcon from "~/assets/systems/solar.svg";
import { EmptyState } from "~/components/ui/content-state";
import { formatEnergy } from "~/features/energy-data";
import {
  AssetBreakdownItem,
  AssetBreakdownSection,
  AssetKpiItem,
  AssetKpiPanel,
} from "../../shared";
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

export function SolarKpiPanel({ periodLabel, summary, showBreakdown }: SolarKpiPanelProps) {
  return (
    <AssetKpiPanel title="Solar performance" periodLabel={periodLabel}>
      {summary.measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Solar data is available for the selected period." />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <AssetKpiItem
              label="Solar used locally"
              iconSrc={solarIcon}
              value={percentage(summary.localUsePercentage)}
              tooltip="Own use plus solar energy sent to chargers and batteries, divided by total solar production."
              supportingText={`${formatEnergy(summary.localUseKwh)} used locally`}
            />
            <AssetKpiItem
              label="Exported"
              iconSrc={solarIcon}
              value={percentage(summary.exportedPercentage)}
              tooltip="Solar energy sent to the grid, divided by total solar production."
              supportingText={`${formatEnergy(summary.exportedKwh)} exported`}
            />
          </div>
          {showBreakdown && (
            <AssetBreakdownSection title="Breakdown">
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {summary.breakdown.map((flow) => {
                  const presentation = FLOW_PRESENTATION[flow.id];
                  return (
                    <AssetBreakdownItem
                      key={flow.id}
                      {...presentation}
                      value={formatEnergy(flow.energyKwh)}
                      supportingText={
                        flow.id !== "solarToGrid"
                          ? `Estimated value ${formatAssetMoney(flow.estimatedValue)}`
                          : undefined
                      }
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
