import chargerIcon from "~/assets/systems/charger.svg";
import type { ContentState } from "~/components/ui/content-state";

import {
  AssetCardMetrics,
  AssetCardPreviewSkeleton,
  CompactAssetAreaChart,
} from "../../components/asset-card-preview";
import type { ChargerAssetCardViewModel } from "./charger-asset-card-view-model";
import { SidebarAssetCard } from "../../components/sidebar-asset-card";

type ChargerAssetCardProps = {
  state?: ContentState;
  viewModel: ChargerAssetCardViewModel | null;
};

function ChargerAssetCardContent({ viewModel }: { viewModel: ChargerAssetCardViewModel }) {
  return (
    <>
      <CompactAssetAreaChart
        data={viewModel.activity}
        dataKey="chargedKwh"
        gradientId="charger-activity-fill"
      />
      <AssetCardMetrics
        metrics={[
          { label: "Charged", value: viewModel.chargedDisplay },
          { label: "Solar", value: viewModel.solarDisplay },
        ]}
      />
    </>
  );
}

export function ChargerAssetCard({ state = "ready", viewModel }: ChargerAssetCardProps) {
  const resolvedState = state === "ready" && viewModel === null ? "empty" : state;

  return (
    <SidebarAssetCard
      title="Charger"
      iconSrc={chargerIcon}
      to="/assets/charger"
      state={resolvedState}
      emptyMessage="No charger data available"
      loadingContent={<AssetCardPreviewSkeleton />}
    >
      {viewModel === null ? null : <ChargerAssetCardContent viewModel={viewModel} />}
    </SidebarAssetCard>
  );
}
