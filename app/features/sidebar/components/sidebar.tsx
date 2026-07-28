import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router";

import { Card } from "~/components/ui/card";
import type { ContentState } from "~/components/ui/content-state";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import type { EnergyDataRow } from "~/features/energy-data";

import { BatteryAssetCard } from "../asset-cards/battery/battery-asset-card";
import { createBatteryAssetCardViewModel } from "../asset-cards/battery/battery-asset-card-view-model";
import { ChargerAssetCard } from "../asset-cards/charger/charger-asset-card";
import { createChargerAssetCardViewModel } from "../asset-cards/charger/charger-asset-card-view-model";
import { GridAssetCard } from "../asset-cards/grid/grid-asset-card";
import { createGridAssetCardViewModel } from "../asset-cards/grid/grid-asset-card-view-model";
import { SolarAssetCard } from "../asset-cards/solar/solar-asset-card";
import { createSolarAssetCardViewModel } from "../asset-cards/solar/solar-asset-card-view-model";

type DashboardSidebarProps = {
  state?: ContentState;
  rows?: readonly EnergyDataRow[];
  activePage?: "overview" | "grid" | "solar" | "charger" | "battery";
};

export function DashboardSidebar({
  state = "ready",
  rows = [],
  activePage = "overview",
}: DashboardSidebarProps) {
  const gridViewModel = createGridAssetCardViewModel(rows);
  const chargerViewModel = createChargerAssetCardViewModel(rows);
  const batteryViewModel = createBatteryAssetCardViewModel(rows);
  const solarViewModel = createSolarAssetCardViewModel(rows);

  return (
    <aside className="h-full min-h-0 lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)] lg:self-start">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden p-4 shadow-panel sm:p-5">
        <header className="shrink-0">
          <p className="text-[1.65rem] font-bold tracking-[-0.055em] text-brand-green">Zympler</p>
          <nav className="mt-5" aria-label="Primary navigation">
            <Link
              to="/"
              aria-current={activePage === "overview" ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-[background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-reduce:transform-none motion-reduce:transition-none ${
                activePage === "overview"
                  ? "bg-brand-blue text-white shadow-[0_6px_18px_rgb(0_62_208_/_0.18)] hover:bg-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Zympler Overview
            </Link>
          </nav>
          <Separator className="my-5" />
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Assets
            </h2>
            {state === "loading" ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <span className="text-[0.6875rem] text-slate-400">
                {state === "ready" ? "4 connected" : "—"}
              </span>
            )}
          </div>
        </header>

        <div
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 pb-1"
          aria-label="Asset overview"
          aria-busy={state === "loading"}
        >
          <GridAssetCard state={state} viewModel={gridViewModel} />
          <ChargerAssetCard state={state} viewModel={chargerViewModel} />
          <BatteryAssetCard state={state} viewModel={batteryViewModel} />
          <SolarAssetCard state={state} viewModel={solarViewModel} />
        </div>
      </Card>
    </aside>
  );
}
