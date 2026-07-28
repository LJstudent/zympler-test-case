import { SolarDetailView } from "~/features/assets/solar";
import { AssetDetailLayout } from "~/features/assets/shared";
import type { EnergyDataRow } from "~/features/energy-data";

export function SolarDetailsLayout({ rows }: { rows: readonly EnergyDataRow[] }) {
  return (
    <AssetDetailLayout rows={rows} activePage="solar">
      <SolarDetailView rows={rows} />
    </AssetDetailLayout>
  );
}
