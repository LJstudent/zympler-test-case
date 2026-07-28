import { describe, expect, it } from "vitest";

import type { AssetPeriodOption } from "../types/asset-detail-types";
import { getCalendarDayKey, parseAssetDayKey, resolveAssetPeriodKey } from "./asset-time";

function option(key: string): AssetPeriodOption {
  return {
    key,
    label: key,
    start: new Date(`${key}T00:00:00.000Z`),
  };
}

describe("asset calendar days", () => {
  it("round-trips a calendar day without converting it through UTC", () => {
    const date = new Date(2025, 11, 31);

    expect(getCalendarDayKey(date)).toBe("2025-12-31");
    expect(parseAssetDayKey("2025-12-31")).toEqual(date);
  });

  it("rejects malformed and impossible day keys", () => {
    expect(parseAssetDayKey("2025-02-29")).toBeUndefined();
    expect(parseAssetDayKey("31-12-2025")).toBeUndefined();
  });

  it("keeps a valid selection and otherwise falls back to the newest available day", () => {
    const options = [option("2025-12-31"), option("2025-12-30")];

    expect(resolveAssetPeriodKey(options, "2025-12-30")).toBe("2025-12-30");
    expect(resolveAssetPeriodKey(options, "2024-01-01")).toBe("2025-12-31");
    expect(resolveAssetPeriodKey([], "2025-12-31")).toBe("");
  });
});
