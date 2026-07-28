import { BatteryDetailView } from "~/features/assets/battery";
import { AssetDetailLayout } from "~/features/assets/shared";
import type { EnergyDataRow } from "~/features/energy-data";

export function BatteryDetailsLayout({ rows }: { rows: readonly EnergyDataRow[] }) {
  return (
    <AssetDetailLayout rows={rows} activePage="battery">
      <BatteryDetailView rows={rows} />
    </AssetDetailLayout>
  );
}
