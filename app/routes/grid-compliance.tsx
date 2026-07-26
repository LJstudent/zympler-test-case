import { isRouteErrorResponse, useRouteError } from "react-router";

import { loadEnergyData } from "~/features/energy-data";
import { DashboardLayout } from "~/layouts/dashboard-layout";

import type { Route } from "./+types/grid-compliance";

export const meta: Route.MetaFunction = () => [
  { title: "Zympler | Grid" },
  {
    name: "description",
    content: "Grid energy flows, contracted limits and capacity violations.",
  },
];

export async function clientLoader() {
  return loadEnergyData();
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DashboardLayout state="loading" activePage="grid" />;
}

export default function GridComplianceDetails({ loaderData }: Route.ComponentProps) {
  return (
    <DashboardLayout
      activePage="grid"
      totals={loaderData.totals}
      rows={loaderData.rows}
      state={loaderData.rows.length === 0 ? "empty" : "ready"}
    />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "The grid data could not be loaded.";

  return (
    <DashboardLayout
      activePage="grid"
      state="error"
      errorMessage={message}
      onRetry={() => window.location.reload()}
    />
  );
}
