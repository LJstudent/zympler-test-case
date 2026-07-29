import { isRouteErrorResponse, useRouteError } from "react-router";

import { DashboardOnboarding } from "~/features/onboarding";
import { loadOverviewData } from "~/features/overview";
import { DashboardLayout } from "~/layouts/dashboard-layout";

import type { Route } from "./+types/dashboard";

export async function clientLoader() {
  return loadOverviewData();
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <DashboardLayout state="loading" />;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <DashboardLayout
        state={loaderData.rows.length === 0 ? "empty" : "ready"}
        totals={loaderData.totals}
        rows={loaderData.rows}
      />
      <DashboardOnboarding />
    </>
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
    <DashboardLayout
      state="error"
      errorMessage={message}
      onRetry={() => window.location.reload()}
    />
  );
}
