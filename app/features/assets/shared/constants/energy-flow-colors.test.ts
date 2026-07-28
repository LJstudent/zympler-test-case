import { describe, expect, it } from "vitest";

import { ENERGY_FLOW_COLORS } from "./energy-flow-colors";

describe("ENERGY_FLOW_COLORS", () => {
  it("keeps shared Solar flow colors aligned with the semantic palette", () => {
    expect(ENERGY_FLOW_COLORS.solarProduction).toBe("#FBBF24");
    expect(ENERGY_FLOW_COLORS.solarToGrid).toBe("#FBBF24");
    expect(ENERGY_FLOW_COLORS.toBattery).toBe("#22C55E");
    expect(ENERGY_FLOW_COLORS.toCharger).toBe("#0EA5E9");
    expect(ENERGY_FLOW_COLORS.ownUse).toBe("#CBD5E1");
  });

  it("keeps Charger source colors aligned with existing Grid and Battery origins", () => {
    expect(ENERGY_FLOW_COLORS.gridSource).toBe("#315fa8");
    expect(ENERGY_FLOW_COLORS.batterySolarOrigin).toBe(ENERGY_FLOW_COLORS.solarBatteryToGrid);
    expect(ENERGY_FLOW_COLORS.batteryGridOrigin).toBe(ENERGY_FLOW_COLORS.gridBatteryToGrid);
  });
});
