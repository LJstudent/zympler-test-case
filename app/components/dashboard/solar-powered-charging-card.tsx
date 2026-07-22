import { Sun } from "lucide-react";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatEnergy } from "~/features/energy-data/format-energy";
import type { SolarChargingKpi } from "~/features/energy-data/solar-charging-kpi";
import type { EnergyTotals } from "~/features/energy-data/types";

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
      className="overflow-hidden border-slate-200/90 p-5 shadow-panel sm:p-6"
    >
      <CardHeader className="items-start gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">
            Energy origin
          </p>
          <h3
            id="solar-powered-charging-title"
            className="mt-1 text-sm font-semibold text-slate-950"
          >
            Solar-powered charging
          </h3>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-emerald-700">
          <Sun className="size-5" aria-hidden="true" />
        </div>
      </CardHeader>

      <CardContent className="mt-6">
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
