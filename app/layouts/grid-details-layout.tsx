import type { EnergyDataRow } from "~/features/energy-data";
import { GridComplianceView } from "~/features/assets/grid";
import { AssetDetailLayout } from "~/features/assets/shared";

export function GridDetailsLayout({ rows }: { rows: readonly EnergyDataRow[] }) {
  return (
    <AssetDetailLayout rows={rows} activePage="grid">
      <GridComplianceView rows={rows} />
    </AssetDetailLayout>
  );
}
