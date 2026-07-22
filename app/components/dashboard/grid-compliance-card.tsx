import { Network } from "lucide-react";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  formatPeakTimestamp,
  formatPowerValue,
  formatViolationCount,
} from "~/features/energy-data/format-grid-compliance";
import type {
  GridComplianceDirection,
  GridComplianceKpi,
} from "~/features/energy-data/grid-compliance-kpi";

import {
  OVERVIEW_KPI_CARD_STYLES,
  OverviewKpiActions,
  OverviewKpiFlowIcon,
  OverviewKpiNavigationLink,
} from "./overview-kpi-card-parts";

type GridComplianceCardProps = {
  kpi: GridComplianceKpi;
};

type PeakGroupProps = {
  direction: "import" | "export";
  result: GridComplianceDirection;
};

function PeakGroup({ direction, result }: PeakGroupProps) {
  const hasExceededLimit = result.exceededByKw > 0;
  const formattedPeak = formatPowerValue(result.peakKw);
  const formattedLimit = formatPowerValue(result.limitKw);
  const statusText = hasExceededLimit
    ? `Exceeded by ${formatPowerValue(result.exceededByKw)} kW`
    : `${formatPowerValue(result.headroomKw)} kW headroom`;

  return (
    <section
      aria-label={`${direction} capacity peak`}
      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
    >
      <p className="text-[0.625rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        {direction}
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">Peak</span>
        <span className="text-sm font-semibold tabular-nums">
          <span className={hasExceededLimit ? "text-orange-600" : "text-slate-950"}>
            {formattedPeak}
          </span>

          <span className="text-slate-950">
            {" / "}
            {formattedLimit} kW
          </span>
        </span>
      </div>
      <p className="mt-1 text-right text-[0.6875rem] tabular-nums text-slate-500">
        {formatPeakTimestamp(result.peakAt)}
      </p>
      <p className={`mt-1.5 text-right text-[0.6875rem] text-slate-600`}>{statusText}</p>
    </section>
  );
}

function ViolationRow({ direction, count }: { direction: "import" | "export"; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs font-medium text-slate-600">
        {direction === "import" ? "Import violations" : "Export violations"}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold`}>
        {formatViolationCount(direction, count)}
      </span>
    </div>
  );
}

export function GridComplianceCard({ kpi }: GridComplianceCardProps) {
  const formattedCompliancePercentage = kpi.compliancePercentage.toFixed(1);

  return (
    <Card aria-labelledby="grid-compliance-title" className={OVERVIEW_KPI_CARD_STYLES}>
      <OverviewKpiNavigationLink
        to="/overview/grid-compliance"
        accessibleLabel="Open grid compliance details"
      />

      <CardHeader className="pointer-events-none relative z-10 items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5">
            <OverviewKpiFlowIcon>
              <Network className="size-4.5" aria-hidden="true" />
            </OverviewKpiFlowIcon>
          </div>
        </div>

        <OverviewKpiActions
          tooltipLabel="About grid compliance"
          tooltipContent="Shows whether grid import and export remained within the site's contracted capacity limits."
        />
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10 mt-7">
        {!kpi.hasValidMeasurements ? (
          <div className="flex min-h-64 flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
            <p className="text-base font-semibold text-slate-900">No grid measurements available</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Grid compliance will be shown once measurement data is available.
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-5xl font-semibold tracking-[-0.055em] text-brand-blue tabular-nums sm:text-6xl"
              aria-label={`${formattedCompliancePercentage} percent of intervals stayed within both contracted limits.`}
            >
              {formattedCompliancePercentage}%
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              of intervals stayed within both contracted limits
            </p>

            <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
              <ViolationRow direction="import" count={kpi.import.violationCount} />
              <ViolationRow direction="export" count={kpi.export.violationCount} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PeakGroup direction="import" result={kpi.import} />
              <PeakGroup direction="export" result={kpi.export} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
