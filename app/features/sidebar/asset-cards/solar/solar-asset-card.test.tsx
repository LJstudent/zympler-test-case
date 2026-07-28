import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SolarAssetCard } from "./solar-asset-card";

describe("SolarAssetCard", () => {
  it("renders the existing header, centered generation, and decorative chart", () => {
    const markup = renderToStaticMarkup(
      <SolarAssetCard
        viewModel={{
          activity: [
            { timestamp: 1, generatedKwh: 0 },
            { timestamp: 2, generatedKwh: 8 },
          ],
          generatedDisplay: "2.48 MWh",
        }}
      />,
    );

    expect(markup).toContain(">Solar<");
    expect(markup).toContain(">Generated<");
    expect(markup).toContain("2.48 MWh");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("text-center");
    expect(markup).not.toContain(">Export<");
    expect(markup).not.toContain("tooltip");
  });

  it("uses the shared empty state without misleading zero generation", () => {
    const markup = renderToStaticMarkup(<SolarAssetCard viewModel={null} />);

    expect(markup).toContain("No solar data available");
    expect(markup).not.toContain("0 kWh");
  });

  it("reuses the centered single-metric skeleton", () => {
    const markup = renderToStaticMarkup(<SolarAssetCard state="loading" viewModel={null} />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("items-center");
    expect(markup).not.toContain("grid-cols-2");
    expect(markup).not.toContain("No solar data available");
  });
});
