import { describe, expect, it } from "vitest";

import { createChargerTestRow } from "./charger-test-data";
import { validateChargerBreakdown } from "./validate-charger-breakdown";

describe("validateChargerBreakdown", () => {
  it("accepts breakdown totals within the floating-point tolerance", () => {
    const issues = validateChargerBreakdown([createChargerTestRow({ gridToChargerKwh: 60.005 })]);

    expect(issues).toEqual([]);
  });

  it("reports differences without adding or reconciling a remainder", () => {
    const issues = validateChargerBreakdown([createChargerTestRow({ totalChargedKwh: 110 })]);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      totalChargedKwh: 110,
      breakdownTotalKwh: 100,
      differenceKwh: -10,
    });
  });
});
