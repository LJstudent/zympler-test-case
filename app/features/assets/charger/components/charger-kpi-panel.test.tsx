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
