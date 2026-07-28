import { describe, expect, it } from "vitest";

import type { BatteryEnergySeriesKey } from "../types/battery-types";
import { BATTERY_DEFAULT_SELECTION } from "../constants/battery-constants";
import { createBatteryChartSeries, getBatteryEnergySeries } from "./create-battery-chart-series";

const noneHidden = new Set<BatteryEnergySeriesKey>();

describe("Battery chart state matrix", () => {
  it("opens in Year + Combined with Breakdown off", () => {
    expect(BATTERY_DEFAULT_SELECTION).toEqual({
      timeView: "year",
      aggregation: "combined",
      breakdown: false,
    });
  });

  it("Raw + Breakdown off shows only measured Battery Import and Export", () => {
    const series = createBatteryChartSeries({
      aggregation: "raw",
      breakdown: false,
      hiddenEnergyKeys: noneHidden,
      profitVisible: true,
    });
    expect(series.map((item) => item.key)).toEqual(["batteryImport", "batteryExport"]);
  });

  it("Raw + Breakdown on shows all five energy flows and no Profit", () => {
    const series = createBatteryChartSeries({
      aggregation: "raw",
      breakdown: true,
      hiddenEnergyKeys: noneHidden,
      profitVisible: true,
    });
    expect(series.map((item) => item.key)).toEqual([
      "gridToBattery",
      "solarToBattery",
      "batteryToGrid",
      "batteryToCharger",
      "batteryToOwnUse",
    ]);
  });

  it("Combined + Breakdown off shows totals and one Profit line", () => {
    const series = createBatteryChartSeries({
      aggregation: "combined",
      breakdown: false,
      hiddenEnergyKeys: noneHidden,
      profitVisible: true,
    });
    expect(series.map((item) => item.key)).toEqual([
      "batteryImport",
      "batteryExport",
      "cumulativeProfit",
    ]);
    expect(series.at(-1)?.showValueLabels).toBe(false);
  });

  it("Combined + Breakdown on shows five energy flows and one Profit line", () => {
    const series = createBatteryChartSeries({
      aggregation: "combined",
      breakdown: true,
      hiddenEnergyKeys: noneHidden,
      profitVisible: true,
    });
    expect(series).toHaveLength(6);
    expect(series.filter((item) => item.kind === "line").map((item) => item.label)).toEqual([
      "Profit",
    ]);
  });

  it("shows Profit labels only when every energy series is hidden", () => {
    const hidden = new Set(
      getBatteryEnergySeries(true).map((item) => item.key),
    ) as Set<BatteryEnergySeriesKey>;
    const profitOnly = createBatteryChartSeries({
      aggregation: "combined",
      breakdown: true,
      hiddenEnergyKeys: hidden,
      profitVisible: true,
    });
    expect(profitOnly).toEqual([
      expect.objectContaining({ key: "cumulativeProfit", showValueLabels: true }),
    ]);

    hidden.delete("batteryToOwnUse");
    const withEnergy = createBatteryChartSeries({
      aggregation: "combined",
      breakdown: true,
      hiddenEnergyKeys: hidden,
      profitVisible: true,
    });
    expect(withEnergy.at(-1)?.showValueLabels).toBe(false);
  });
});
