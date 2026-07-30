import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { SolarKpiSummary } from "../types/solar-types";
import { SolarKpiPanel } from "./solar-kpi-panel";

const summary: SolarKpiSummary = {
  measurementCount: 1,
  totalProductionKwh: 100,
  localUseKwh: 90,
  localUsePercentage: 90,
  exportedKwh: 10,
  exportedPercentage: 10,
  breakdown: [
    { id: "ownUse", energyKwh: 40, estimatedValue: 8 },
    { id: "solarToCharger", energyKwh: 20, estimatedValue: 4 },
    { id: "solarToBattery", energyKwh: 30, estimatedValue: 6 },
    { id: "solarToGrid", energyKwh: 10 },
  ],
};

describe("SolarKpiPanel", () => {
  it("renders the panel heading, period, primary KPIs, tooltip labels, and responsive layout", () => {
    const markup = renderToStaticMarkup(
      <SolarKpiPanel periodLabel="2025" summary={summary} showBreakdown={false} />,
    );

    expect(markup).toContain("Solar performance");
    expect(markup).toContain("Summary for 2025");
    expect(markup).toContain("Solar used locally");
    expect(markup).toContain("Exported");
    expect(markup).toContain('aria-label="More information about solar used locally"');
    expect(markup).toContain(
      "grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0",
    );
  });

  it("renders the existing empty state when the selected period has no measurements", () => {
    const markup = renderToStaticMarkup(
      <SolarKpiPanel
        periodLabel="2025"
        summary={{ ...summary, measurementCount: 0 }}
        showBreakdown
      />,
    );

    expect(markup).toContain("No Solar data is available for the selected period.");
    expect(markup).not.toContain(">Breakdown<");
  });

  it("shows estimated value for local flows but not Solar to Grid", () => {
    const markup = renderToStaticMarkup(
      <SolarKpiPanel periodLabel="2025" summary={summary} showBreakdown />,
    );

    expect(markup.match(/Estimated value/g)).toHaveLength(3);
    expect(markup).toContain("10 kWh");
    expect(markup).toContain("Own use");
    expect(markup).toContain("Solar → Charger");
    expect(markup).toContain("Solar → Battery");
    expect(markup).toContain("Solar → Grid");
    expect(markup).toContain("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4");
  });
});
