import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { GridKpiSummary } from "../types/grid-kpi-types";
import type { GridTimeView } from "../types/grid-types";
import { GridKpiPanel } from "./grid-kpi-panel";

const summary: GridKpiSummary = {
  measurementCount: 1,
  importedEnergyKwh: 100,
  exportedEnergyKwh: 10,
  peakImportKw: 400,
  peakExportKw: 40,
  importViolationCount: 0,
  exportViolationCount: 0,
  daysAboveNinetyPercentCapacity: 0,
  averageDailyPeakImportKw: 400,
  worstDay: { date: new Date("2025-11-22T00:00:00Z"), peakImportKw: 400 },
  remainingImportHeadroomKw: 350,
  importLimitExceededByKw: 0,
  durationAboveNinetyPercentMinutes: 0,
  importedBreakdown: [
    { id: "battery", energyKwh: 20, percentage: 20 },
    { id: "own-use", energyKwh: 50, percentage: 50 },
    { id: "charger", energyKwh: 30, percentage: 30 },
  ],
  exportedBreakdown: [
    { id: "battery", energyKwh: 7, percentage: 70 },
    { id: "solar", energyKwh: 3, percentage: 30 },
  ],
};

function renderSuccess(timeView: GridTimeView) {
  return renderToStaticMarkup(
    <GridKpiPanel
      timeView={timeView}
      periodLabel="November 2025"
      summary={summary}
      status="success"
    />,
  );
}

describe("GridKpiPanel", () => {
  it.each([
    ["year", "Days above 90% capacity"],
    ["month", "Average daily peak import"],
    ["day", "Remaining import headroom"],
  ] as const)("renders the correct %s-specific KPI", (timeView, label) => {
    const markup = renderSuccess(timeView);

    expect(markup).toContain(label);
    expect(markup).toContain("Imported energy");
    expect(markup).toContain("Exported energy");
    expect(markup).toContain("Peak import");
    expect(markup).toContain("Peak export");
  });

  it("renders keyboard-focusable, accessible tooltip triggers", () => {
    const markup = renderSuccess("year");

    expect(markup).toContain('aria-label="More information about imported energy"');
    expect(markup).toContain("<button");
  });

  it("shows the imported and exported breakdown only when enabled", () => {
    const hidden = renderSuccess("year");
    const visible = renderToStaticMarkup(
      <GridKpiPanel
        timeView="year"
        periodLabel="2025"
        summary={summary}
        status="success"
        showBreakdown
      />,
    );

    expect(hidden).not.toContain(">Breakdown<");
    expect(visible).toContain(">Breakdown<");
    expect(visible).toContain("20% of imported energy");
    expect(visible).toContain("70% of exported energy");
    expect(visible).toContain('<img src="data:image/svg+xml');
    expect(visible).toContain('alt="" aria-hidden="true"');
  });

  it("keeps KPIs visible when only the breakdown is in an error state", () => {
    const markup = renderToStaticMarkup(
      <GridKpiPanel
        timeView="year"
        periodLabel="2025"
        summary={summary}
        status="success"
        showBreakdown
        breakdownStatus="error"
        onBreakdownRetry={() => undefined}
      />,
    );

    expect(markup).toContain("Imported energy");
    expect(markup).toContain("The energy breakdown could not be calculated.");
    expect(markup).toContain("Try again");
  });

  it("renders a breakdown-only empty state without hiding valid KPIs", () => {
    const markup = renderToStaticMarkup(
      <GridKpiPanel
        timeView="day"
        periodLabel="22 Nov 2025"
        summary={{ ...summary, importedBreakdown: [], exportedBreakdown: [] }}
        status="success"
        showBreakdown
        breakdownStatus="empty"
      />,
    );

    expect(markup).toContain("Peak import");
    expect(markup).toContain("No energy breakdown is available");
  });

  it("renders the contained error state and retry action", () => {
    const markup = renderToStaticMarkup(
      <GridKpiPanel
        timeView="year"
        periodLabel="2025"
        summary={null}
        status="error"
        onRetry={() => undefined}
      />,
    );

    expect(markup).toContain("Grid statistics could not be loaded");
    expect(markup).toContain("Try again");
  });

  it("distinguishes empty data from valid zero measurements", () => {
    const empty = renderToStaticMarkup(
      <GridKpiPanel timeView="day" periodLabel="22 Nov 2025" summary={null} status="empty" />,
    );
    const zero = renderToStaticMarkup(
      <GridKpiPanel
        timeView="day"
        periodLabel="22 Nov 2025"
        summary={{
          ...summary,
          importedEnergyKwh: 0,
          exportedEnergyKwh: 0,
          peakImportKw: 0,
          peakExportKw: 0,
        }}
        status="success"
      />,
    );

    expect(empty).toContain("No Grid data available");
    expect(zero).toContain("0 kWh");
    expect(zero).not.toContain("No Grid data available");
  });
});
