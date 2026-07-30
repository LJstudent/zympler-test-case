import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { GridCapacityLimits } from "./grid-capacity-config";
import { GridComplianceCard } from "./grid-compliance-card";
import { calculateGridComplianceKpi } from "./grid-compliance-kpi";
import type { GridMeasurementRow } from "./grid-compliance-kpi";

const limits: GridCapacityLimits = { importKw: 750, exportKw: 500 };

function row(importKw: number | null, exportKw: number | null): GridMeasurementRow {
  const start = new Date("2025-03-18T14:15:00.000Z");

  return {
    start,
    end: new Date(start.getTime() + 15 * 60 * 1_000),
    measurement: { gridImportKwh: importKw, gridExportKwh: exportKw },
  };
}

function renderCard(rows: readonly GridMeasurementRow[]) {
  const kpi = calculateGridComplianceKpi(rows, limits, "power-kw");

  return renderToStaticMarkup(
    <MemoryRouter>
      <GridComplianceCard kpi={kpi} />
    </MemoryRouter>,
  );
}

function renderedText(markup: string): string {
  return markup.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

describe("GridComplianceCard", () => {
  it("renders compliance, directional violations, peaks, limits, and status", () => {
    const markup = renderCard([row(812, 400), row(100, 534)]);
    const text = renderedText(markup);

    expect(text).toContain("0.0%");
    expect(text).toContain("1 import violation");
    expect(text).toContain("1 export violation");
    expect(text).toContain("812 / 750 kW");
    expect(text).toContain("534 / 500 kW");
    expect(text).toContain("Exceeded by 62 kW");
    expect(text).toContain("Exceeded by 34 kW");
    expect(text).toContain("18 Mar, 14:15");
  });

  it("renders valid zero usage as fully compliant rather than empty", () => {
    const markup = renderCard([row(0, 0)]);
    const text = renderedText(markup);

    expect(text).toContain("100.0%");
    expect(text).toContain("No import violations");
    expect(text).toContain("No export violations");
    expect(text).toContain("0 / 750 kW");
    expect(text).toContain("750 kW headroom");
    expect(text).toContain("0 / 500 kW");
    expect(text).toContain("500 kW headroom");
  });

  it("renders the grid-specific empty state for invalid measurements", () => {
    const markup = renderCard([row(null, 0)]);

    expect(markup).toContain("No grid measurements available");
    expect(markup).not.toContain("0.0%");
    expect(markup).not.toContain("Invalid Date");
  });

  it("provides separate accessible navigation and tooltip controls", () => {
    const markup = renderCard([row(0, 0)]);

    expect(markup).toContain('href="/overview/grid-compliance"');
    expect(markup).toContain('aria-label="Open grid compliance details"');
    expect(markup).toContain('aria-label="About grid compliance"');
    expect(markup).not.toMatch(/<a[^>]*>[^]*<button[^>]*>[^]*<\/button>[^]*<\/a>/);
  });
});
