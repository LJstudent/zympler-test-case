import { useEffect, useState } from "react";

import SectionHeading from "~/components/dashboard/section-heading";
import SystemStatusCard from "~/components/dashboard/system-status-card";
import SystemStatusCardSkeleton from "~/components/dashboard/system-status-card-skeleton";
import ZymplerActionsSection from "~/components/dashboard/zympler-actions-section";
import { TooltipProvider } from "~/components/ui/tooltip";
import plan from "~/content/plan.json";
import telemetry from "~/content/telemetry.json";
import { SYSTEM_STATUSES } from "~/data/system-status";

const STATUS_LOADING_DELAY_MS = 900;

export function meta() {
  return [
    { title: "System Status | Zympler" },
    { name: "description", content: "Live Zympler energy system status." },
  ];
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setIsLoading(false), STATUS_LOADING_DELAY_MS);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  return (
    <TooltipProvider>
      <main className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(0,62,208,0.24),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(0,255,166,0.08),transparent_25%),linear-gradient(rgba(189,210,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(189,210,255,0.025)_1px,transparent_1px)] bg-[size:auto,auto,48px_48px,48px_48px]"
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <header>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-mint drop-shadow-[0_0_20px_rgba(0,255,166,0.16)] sm:text-4xl">
              Zympler
            </h1>
          </header>

          <section aria-labelledby="system-status-heading" className="mt-14 sm:mt-18">
            <SectionHeading id="system-status-heading">System Status</SectionHeading>

            <div
              className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {isLoading
                ? SYSTEM_STATUSES.map((system) => <SystemStatusCardSkeleton key={system.id} />)
                : SYSTEM_STATUSES.map((system, index) => (
                    <SystemStatusCard key={system.id} system={system} index={index} />
                  ))}
            </div>
          </section>

          <ZymplerActionsSection plan={plan} telemetry={telemetry} />
        </div>
      </main>
    </TooltipProvider>
  );
}
