import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "~/components/ui/calendar";

import type { AssetPeriodOption } from "../types/asset-detail-types";
import { AssetChartToolbar } from "./asset-chart-toolbar";

const dayOptions: AssetPeriodOption[] = [
  {
    key: "2025-12-31",
    label: "31 Dec 2025",
    start: new Date("2025-12-31T00:00:00.000Z"),
  },
  {
    key: "2025-12-30",
    label: "30 Dec 2025",
    start: new Date("2025-12-30T00:00:00.000Z"),
  },
];

function renderToolbar(timeView: "year" | "day", periodOptions = dayOptions) {
  return renderToStaticMarkup(
    <AssetChartToolbar
      timeView={timeView}
      aggregation="combined"
      breakdown={false}
      periodKey={periodOptions[0]?.key ?? ""}
      periodOptions={periodOptions}
      onTimeViewChange={vi.fn()}
      onAggregationChange={vi.fn()}
      onPeriodChange={vi.fn()}
      onBreakdownChange={vi.fn()}
    />,
  );
}

describe("AssetChartToolbar", () => {
  it("renders the compact shared date trigger only for Day", () => {
    const markup = renderToolbar("day");

    expect(markup).toContain("31 December 2025");
    expect(markup).toContain("Select day. Currently selected:");
    expect(markup).not.toContain("<select");
  });

  it("leaves the non-Day selector unchanged", () => {
    const markup = renderToolbar("year", [
      { key: "2025", label: "2025", start: new Date("2025-01-01T00:00:00.000Z") },
    ]);

    expect(markup).toContain("<select");
    expect(markup).toContain('<option value="2025" selected="">2025</option>');
  });

  it("renders a disabled empty state instead of an invalid date", () => {
    const markup = renderToolbar("day", []);

    expect(markup).toContain("No dates available");
    expect(markup).toContain("disabled");
  });

  it("exposes unavailable calendar days as disabled buttons", () => {
    const selected = new Date(2025, 11, 31);
    const markup = renderToStaticMarkup(
      <Calendar
        mode="single"
        selected={selected}
        defaultMonth={selected}
        disabled={(date) => date.getDate() !== 31}
      />,
    );

    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('disabled=""');
  });
});
