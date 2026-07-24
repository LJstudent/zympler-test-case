import { Check, Zap } from "lucide-react";

import { SystemInfoTooltip } from "~/components/system-info/system-info-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatPercentage, formatPricePerKwh } from "~/features/energy-data/format-smart-charging";
import type { SmartChargingKpi } from "~/features/energy-data/smart-charging-kpi";

import { OVERVIEW_KPI_CARD_STYLES, OverviewKpiFlowIcon } from "./overview-kpi-card-parts";

const TOOLTIP_TEXT =
  "Shows how successfully charging was shifted away from the highest-priced 20% of market intervals. Prices are raw market prices and charging is weighted by energy supplied directly from the grid.";

type SmartChargingCardProps = {
  kpi: SmartChargingKpi;
};

function PriceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3.5 py-3 first:pl-0 last:pr-0">
      <p className="text-[0.6875rem] leading-4 font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  );
}

function InsightRow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 text-xs font-medium text-slate-600">
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-green text-slate-950">
        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
      </span>
      <span>{children}</span>
    </div>
  );
}

export function SmartChargingCard({ kpi }: SmartChargingCardProps) {
  const avoidancePercentage = formatPercentage(kpi.peakPriceAvoidancePercentage);

  return (
    <Card aria-labelledby="smart-charging-title" className={OVERVIEW_KPI_CARD_STYLES}>
      <CardHeader className="relative z-10 items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <OverviewKpiFlowIcon>
            <Zap className="size-4.5 text-brand-blue" aria-hidden="true" />
          </OverviewKpiFlowIcon>
          <CardTitle id="smart-charging-title" className="truncate text-sm">
            Smart Charging
          </CardTitle>
        </div>

        <SystemInfoTooltip accessibleLabel="About smart charging" content={TOOLTIP_TEXT} />
      </CardHeader>

      <CardContent className="relative z-10 mt-7">
        {!kpi.hasValidData ? (
          <div className="flex min-h-64 flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
            <p className="text-base font-semibold text-slate-900">No grid charging recorded</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Smart charging performance will be shown once priced grid charging is available.
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-5xl font-semibold tracking-[-0.055em] text-brand-blue tabular-nums sm:text-6xl"
              aria-label={`${avoidancePercentage} of charging avoided the most expensive market periods.`}
            >
              {avoidancePercentage}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Avoided expensive
              <br />
              market hours
            </p>

            <div className="mt-5 grid grid-cols-2 divide-x divide-slate-100 border-y border-slate-100">
              <PriceMetric
                label="Average charging price"
                value={formatPricePerKwh(kpi.averageChargingPricePerKwh)}
              />
              <PriceMetric
                label="Average market price"
                value={formatPricePerKwh(kpi.averageMarketPricePerKwh)}
              />
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              <InsightRow>
                {`Only ${formatPercentage(kpi.expensiveChargingPercentage)} charged during the most expensive market periods`}
              </InsightRow>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
