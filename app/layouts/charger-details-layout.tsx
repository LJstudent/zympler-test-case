import { ChargerDetailView } from "~/features/assets/charger";
import { AssetDetailLayout } from "~/features/assets/shared";
import type { EnergyDataRow } from "~/features/energy-data";

export function ChargerDetailsLayout({ rows }: { rows: readonly EnergyDataRow[] }) {
  return (
    <AssetDetailLayout rows={rows} activePage="charger">
      <ChargerDetailView rows={rows} />
    </AssetDetailLayout>
  );
}
