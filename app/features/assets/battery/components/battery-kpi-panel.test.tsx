import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { BatteryPresentation } from "../types/battery-types";
import { BatteryKpiPanel } from "./battery-kpi-panel";

const presentation: BatteryPresentation = {
  chartData: [],
  totalBatteryImportDisplay: "18 kWh",
  totalGridToBatteryDisplay: "10 kWh",
  totalSolarToBatteryDisplay: "8 kWh",
  totalBatteryExportDisplay: "15 kWh",
  totalBatteryToGridDisplay: "5 kWh",
  totalBatteryToChargerDisplay: "4 kWh",
  totalBatteryToOwnUseDisplay: "6 kWh",
  gridToBatteryPercentageDisplay: "55,6%",
  solarToBatteryPercentageDisplay: "44,4%",
  batteryToGridPercentageDisplay: "33,3%",
  batteryToChargerPercentageDisplay: "26,7%",
  batteryToOwnUsePercentageDisplay: "40%",
  totalRevenueDisplay: "€12,00",
  totalSavingsDisplay: "€8,00",
  totalGridChargingCostsDisplay: "€3,20",
  totalProfitDisplay: "€16,80",
  screenReaderSummary: "Battery summary",
};

describe("BatteryKpiPanel", () => {
  it("uses Profit as the single primary compact KPI", () => {
    const markup = renderToStaticMarkup(
      <BatteryKpiPanel
        periodLabel="2025"
        measurementCount={96}
        showBreakdown={false}
        presentation={presentation}
      />,
    );
    expect(markup).toContain("Profit");
    expect(markup).toContain("Battery Import");
    expect(markup).toContain("Battery Export");
    expect(markup).not.toContain("Economic Value");
    expect(markup).not.toContain("Battery Costs");
  });

  it("uses the Grid-style energy and financial breakdown when enabled", () => {
    const markup = renderToStaticMarkup(
      <BatteryKpiPanel
        periodLabel="2025"
        measurementCount={96}
        showBreakdown
        presentation={presentation}
      />,
    );
    expect(markup).toContain("Battery Breakdown");
    expect(markup).toContain("Imported energy");
    expect(markup).toContain("Exported energy");
    expect(markup).toContain("Financial breakdown");
    expect(markup).toContain("Revenue");
    expect(markup).toContain("Savings");
    expect(markup).toContain("Costs");
    expect(markup).toContain("Solar → Battery: €0 electricity purchase cost");
    expect(markup).not.toContain("Economic Value");
  });
});
