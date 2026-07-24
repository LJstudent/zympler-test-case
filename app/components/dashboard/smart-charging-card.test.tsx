import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateSmartChargingKpi } from "~/features/energy-data/smart-charging-kpi";

import { SmartChargingCard } from "./smart-charging-card";

function row(pricePerKwh: number | null, gridToChargerKwh: number) {
  return {
    measurement: { pricePerKwh },
    flows: { grid: { toChargerKwh: gridToChargerKwh } },
  };
}

describe("SmartChargingCard", () => {
  it("renders avoidance, prices, insights, title, and tooltip", () => {
    const kpi = calculateSmartChargingKpi([
      row(0.05, 10),
      row(0.1, 30),
      row(0.2, 10),
      row(0.3, 10),
      row(0.4, 0),
    ]);
    const markup = renderToStaticMarkup(<SmartChargingCard kpi={kpi} />);

    expect(markup).toContain("Smart Charging");
    expect(markup).toContain("100.0%");
    expect(markup).toContain("Avoided expensive");
    expect(markup).toContain("market hours");
    expect(markup).toContain("€0.142 / kWh");
    expect(markup).toContain("€0.210 / kWh");
    expect(markup).toContain("Only 0.0% charged during the most expensive market periods");
    expect(markup).toContain("Weighted by charged energy");
    expect(markup).toContain('aria-label="About smart charging"');
  });

  it("renders a clear empty state when priced grid charging is unavailable", () => {
    const markup = renderToStaticMarkup(
      <SmartChargingCard kpi={calculateSmartChargingKpi([row(null, 10)])} />,
    );

    expect(markup).toContain("No grid charging recorded");
    expect(markup).not.toContain("NaN");
    expect(markup).not.toContain("Infinity");
  });
});
