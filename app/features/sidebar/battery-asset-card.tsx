import batteryIcon from "~/assets/systems/battery.svg";
import type { ContentState } from "~/components/ui/content-state";

import {
  AssetCardPreviewSkeleton,
  CenteredAssetCardMetric,
  CompactAssetAreaChart,
} from "./asset-card-preview";
import type { BatteryAssetCardViewModel } from "./battery-asset-card-view-model";
import { SidebarAssetCard } from "./sidebar-asset-card";

type BatteryAssetCardProps = {
  state?: ContentState;
  viewModel: BatteryAssetCardViewModel | null;
};

function BatteryAssetCardContent({ viewModel }: { viewModel: BatteryAssetCardViewModel }) {
  return (
    <>
      <CompactAssetAreaChart
        data={viewModel.activity}
        dataKey="batteryActivityKwh"
        gradientId="battery-activity-fill"
        showZeroLine
      />
      <CenteredAssetCardMetric metric={{ label: "Profit", value: viewModel.profitDisplay }} />
    </>
  );
}

export function BatteryAssetCard({ state = "ready", viewModel }: BatteryAssetCardProps) {
  const resolvedState = state === "ready" && viewModel === null ? "empty" : state;

  return (
    <SidebarAssetCard
      title="Battery"
      iconSrc={batteryIcon}
      state={resolvedState}
      emptyMessage="No battery data available"
      loadingContent={<AssetCardPreviewSkeleton metricLayout="centered" />}
    >
      {viewModel === null ? null : <BatteryAssetCardContent viewModel={viewModel} />}
    </SidebarAssetCard>
  );
}
