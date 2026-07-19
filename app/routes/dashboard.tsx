import { isRouteErrorResponse, useRouteError } from "react-router";

import { SystemInfoPanel } from "~/components/system-info/system-info-panel";
import { SystemInfoSkeleton } from "~/components/system-info/system-info-skeleton";
import { Card } from "~/components/ui/card";
import { loadEnergyData } from "~/features/energy-data/load-energy-data";

import type { Route } from "./+types/dashboard";

export async function clientLoader() {
  return loadEnergyData();
}

clientLoader.hydrate = true as const;

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-10">
      <div className="w-full max-w-[25rem]">
        <h1 className="mb-6 text-[1.75rem] font-bold tracking-[-0.055em] text-brand-green sm:text-[2rem]">
          Zympler
        </h1>
        {children}
      </div>
    </main>
  );
}

export function HydrateFallback() {
  return (
    <DashboardLayout>
      <SystemInfoSkeleton />
    </DashboardLayout>
  );
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  if (loaderData.rows.length === 0) {
    return (
      <DashboardLayout>
        <Card className="p-5 text-sm text-slate-600 shadow-panel">
          No energy measurements are available.
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SystemInfoPanel />
    </DashboardLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "The energy data could not be loaded.";

  return (
    <DashboardLayout>
      <Card role="alert" className="border-red-200 p-5 shadow-panel">
        <h2 className="text-sm font-semibold text-slate-950">Unable to load energy data</h2>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </Card>
    </DashboardLayout>
  );
}
