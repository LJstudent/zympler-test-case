import { Area, AreaChart, ReferenceLine } from "recharts";

import { Card } from "~/components/ui/card";
import { ChartContainer } from "~/components/ui/chart";
import type { ChartConfig } from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";

export const ASSET_ACTIVITY_CHART_CONFIG = {
  activity: {
    color: "var(--color-brand-blue)",
  },
} satisfies ChartConfig;

type CompactAssetAreaChartProps = {
  data: object[];
  dataKey: string;
  gradientId: string;
  showZeroLine?: boolean;
};

export function CompactAssetAreaChart({
  data,
  dataKey,
  gradientId,
  showZeroLine = false,
}: CompactAssetAreaChartProps) {
  return (
    <ChartContainer
      config={ASSET_ACTIVITY_CHART_CONFIG}
      aria-hidden="true"
      className="h-24 w-full pointer-events-none"
    >
      <AreaChart
        data={data}
        margin={{ top: 3, right: 1, bottom: 3, left: 1 }}
        accessibilityLayer={false}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-activity)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-activity)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        {showZeroLine && <ReferenceLine y={0} stroke="var(--color-slate-200)" strokeWidth={1} />}
        <Area
          type="monotone"
          dataKey={dataKey}
          baseValue={0}
          stroke="var(--color-activity)"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export interface AssetCardMetric {
  label: string;
  value: string;
}

export function AssetCardMetrics({ metrics }: { metrics: readonly AssetCardMetric[] }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0">
          <dt className="truncate text-[0.625rem] font-medium uppercase tracking-[0.08em] text-slate-400">
            {metric.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-slate-950 tabular-nums">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CenteredAssetCardMetric({ metric }: { metric: AssetCardMetric }) {
  return (
    <dl className="mt-4 text-center">
      <div className="min-w-0">
        <dt className="truncate text-[0.625rem] font-medium uppercase tracking-[0.08em] text-slate-400">
          {metric.label}
        </dt>
        <dd className="mt-1 truncate text-sm font-semibold text-slate-950 tabular-nums">
          {metric.value}
        </dd>
      </div>
    </dl>
  );
}

type AssetCardPreviewSkeletonProps = {
  metricLayout?: "two-column" | "centered";
};

export function AssetCardPreviewSkeleton({
  metricLayout = "two-column",
}: AssetCardPreviewSkeletonProps) {
  return (
    <Card aria-hidden="true" className="overflow-hidden p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      {metricLayout === "centered" ? (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[0, 1].map((column) => (
            <div key={column} className="min-w-0 space-y-2">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
