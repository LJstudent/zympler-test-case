import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AssetTooltip } from "../../shared";
import { BREAKDOWN_CHARGER_SERIES, COMBINED_CHARGER_SERIES } from "../constants/charger-constants";
import type { ChargerChartDatum } from "../types/charger-types";

const datum: ChargerChartDatum = {
  timestamp: "2025-01-01T00:00:00.000Z",
  timestampMs: Date.parse("2025-01-01T00:00:00.000Z"),
  intervalEndMs: Date.parse("2025-01-01T00:15:00.000Z"),
  label: "00:00",
  totalCharged: 100,
  solarToCharger: 20,
  batterySolarToCharger: 5,
  batteryGridToCharger: 15,
  gridToCharger: 60,
};

describe("Charger tooltip presentation", () => {
  it("shows charged energy in combined view", () => {
    const markup = renderToStaticMarkup(
      <AssetTooltip
        active
        payload={[{ payload: datum }]}
        series={COMBINED_CHARGER_SERIES}
        metric="energy"
        timeView="day"
        aggregation="raw"
      />,
    );

    expect(markup).toContain("Charged energy");
    expect(markup).toContain("100 kWh");
  });

  it("shows the total and all four friendly source labels in breakdown view", () => {
    const markup = renderToStaticMarkup(
      <AssetTooltip
        active
        payload={[{ payload: datum }]}
        series={BREAKDOWN_CHARGER_SERIES}
        metric="energy"
        timeView="day"
        aggregation="raw"
        totals={[{ key: "totalCharged", label: "Total charged" }]}
        totalsFirst
      />,
    );

    expect(markup).toContain("Total charged");
    expect(markup).toContain("Solar → Charger");
    expect(markup).toContain("Battery → Charger (Solar)");
    expect(markup).toContain("Battery → Charger (Grid)");
    expect(markup).toContain("Grid → Charger");
    expect(markup).toContain("00:00–00:15");
  });
});
