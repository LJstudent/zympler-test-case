import { isRouteErrorResponse, useRouteError } from "react-router";

import { DashboardLayout } from "~/components/dashboard/dashboard-layout";
import { loadEnergyData } from "~/features/energy-data/load-energy-data";

import type { Route } from "./+types/dashboard";

export async function clientLoader() {
  return loadEnergyData();
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DashboardLayout state="loading" />;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  if (loaderData.rows.length === 0) {
    return <DashboardLayout state="empty" />;
  }

  return <DashboardLayout />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "The energy data could not be loaded.";

  return (
    <DashboardLayout
      state="error"
      errorMessage={message}
      onRetry={() => window.location.reload()}
    />
  );
}
