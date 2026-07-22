import { ArrowRight, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router";

import solarIcon from "~/assets/systems/solar.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { INTERACTIVE_CARD_STYLES } from "~/components/ui/interactive-card-styles";
import { formatEnergy } from "~/features/energy-data/format-energy";
import type { SolarChargingKpi } from "~/features/energy-data/solar-charging-kpi";
import type { EnergyTotals } from "~/features/energy-data/types";

import { SystemInfoTooltip } from "../system-info/system-info-tooltip";

type SolarPoweredChargingCardProps = {
  totals: EnergyTotals;
  kpi: SolarChargingKpi;
};

type BreakdownRowProps = {
  colorClassName: string;
  label: string;
  value: string;
};

function BreakdownRow({ colorClassName, label, value }: BreakdownRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`size-2 shrink-0 rounded-full ${colorClassName}`} aria-hidden="true" />
        <span className="truncate text-xs font-medium text-slate-600">{label}</span>
      </div>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

export function SolarPoweredChargingCard({ totals, kpi }: SolarPoweredChargingCardProps) {
  const formattedSolarPercentage = kpi.solarPercentage.toFixed(1);

  return (
    <Card
      aria-labelledby="solar-powered-charging-title"
      className={`group relative overflow-hidden border-slate-200/90 p-5 shadow-sm focus-within:border-brand-blue-light focus-within:shadow-panel ${INTERACTIVE_CARD_STYLES} sm:p-6`}
    >
      <Link
        to="/overview/solar-powered-charging"
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue"
        aria-label="Open solar-powered charging details"
      >
        <span className="sr-only">Open solar-powered charging details</span>
      </Link>

      <CardHeader className="pointer-events-none relative z-10 items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/30 transition-colors duration-200 group-hover:bg-brand-blue-light/45">
            <img className="size-4.5" src={solarIcon} alt="" aria-hidden="true" />
          </span>

          <ArrowRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />

          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light/30 transition-colors duration-200 group-hover:bg-brand-blue-light/45">
            <img className="size-4.5" src={chargerIcon} alt="" aria-hidden="true" />
          </span>
        </div>

        <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-1">
          <SystemInfoTooltip
            accessibleLabel="About solar-powered charging"
            content="Shows how much of the energy delivered to the trucks came from on-site solar rather than the grid."
          />
          <span className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 group-hover:text-brand-blue group-focus-within:text-brand-blue">
            <SquareArrowOutUpRight className="size-4.5" aria-hidden="true" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10 mt-7">
        {!kpi.hasChargingEnergy ? (
          <div className="flex min-h-64 flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
            <p className="text-base font-semibold text-slate-900">No truck charging recorded</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A solar charging share will be shown once charging energy is available.
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-5xl font-semibold tracking-[-0.055em] text-brand-blue tabular-nums sm:text-6xl"
              aria-label={`${formattedSolarPercentage} percent of truck charging energy came from on-site solar.`}
            >
              {formattedSolarPercentage}%
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              of truck charging energy came from on-site solar
            </p>

            <div className="mt-6">
              <div
                className="flex h-2.5 overflow-hidden rounded-full bg-brand-blue-light/60"
                role="img"
                aria-label={`${formattedSolarPercentage}% solar and ${kpi.gridPercentage.toFixed(1)}% grid`}
              >
                <span
                  className="h-full bg-brand-green"
                  style={{ width: `${kpi.solarPercentage}%` }}
                />
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                <BreakdownRow
                  colorClassName="bg-brand-green"
                  label="Solar to trucks"
                  value={formatEnergy(totals.totalSolarToChargerKwh)}
                />
                <BreakdownRow
                  colorClassName="bg-brand-blue-light"
                  label="Grid to trucks"
                  value={formatEnergy(totals.totalGridToChargerKwh)}
                />
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[0.6875rem] font-medium text-slate-400">Total solar generated</p>
              <p className="mt-1 text-xs font-semibold tabular-nums text-slate-600">
                {formatEnergy(totals.solarGenerationKwh)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
