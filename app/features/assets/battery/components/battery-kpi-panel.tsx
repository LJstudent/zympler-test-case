import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import { InfoTooltip } from "~/components/ui/info-tooltip";
import { Separator } from "~/components/ui/separator";

import { BATTERY_TOOLTIP_DESCRIPTIONS } from "../constants/battery-constants";
import type { BatteryPresentation } from "../types/battery-types";

type BatteryKpiPanelProps = {
  periodLabel: string;
  measurementCount: number;
  showBreakdown: boolean;
  presentation: BatteryPresentation;
};

type BreakdownItem = {
  label: string;
  value: string;
  supporting: string;
  tooltip: string;
  iconSrc: string;
};

function BreakdownItemView({ item }: { item: BreakdownItem }) {
  return (
    <li className="min-w-0 border-t border-slate-100 py-5 first:border-t-0 sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+4)]:border-t-0">
      <div className="flex min-h-8 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/25">
          <img src={item.iconSrc} alt="" aria-hidden="true" className="size-4" />
        </span>
        <h4 className="text-xs font-semibold text-slate-700">{item.label}</h4>
        <InfoTooltip
          accessibleLabel={`More information about ${item.label.toLowerCase()}`}
          content={item.tooltip}
        />
      </div>
      <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.035em] text-brand-blue tabular-nums">
        {item.value}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.supporting}</p>
    </li>
  );
}

function CompactPerformance({ presentation }: { presentation: BatteryPresentation }) {
  return (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2">
      <article className="min-w-0 py-5 sm:px-5">
        <div className="flex min-h-8 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <img src={batteryIcon} alt="" aria-hidden="true" className="size-4" />
          </span>
          <h3 className="text-xs font-semibold text-slate-700">Profit</h3>
          <InfoTooltip
            accessibleLabel="More information about Profit"
            content={BATTERY_TOOLTIP_DESCRIPTIONS.compactProfit}
          />
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-emerald-700 tabular-nums">
          {presentation.totalProfitDisplay}
        </p>
        <p className="mt-1.5 text-xs text-slate-500">Revenue + Savings − Grid Charging Costs</p>
      </article>
      <dl className="grid content-center gap-3 border-t border-slate-100 py-5 sm:border-l sm:border-t-0 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs font-medium text-slate-500">Battery Import</dt>
          <dd className="text-sm font-semibold text-slate-800 tabular-nums">
            {presentation.totalBatteryImportDisplay}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs font-medium text-slate-500">Battery Export</dt>
          <dd className="text-sm font-semibold text-slate-800 tabular-nums">
            {presentation.totalBatteryExportDisplay}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function BatteryBreakdown({ presentation }: { presentation: BatteryPresentation }) {
  const imported: BreakdownItem[] = [
    {
      label: "Grid",
      value: presentation.totalGridToBatteryDisplay,
      supporting: `${presentation.gridToBatteryPercentageDisplay} of imported energy`,
      tooltip: "Energy supplied from the electricity grid to the battery.",
      iconSrc: gridIcon,
    },
    {
      label: "Solar",
      value: presentation.totalSolarToBatteryDisplay,
      supporting: `${presentation.solarToBatteryPercentageDisplay} of imported energy`,
      tooltip: "Energy supplied directly from solar generation to the battery.",
      iconSrc: solarIcon,
    },
  ];
  const exported: BreakdownItem[] = [
    {
      label: "Grid",
      value: presentation.totalBatteryToGridDisplay,
      supporting: `${presentation.batteryToGridPercentageDisplay} of exported energy`,
      tooltip: "Battery energy exported to the electricity grid.",
      iconSrc: gridIcon,
    },
    {
      label: "Charger",
      value: presentation.totalBatteryToChargerDisplay,
      supporting: `${presentation.batteryToChargerPercentageDisplay} of exported energy`,
      tooltip: "Battery energy supplied to EV chargers.",
      iconSrc: chargerIcon,
    },
    {
      label: "Own use",
      value: presentation.totalBatteryToOwnUseDisplay,
      supporting: `${presentation.batteryToOwnUsePercentageDisplay} of exported energy`,
      tooltip:
        "Battery energy used locally by the site, excluding energy supplied to EV chargers or exported to the grid.",
      iconSrc: batteryIcon,
    },
  ];
  const financial: BreakdownItem[] = [
    {
      label: "Profit",
      value: presentation.totalProfitDisplay,
      supporting: "Revenue + Savings − Grid Charging Costs",
      tooltip: BATTERY_TOOLTIP_DESCRIPTIONS.profit,
      iconSrc: batteryIcon,
    },
    {
      label: "Revenue",
      value: presentation.totalRevenueDisplay,
      supporting: `Supported by ${presentation.totalBatteryToGridDisplay} Battery → Grid`,
      tooltip: BATTERY_TOOLTIP_DESCRIPTIONS.revenue,
      iconSrc: gridIcon,
    },
    {
      label: "Savings",
      value: presentation.totalSavingsDisplay,
      supporting: `Charger ${presentation.totalBatteryToChargerDisplay} · Own use ${presentation.totalBatteryToOwnUseDisplay}`,
      tooltip: BATTERY_TOOLTIP_DESCRIPTIONS.savings,
      iconSrc: chargerIcon,
    },
    {
      label: "Costs",
      value: presentation.totalGridChargingCostsDisplay,
      supporting: `Grid → Battery · Solar → Battery: €0 electricity purchase cost`,
      tooltip:
        "Only electricity imported from the grid creates battery charging costs. Solar energy supplied to the battery has an electricity purchase cost of €0.",
      iconSrc: gridIcon,
    },
  ];

  return (
    <section aria-labelledby="battery-breakdown-title">
      <Separator className="my-6" />
      <h3 id="battery-breakdown-title" className="text-sm font-semibold text-slate-950">
        Battery Breakdown
      </h3>
      <div className="mt-3 space-y-6">
        <section aria-labelledby="battery-imported-title">
          <h4 id="battery-imported-title" className="text-xs font-semibold text-slate-500">
            Imported energy
          </h4>
          <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {imported.map((item) => (
              <BreakdownItemView key={item.label} item={item} />
            ))}
          </ul>
        </section>
        <section aria-labelledby="battery-exported-title">
          <h4 id="battery-exported-title" className="text-xs font-semibold text-slate-500">
            Exported energy
          </h4>
          <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {exported.map((item) => (
              <BreakdownItemView key={item.label} item={item} />
            ))}
          </ul>
        </section>
        <section aria-labelledby="battery-financial-title">
          <h4 id="battery-financial-title" className="text-xs font-semibold text-slate-500">
            Financial breakdown
          </h4>
          <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {financial.map((item) => (
              <BreakdownItemView key={item.label} item={item} />
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export function BatteryKpiPanel({
  periodLabel,
  measurementCount,
  showBreakdown,
  presentation,
}: BatteryKpiPanelProps) {
  return (
    <Card className="overflow-hidden p-5 shadow-panel sm:p-6">
      <header>
        <h2 className="text-base font-semibold text-slate-950">Battery performance</h2>
        <p className="mt-1 text-sm text-slate-500">Summary for {periodLabel}</p>
      </header>
      {measurementCount === 0 ? (
        <div className="mt-6">
          <EmptyState message="No Battery data is available for the selected period." />
        </div>
      ) : showBreakdown ? (
        <BatteryBreakdown presentation={presentation} />
      ) : (
        <CompactPerformance presentation={presentation} />
      )}
    </Card>
  );
}
