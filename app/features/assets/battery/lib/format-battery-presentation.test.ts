import { describe, expect, it } from "vitest";

import { formatBatteryAxisEnergy, formatBatteryMoney } from "./format-battery-presentation";

describe("Battery presentation formatting", () => {
  it("formats positive and negative euro values with Dutch separators", () => {
    expect(formatBatteryMoney(133.05)).toBe("€133,05");
    expect(formatBatteryMoney(-1064.65)).toBe("-€1.064,65");
  });

  it("uses Dutch decimal separators on the energy axis", () => {
    expect(formatBatteryAxisEnergy(1596)).toBe("1,6k");
    expect(formatBatteryAxisEnergy(-1596)).toBe("-1,6k");
  });
});
