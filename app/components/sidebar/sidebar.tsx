import { LayoutDashboard } from "lucide-react";

import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import type { ContentState } from "~/components/common/content-state";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { SidebarAssetCard } from "./sidebar-asset-card";

type DashboardSidebarProps = {
  state?: ContentState;
};

const SIDEBAR_ASSETS = [
  { id: "grid", title: "Grid" },
  { id: "charger", title: "Charger", iconSrc: chargerIcon },
  { id: "battery", title: "Battery", iconSrc: batteryIcon },
  { id: "solar", title: "Solar", iconSrc: solarIcon },
] as const;

export function DashboardSidebar({ state = "ready" }: DashboardSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden p-4 shadow-panel sm:p-5">
        <header className="shrink-0">
          <p className="text-[1.65rem] font-bold tracking-[-0.055em] text-brand-green">Zympler</p>
          <nav className="mt-5" aria-label="Primary navigation">
            <button
              type="button"
              aria-current="page"
              className="flex w-full items-center gap-3 rounded-xl bg-brand-blue px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_6px_18px_rgb(0_62_208_/_0.18)] transition-[background-color,transform] duration-150 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-reduce:transform-none motion-reduce:transition-none"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Zympler Overview
            </button>
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
          {SIDEBAR_ASSETS.map((asset) => (
            <SidebarAssetCard
              key={asset.id}
              title={asset.title}
              iconSrc={"iconSrc" in asset ? asset.iconSrc : undefined}
              state={state}
            />
          ))}
        </div>
      </Card>
    </aside>
  );
}
