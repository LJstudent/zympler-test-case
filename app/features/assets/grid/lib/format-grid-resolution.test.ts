import { describe, expect, it } from "vitest";

import { formatGridResolution } from "./format-grid-resolution";

describe("formatGridResolution", () => {
  it.each([
    [12, "year", "combined", "12 monthly totals"],
    [365, "year", "raw", "365 daily totals"],
    [31, "month", "combined", "31 daily totals"],
    [744, "month", "raw", "744 hourly intervals"],
    [24, "day", "combined", "24 hourly totals"],
    [96, "day", "raw", "96 quarter-hour intervals"],
    [1, "month", "combined", "1 daily total"],
    [1, "month", "raw", "1 hourly interval"],
  ] as const)("formats %i %s %s", (count, view, aggregation, expected) => {
    expect(formatGridResolution(count, view, aggregation)).toBe(expected);
  });
});
