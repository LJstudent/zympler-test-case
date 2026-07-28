import { describe, expect, it } from "vitest";

import {
  formatPeakTimestamp,
  formatPowerValue,
  formatViolationCount,
} from "./format-grid-compliance";

describe("grid compliance presentation formatting", () => {
  it("formats power without changing the source precision", () => {
    const peakKw = 750.123456;

    expect(formatPowerValue(peakKw, "en")).toBe("750.1");
    expect(peakKw).toBe(750.123456);
  });

  it("formats a valid peak timestamp and protects against invalid dates", () => {
    expect(formatPeakTimestamp(new Date("2025-03-18T14:15:00.000Z"), "en-GB")).toBe(
      "18 Mar, 14:15",
    );
    expect(formatPeakTimestamp(new Date(Number.NaN))).toBe("—");
  });

  it("uses correct singular, plural, and zero violation labels", () => {
    expect(formatViolationCount("import", 0)).toBe("No import violations");
    expect(formatViolationCount("import", 1)).toBe("1 import violation");
    expect(formatViolationCount("export", 3)).toBe("3 export violations");
  });
});
