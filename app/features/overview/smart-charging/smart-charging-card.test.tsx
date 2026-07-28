import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SmartChargingCard } from "./smart-charging-card";
import { calculateSmartChargingKpi } from "./smart-charging-kpi";

function row(pricePerKwh: number | null, gridToChargerKwh: number) {
  return {
    measurement: { pricePerKwh },
    flows: { grid: { toChargerKwh: gridToChargerKwh } },
  };
}

describe("SmartChargingCard", () => {
  function renderCard(kpi: ReturnType<typeof calculateSmartChargingKpi>) {
    return renderToStaticMarkup(
      <MemoryRouter>
        <SmartChargingCard kpi={kpi} />
      </MemoryRouter>,
    );
  }

  it("renders avoidance, prices, insights, title, and tooltip", () => {
    const kpi = calculateSmartChargingKpi([
      row(0.05, 10),
      row(0.1, 30),
      row(0.2, 10),
      row(0.3, 10),
      row(0.4, 0),
    ]);
    const markup = renderCard(kpi);

    expect(markup).toContain("Smart Charging");
    expect(markup).toContain("100.0%");
    expect(markup).toContain("Avoided expensive");
    expect(markup).toContain("market hours");
    expect(markup).toContain("€0.142 / kWh");
    expect(markup).toContain("€0.210 / kWh");
    expect(markup).toContain("Only 0.0% charged during the most expensive market periods");
    expect(markup).toContain('href="/assets/charger"');
    expect(markup).toContain('aria-label="Open Charger details"');
    expect(markup).toContain('aria-label="About smart charging"');
  });

  it("renders a clear empty state when priced grid charging is unavailable", () => {
    const markup = renderCard(calculateSmartChargingKpi([row(null, 10)]));

    expect(markup).toContain("No grid charging recorded");
    expect(markup).not.toContain("NaN");
    expect(markup).not.toContain("Infinity");
  });
});
