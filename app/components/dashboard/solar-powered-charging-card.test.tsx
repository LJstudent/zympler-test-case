import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateSolarChargingKpi } from "~/features/energy-data/solar-charging-kpi";
import type { EnergyTotals } from "~/features/energy-data/types";

import { SolarPoweredChargingCard } from "./solar-powered-charging-card";

const totals: EnergyTotals = {
  solarGenerationKwh: 187_746.6,
  chargerEnergyKwh: 100,
  totalSolarToChargerKwh: 15.249,
  totalGridToChargerKwh: 84.751,
};

describe("SolarPoweredChargingCard", () => {
  it("displays the percentage rounded to one decimal place", () => {
    const markup = renderToStaticMarkup(
      <SolarPoweredChargingCard totals={totals} kpi={calculateSolarChargingKpi(totals)} />,
    );

    expect(markup).toContain("15.2%");
    expect(markup).not.toContain("NaN%");
    expect(markup).not.toContain("Infinity%");
  });

  it("renders a clear empty state when there is no charging energy", () => {
    const emptyTotals = {
      ...totals,
      chargerEnergyKwh: 0,
      totalSolarToChargerKwh: 0,
      totalGridToChargerKwh: 0,
    };
    const markup = renderToStaticMarkup(
      <SolarPoweredChargingCard
        totals={emptyTotals}
        kpi={calculateSolarChargingKpi(emptyTotals)}
      />,
    );

    expect(markup).toContain("No truck charging recorded");
    expect(markup).not.toContain("0.0%");
  });
});
