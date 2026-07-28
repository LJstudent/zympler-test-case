import { describe, expect, it } from "vitest";

import { BREAKDOWN_CHARGER_SERIES, COMBINED_CHARGER_SERIES } from "../constants/charger-constants";
import { createChargerTestRow } from "./charger-test-data";
import { transformChargerData } from "./transform-charger-data";

describe("transformChargerData", () => {
  it("aggregates the total and four source fields without deriving a remainder", () => {
    const data = transformChargerData(
      [createChargerTestRow(), createChargerTestRow({ start: "2025-01-01T00:15:00Z" })],
      "day",
      "combined",
      "2025-01-01",
    );

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      totalCharged: 200,
      solarToCharger: 40,
      batterySolarToCharger: 10,
      batteryGridToCharger: 30,
      gridToCharger: 120,
    });
    expect(Object.keys(data[0] ?? {})).not.toContain("remainder");
  });

  it("defines one positive combined series and four stacked breakdown series", () => {
    expect(COMBINED_CHARGER_SERIES).toHaveLength(1);
    expect(COMBINED_CHARGER_SERIES[0]?.key).toBe("totalCharged");
    expect(BREAKDOWN_CHARGER_SERIES).toHaveLength(4);
    expect(BREAKDOWN_CHARGER_SERIES.every((series) => series.stackId === "charger")).toBe(true);
  });
});
