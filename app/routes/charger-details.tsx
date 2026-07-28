import { isRouteErrorResponse, useRouteError } from "react-router";

import { validateChargerBreakdown } from "~/features/assets/charger";
import { loadEnergyData } from "~/features/energy-data";
import { ChargerDetailsLayout } from "~/layouts/charger-details-layout";

import type { Route } from "./+types/charger-details";

export async function clientLoader() {
  const dataset = await loadEnergyData();
  const issues = validateChargerBreakdown(dataset.rows);

  if (import.meta.env.DEV && issues.length > 0) {
    console.warn(
      `Charger source breakdown differs from total charged energy in ${issues.length} intervals.`,
      issues.slice(0, 5),
    );
  }

  return dataset;
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white text-sm text-slate-500">
      Loading Charger details…
    </main>
  );
}

export default function ChargerDetails({ loaderData }: Route.ComponentProps) {
  return <ChargerDetailsLayout rows={loaderData.rows} />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "The Charger data could not be loaded.";

  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-950">Charger details unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </main>
  );
}
