import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
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
  function renderCard(cardTotals = totals) {
    return renderToStaticMarkup(
      <MemoryRouter>
        <SolarPoweredChargingCard totals={cardTotals} kpi={calculateSolarChargingKpi(cardTotals)} />
      </MemoryRouter>,
    );
  }

  it("displays the percentage rounded to one decimal place", () => {
    const markup = renderCard();

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
    const markup = renderCard(emptyTotals);

    expect(markup).toContain("No truck charging recorded");
    expect(markup).not.toContain("0.0%");
  });

  it("provides separate accessible navigation and tooltip controls", () => {
    const markup = renderCard();

    expect(markup).toContain('href="/overview/solar-powered-charging"');
    expect(markup).toContain('aria-label="Open solar-powered charging details"');
    expect(markup).toContain('aria-label="About solar-powered charging"');
    expect(markup).not.toMatch(/<a[^>]*>[^]*<button[^>]*>[^]*<\/button>[^]*<\/a>/);
  });
});
