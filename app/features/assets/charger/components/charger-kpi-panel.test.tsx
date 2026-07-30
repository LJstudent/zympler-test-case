import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ChargerKpiSummary } from "../types/charger-kpi-types";
import { ChargerKpiPanel } from "./charger-kpi-panel";

const summary: ChargerKpiSummary = {
  measurementCount: 1,
  totalChargedKwh: 100,
  totalSolarToChargerKwh: 25,
  solarChargingPercentage: 25,
  breakdown: [
    { id: "solarToCharger", energyKwh: 20, percentage: 20 },
    { id: "batterySolarToCharger", energyKwh: 5, percentage: 5 },
    { id: "batteryGridToCharger", energyKwh: 15, percentage: 15 },
    { id: "gridToCharger", energyKwh: 60, percentage: 60 },
  ],
};

describe("ChargerKpiPanel", () => {
  it("renders the panel heading, period, tooltip labels, and responsive primary layout", () => {
    const markup = renderToStaticMarkup(
      <ChargerKpiPanel periodLabel="2025" summary={summary} showBreakdown={false} />,
    );

    expect(markup).toContain("Charger performance");
    expect(markup).toContain("Summary for 2025");
    expect(markup).toContain('aria-label="More information about solar charging"');
    expect(markup).toContain(
      "grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0",
    );
  });

  it("renders the existing empty state when the selected period has no measurements", () => {
    const markup = renderToStaticMarkup(
      <ChargerKpiPanel
        periodLabel="2025"
        summary={{ ...summary, measurementCount: 0 }}
        showBreakdown
      />,
    );

    expect(markup).toContain("No Charger data is available for the selected period.");
    expect(markup).not.toContain(">Breakdown<");
  });

  it("always shows the general KPIs and hides breakdown KPIs in combined view", () => {
    const markup = renderToStaticMarkup(
      <ChargerKpiPanel periodLabel="2025" summary={summary} showBreakdown={false} />,
    );

    expect(markup).toContain("Solar charging");
    expect(markup).toContain("Charged energy");
    expect(markup).not.toContain("Battery → Charger (Solar)");
    expect(markup).not.toContain(">Breakdown<");
  });

  it("adds all four energy and percentage KPIs in breakdown view", () => {
    const markup = renderToStaticMarkup(
      <ChargerKpiPanel periodLabel="2025" summary={summary} showBreakdown />,
    );

    expect(markup).toContain("Solar → Charger");
    expect(markup).toContain("Battery → Charger (Solar)");
    expect(markup).toContain("Battery → Charger (Grid)");
    expect(markup).toContain("Grid → Charger");
    expect(markup.match(/of charged energy/g)).toHaveLength(4);
    expect(markup).toContain("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4");
  });

  it("shows an em dash instead of zero percent when total charging is zero", () => {
    const markup = renderToStaticMarkup(
      <ChargerKpiPanel
        periodLabel="2025"
        summary={{
          ...summary,
          totalChargedKwh: 0,
          totalSolarToChargerKwh: 0,
          solarChargingPercentage: null,
          breakdown: summary.breakdown.map((item) => ({
            ...item,
            energyKwh: 0,
            percentage: null,
          })),
        }}
        showBreakdown={false}
      />,
    );

    expect(markup).toContain(">—<");
    expect(markup).not.toContain(">0%<");
  });
});
