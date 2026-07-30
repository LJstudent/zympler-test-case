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

const singleBreakdownGroupCases: {
  direction: string;
  importedBreakdown: GridKpiSummary["importedBreakdown"];
  exportedBreakdown: GridKpiSummary["exportedBreakdown"];
  shown: string;
  hidden: string;
}[] = [
  {
    direction: "exported",
    importedBreakdown: [],
    exportedBreakdown: summary.exportedBreakdown,
    shown: "Exported energy",
    hidden: "Imported energy",
  },
  {
    direction: "imported",
    importedBreakdown: summary.importedBreakdown,
    exportedBreakdown: [],
    shown: "Imported energy",
    hidden: "Exported energy",
  },
];

function renderPanel(
  timeView: GridTimeView,
  options: {
    summary?: GridKpiSummary;
    showBreakdown?: boolean;
  } = {},
) {
  return renderToStaticMarkup(
    <GridKpiPanel
      timeView={timeView}
      periodLabel="November 2025"
      summary={options.summary ?? summary}
      showBreakdown={options.showBreakdown}
    />,
  );
}

describe("GridKpiPanel", () => {
  it("renders the panel heading, period, and responsive KPI layout", () => {
    const markup = renderPanel("year");

    expect(markup).toContain("Grid performance");
    expect(markup).toContain("Summary for November 2025");
    expect(markup).toContain("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12");
  });

  it.each([
    ["year", "Days above 90% capacity"],
    ["month", "Average daily peak import"],
    ["day", "Remaining import headroom"],
  ] as const)("renders the correct %s-specific KPIs", (timeView, label) => {
    const markup = renderPanel(timeView);

    expect(markup).toContain(label);
    expect(markup).toContain("Imported energy");
    expect(markup).toContain("Exported energy");
    expect(markup).toContain("Peak import");
    expect(markup).toContain("Peak export");
  });

  it("renders only the empty state when the summary has no measurements", () => {
    const markup = renderPanel("day", {
      summary: { ...summary, measurementCount: 0 },
      showBreakdown: true,
    });

    expect(markup).toContain("Grid performance");
    expect(markup).toContain("Summary for November 2025");
    expect(markup).toContain("No Grid data is available for the selected period.");
    expect(markup).not.toContain("Peak import");
    expect(markup).not.toContain(">Breakdown<");
  });

  it("renders keyboard-focusable, accessible tooltip triggers", () => {
    const markup = renderPanel("year", { showBreakdown: true });

    expect(markup).toContain('aria-label="More information about imported energy"');
    expect(markup).toContain('aria-label="More information about battery"');
    expect(markup).toContain("<button");
  });

  it("renders context lines and warning tones without hiding the KPI value", () => {
    const markup = renderPanel("year", {
      summary: { ...summary, peakImportKw: 800 },
    });

    expect(markup).toContain("800 kW");
    expect(markup).toContain("Limit: 750 kW");
    expect(markup).toContain("Exceeded by 50 kW");
    expect(markup).toContain("font-medium text-orange-600");
  });

  it("renders unavailable values accessibly", () => {
    const markup = renderPanel("day", {
      summary: {
        ...summary,
        importedEnergyKwh: null,
        remainingImportHeadroomKw: null,
      },
    });

    expect(markup.match(/aria-label="Value unavailable"/g)).toHaveLength(2);
  });

  it("uses four-column spans for the last three of seven year items", () => {
    const markup = renderPanel("year");

    expect(markup.match(/xl:col-span-4/g)).toHaveLength(3);
    expect(markup.match(/xl:col-span-3/g)).toHaveLength(4);
  });

  it("uses three-column spans for every non-seven-item view", () => {
    const markup = renderPanel("month");

    expect(markup).not.toContain("xl:col-span-4");
    expect(markup.match(/xl:col-span-3/g)).toHaveLength(8);
  });

  it("does not render the breakdown unless it is enabled", () => {
    const markup = renderPanel("year");

    expect(markup).not.toContain(">Breakdown<");
    expect(markup).not.toContain("20% of imported energy");
  });

  it("renders imported and exported breakdown groups inside the panel", () => {
    const markup = renderPanel("year", { showBreakdown: true });

    expect(markup.indexOf("Grid performance")).toBeLessThan(markup.indexOf(">Breakdown<"));
    expect(markup).toContain('aria-labelledby="grid-imported-breakdown-title"');
    expect(markup).toContain('aria-labelledby="grid-exported-breakdown-title"');
    expect(markup).toContain(">Imported energy</h4>");
    expect(markup).toContain(">Exported energy</h4>");
    expect(markup).toContain(">Battery</");
    expect(markup).toContain(">Own use</");
    expect(markup).toContain(">Charger</");
    expect(markup).toContain(">Solar</");
    expect(markup).toContain("20 kWh");
    expect(markup).toContain("20% of imported energy");
    expect(markup).toContain("7 kWh");
    expect(markup).toContain("70% of exported energy");
    expect(markup).toContain("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4");
    expect(markup).toContain('<img src="data:image/svg+xml');
    expect(markup).toContain('alt="" aria-hidden="true"');
  });

  it.each(singleBreakdownGroupCases)(
    "renders only the $direction breakdown group when the other group is empty",
    ({ importedBreakdown, exportedBreakdown, shown, hidden }) => {
      const markup = renderPanel("year", {
        summary: { ...summary, importedBreakdown, exportedBreakdown },
        showBreakdown: true,
      });

      expect(markup).toContain(">Breakdown<");
      expect(markup).toContain(`>${shown}</h4>`);
      expect(markup).not.toContain(`>${hidden}</h4>`);
    },
  );

  it("does not render a breakdown section when both presentation lists are empty", () => {
    const markup = renderPanel("year", {
      summary: { ...summary, importedBreakdown: [], exportedBreakdown: [] },
      showBreakdown: true,
    });

    expect(markup).toContain("Peak import");
    expect(markup).not.toContain(">Breakdown<");
  });
});
