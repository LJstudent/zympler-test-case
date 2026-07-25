import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BatteryAssetCard } from "./battery-asset-card";

describe("BatteryAssetCard", () => {
  it("renders the existing header, centered profit, and decorative chart", () => {
    const markup = renderToStaticMarkup(
      <BatteryAssetCard
        viewModel={{
          activity: [
            { timestamp: 1, batteryActivityKwh: -4 },
            { timestamp: 2, batteryActivityKwh: 8 },
          ],
          profitDisplay: "€ 84,32",
        }}
      />,
    );

    expect(markup).toContain(">Battery<");
    expect(markup).toContain(">Profit<");
    expect(markup).toContain("€ 84,32");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("text-center");
    expect(markup).not.toContain(">Charged<");
    expect(markup).not.toContain("tooltip");
  });

  it("uses the shared empty state without a misleading zero profit", () => {
    const markup = renderToStaticMarkup(<BatteryAssetCard viewModel={null} />);

    expect(markup).toContain("No battery data available");
    expect(markup).not.toContain("€ 0,00");
  });

  it("uses a centered single-metric skeleton", () => {
    const markup = renderToStaticMarkup(<BatteryAssetCard state="loading" viewModel={null} />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("items-center");
    expect(markup).not.toContain("grid-cols-2");
    expect(markup).not.toContain("No battery data available");
  });
});
