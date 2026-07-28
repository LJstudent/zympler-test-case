import { describe, expect, it } from "vitest";

import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from "./onboarding-steps";

describe("onboarding configuration", () => {
  it("uses a stable versioned key and four ordered steps", () => {
    expect(ONBOARDING_STORAGE_KEY).toBe("zympler-dashboard-onboarding-v1");
    expect(ONBOARDING_STEPS.map((step) => step.id)).toEqual([
      "overview",
      "assets",
      "charts",
      "kpis",
    ]);
  });

  it("provides the real mobile navigation sequence for the asset step", () => {
    const assetStep = ONBOARDING_STEPS.find((step) => step.id === "assets");

    expect(assetStep?.mobileImages).toHaveLength(3);
    expect(assetStep?.description).toContain("Grid, Charger, Battery or Solar");
  });
});
