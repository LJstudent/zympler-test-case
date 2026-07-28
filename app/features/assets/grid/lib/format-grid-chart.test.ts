import { describe, expect, it } from "vitest";

import {
  formatGridAxisTimestamp,
  formatGridTooltipTimestamp,
  getMonthRawAxisTicks,
} from "./format-grid-chart";

describe("formatGridTooltipTimestamp", () => {
  it.each([
    ["2025-03-01T00:00:00Z", "year", "combined", "March 2025"],
    ["2025-03-12T00:00:00Z", "year", "raw", "12 March 2025"],
    ["2025-03-12T00:00:00Z", "month", "combined", "12 March 2025"],
    ["2025-03-12T14:00:00Z", "month", "raw", "12 March 2025, 14:00"],
    ["2025-03-12T14:00:00Z", "day", "combined", "14:00"],
    ["2025-03-12T14:15:00Z", "day", "raw", "14:15"],
  ] as const)(
    "formats %s in %s %s at its aggregation granularity",
    (timestamp, view, aggregation, expected) => {
      expect(formatGridTooltipTimestamp(new Date(timestamp), view, aggregation)).toBe(expected);
    },
  );
});

describe("month raw axis formatting", () => {
  it("uses compact dates and selects only spaced daily boundaries", () => {
    const data = Array.from({ length: 10 * 24 }, (_, index) => ({
      timestampMs: Date.parse("2025-03-01T00:00:00Z") + index * 60 * 60 * 1_000,
    }));

    const ticks = getMonthRawAxisTicks(data);

    expect(
      ticks.map((timestamp) => formatGridAxisTimestamp(new Date(timestamp), "month", "raw")),
    ).toEqual(["1 Mar", "5 Mar", "10 Mar"]);
    expect(ticks.every((timestamp) => new Date(timestamp).getUTCHours() === 0)).toBe(true);
  });
});
