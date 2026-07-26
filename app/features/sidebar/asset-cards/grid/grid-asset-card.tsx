import gridIcon from "~/assets/systems/utility-pole.svg";
import type { ContentState } from "~/components/ui/content-state";

import {
  AssetCardMetrics,
  AssetCardPreviewSkeleton,
  CompactAssetAreaChart,
} from "../../components/asset-card-preview";
import type { GridAssetCardViewModel } from "./grid-asset-card-view-model";
import { SidebarAssetCard } from "../../components/sidebar-asset-card";

type GridAssetCardProps = {
  state?: ContentState;
  viewModel: GridAssetCardViewModel | null;
};

function GridAssetCardContent({ viewModel }: { viewModel: GridAssetCardViewModel }) {
  return (
    <>
      <CompactAssetAreaChart
        data={viewModel.activity}
        dataKey="netGridKwh"
        gradientId="grid-activity-fill"
        showZeroLine
      />
      <AssetCardMetrics
        metrics={[
          { label: "Import", value: viewModel.importDisplay },
          { label: "Export", value: viewModel.exportDisplay },
        ]}
      />
    </>
  );
}

export function GridAssetCard({ state = "ready", viewModel }: GridAssetCardProps) {
  const resolvedState = state === "ready" && viewModel === null ? "empty" : state;

  return (
    <SidebarAssetCard
      title="Grid"
      iconSrc={gridIcon}
      state={resolvedState}
      emptyMessage="No grid data available"
      loadingContent={<AssetCardPreviewSkeleton />}
    >
      {viewModel === null ? null : <GridAssetCardContent viewModel={viewModel} />}
    </SidebarAssetCard>
  );
}
