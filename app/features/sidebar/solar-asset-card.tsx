import solarIcon from "~/assets/systems/solar.svg";
import type { ContentState } from "~/components/ui/content-state";

import {
  AssetCardPreviewSkeleton,
  CenteredAssetCardMetric,
  CompactAssetAreaChart,
} from "./asset-card-preview";
import { SidebarAssetCard } from "./sidebar-asset-card";
import type { SolarAssetCardViewModel } from "./solar-asset-card-view-model";

type SolarAssetCardProps = {
  state?: ContentState;
  viewModel: SolarAssetCardViewModel | null;
};

function SolarAssetCardContent({ viewModel }: { viewModel: SolarAssetCardViewModel }) {
  return (
    <>
      <CompactAssetAreaChart
        data={viewModel.activity}
        dataKey="generatedKwh"
        gradientId="solar-activity-fill"
      />
      <CenteredAssetCardMetric metric={{ label: "Generated", value: viewModel.generatedDisplay }} />
    </>
  );
}

export function SolarAssetCard({ state = "ready", viewModel }: SolarAssetCardProps) {
  const resolvedState = state === "ready" && viewModel === null ? "empty" : state;

  return (
    <SidebarAssetCard
      title="Solar"
      iconSrc={solarIcon}
      state={resolvedState}
      emptyMessage="No solar data available"
      loadingContent={<AssetCardPreviewSkeleton metricLayout="centered" />}
    >
      {viewModel === null ? null : <SolarAssetCardContent viewModel={viewModel} />}
    </SidebarAssetCard>
  );
}
