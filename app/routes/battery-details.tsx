import { isRouteErrorResponse, useRouteError } from "react-router";

import { loadEnergyData } from "~/features/energy-data";
import { BatteryDetailsLayout } from "~/layouts/battery-details-layout";

import type { Route } from "./+types/battery-details";

export async function clientLoader() {
  return loadEnergyData();
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white text-sm text-slate-500">
      Loading Battery details…
    </main>
  );
}

export default function BatteryDetails({ loaderData }: Route.ComponentProps) {
  return <BatteryDetailsLayout rows={loaderData.rows} />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "The Battery data could not be loaded.";

  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-950">Battery details unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </main>
  );
}
