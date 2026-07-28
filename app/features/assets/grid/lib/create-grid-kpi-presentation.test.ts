import { describe, expect, it } from "vitest";

import type { GridKpiSummary } from "../types/grid-kpi-types";
import {
  createGridBreakdownPresentation,
  createGridKpiPresentation,
} from "./create-grid-kpi-presentation";

const summary: GridKpiSummary = {
  measurementCount: 1,
  importedEnergyKwh: 1_840_000,
  exportedEnergyKwh: 243_000,
  peakImportKw: 792.8,
  peakExportKw: 486,
  importViolationCount: 3,
  exportViolationCount: 2,
  daysAboveNinetyPercentCapacity: 7,
  averageDailyPeakImportKw: 612.3,
  worstDay: { date: new Date("2025-11-22T00:00:00Z"), peakImportKw: 792.8 },
  remainingImportHeadroomKw: 0,
  importLimitExceededByKw: 42.8,
  durationAboveNinetyPercentMinutes: 135,
  importedBreakdown: [
    { id: "battery", energyKwh: 460_000, percentage: 25 },
    { id: "own-use", energyKwh: 736_000, percentage: 40 },
    { id: "solar", energyKwh: 0, percentage: 0 },
    { id: "charger", energyKwh: 644_000, percentage: 35 },
  ],
  exportedBreakdown: [
    { id: "battery", energyKwh: 170_100, percentage: 70 },
    { id: "solar", energyKwh: 72_900, percentage: 30 },
  ],
};

describe("createGridKpiPresentation", () => {
  it.each([
    ["year", ["import-violations", "export-violations", "days-near-capacity"]],
    ["month", ["average-daily-peak", "import-violations", "export-violations", "worst-day"]],
    ["day", ["remaining-headroom", "time-near-capacity", "import-violations", "export-violations"]],
  ] as const)("selects and orders the %s KPI set", (timeView, specificIds) => {
    const items = createGridKpiPresentation({ summary, timeView, locale: "en" });

    expect(items.map((item) => item.id)).toEqual([
      "imported-energy",
      "exported-energy",
      "peak-import",
      "peak-export",
      ...specificIds,
    ]);
  });

  it("formats adaptive units, dates, durations, and limit context", () => {
    const year = createGridKpiPresentation({ summary, timeView: "year", locale: "en" });
    const month = createGridKpiPresentation({ summary, timeView: "month", locale: "en" });
    const day = createGridKpiPresentation({ summary, timeView: "day", locale: "en" });

    expect(year[0].value).toBe("1.84 GWh");
    expect(year[1].value).toBe("243 MWh");
    expect(month.at(-1)).toMatchObject({
      value: "Nov 22",
      supportingText: "792.8 kW peak import",
    });
    expect(day[4]).toMatchObject({
      value: "0 kW",
      supportingText: "Exceeded limit by 42.8 kW",
    });
    expect(day[5].value).toBe("2 h 15 min");
  });

  it("uses an em dash and an accessible unavailable state for null values", () => {
    const items = createGridKpiPresentation({
      summary: { ...summary, peakImportKw: null },
      timeView: "day",
    });

    expect(items[2]).toMatchObject({ value: "—", valueAvailable: false });
  });

  it("adds configured limit context to both peak KPIs", () => {
    const year = createGridKpiPresentation({ summary, timeView: "year", locale: "en" });

    expect(year[2]).toMatchObject({
      value: "792.8 kW",
      context: [
        { text: "Limit: 750 kW", tone: "warning" },
        { text: "Exceeded by 42.8 kW", tone: "warning" },
      ],
    });
    expect(year[3]).toMatchObject({
      value: "486 kW",
      context: [
        { text: "Limit: 500 kW", tone: "muted" },
        { text: "14 kW remaining", tone: "muted" },
      ],
    });
  });

  it("formats breakdown values and describes raw percentages", () => {
    const imported = createGridBreakdownPresentation(summary.importedBreakdown, "imported", "en");
    const exported = createGridBreakdownPresentation(summary.exportedBreakdown, "exported", "en");

    expect(imported.map((item) => item.label)).toEqual(["Battery", "Own use", "Solar", "Charger"]);
    expect(imported[0]).toMatchObject({
      value: "460 MWh",
      percentageText: "25% of imported energy",
    });
    expect(exported[0]).toMatchObject({
      value: "170.1 MWh",
      percentageText: "70% of exported energy",
      accessibleLabel: "More information about battery",
    });
  });
});
