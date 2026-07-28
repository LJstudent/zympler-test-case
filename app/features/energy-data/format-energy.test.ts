import { describe, expect, it } from "vitest";

import { formatEnergy } from "./format-energy";

describe("formatEnergy", () => {
  it("automatically scales kWh to MWh and GWh", () => {
    expect(formatEnergy(732)).toBe("732 kWh");
    expect(formatEnergy(84_300)).toBe("84.3 MWh");
    expect(formatEnergy(1_240_000)).toBe("1.24 GWh");
  });
});
