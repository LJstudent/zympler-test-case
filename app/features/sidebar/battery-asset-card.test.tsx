import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BatteryAssetCard } from "./battery-asset-card";

describe("BatteryAssetCard", () => {
  it("renders the existing header, centered energy shifted KPI, and decorative chart", () => {
    const markup = renderToStaticMarkup(
      <BatteryAssetCard
        viewModel={{
          activity: [
            { timestamp: 1, batteryActivityKwh: -4 },
            { timestamp: 2, batteryActivityKwh: 8 },
          ],
          energyShiftedDisplay: "336.5 kWh",
        }}
      />,
    );

    expect(markup).toContain(">Battery<");
    expect(markup).toContain(">Energy shifted<");
    expect(markup).toContain("336.5 kWh");
    expect(markup).toContain("Total energy that flowed into and out of the battery today.");
    expect(markup).toContain(
      "This combines all charging and discharging activity and indicates how actively the battery was used by the Energy Management System.",
    );
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("text-center");
    expect(markup).not.toContain(">Profit<");
    expect(markup).not.toContain(">Charged<");
  });

  it("uses the shared empty state without a misleading zero throughput", () => {
    const markup = renderToStaticMarkup(<BatteryAssetCard viewModel={null} />);

    expect(markup).toContain("No battery data available");
    expect(markup).not.toContain("0 kWh");
  });

  it("uses a centered single-metric skeleton", () => {
    const markup = renderToStaticMarkup(<BatteryAssetCard state="loading" viewModel={null} />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("items-center");
    expect(markup).not.toContain("grid-cols-2");
    expect(markup).not.toContain("No battery data available");
  });
});
