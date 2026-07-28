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
  it("shows estimated value for local flows but not Solar to Grid", () => {
    const markup = renderToStaticMarkup(
      <SolarKpiPanel periodLabel="2025" summary={summary} showBreakdown />,
    );

    expect(markup.match(/Estimated value/g)).toHaveLength(3);
    expect(markup).toContain("10 kWh");
  });
});
