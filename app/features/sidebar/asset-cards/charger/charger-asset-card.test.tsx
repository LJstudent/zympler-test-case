import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ChargerAssetCard } from "./charger-asset-card";

describe("ChargerAssetCard", () => {
  it("renders the existing header, daily metrics, and decorative chart", () => {
    const markup = renderToStaticMarkup(
      <ChargerAssetCard
        viewModel={{
          activity: [
            { timestamp: 1, chargedKwh: 4 },
            { timestamp: 2, chargedKwh: 8 },
          ],
          chargedDisplay: "2.84 MWh",
          solarDisplay: "18%",
          hasConsistentSourceData: true,
        }}
      />,
    );

    expect(markup).toContain(">Charger<");
    expect(markup).toContain(">Charged<");
    expect(markup).toContain("2.84 MWh");
    expect(markup).toContain(">Solar<");
    expect(markup).toContain("18%");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain(">Battery<");
    expect(markup).not.toContain("tooltip");
  });

  it("uses the shared empty state instead of zero metrics", () => {
    const markup = renderToStaticMarkup(<ChargerAssetCard viewModel={null} />);

    expect(markup).toContain("No charger data available");
    expect(markup).not.toContain("0 kWh");
    expect(markup).not.toContain(">0%<");
  });

  it("reuses the shared chart and metric skeleton", () => {
    const markup = renderToStaticMarkup(<ChargerAssetCard state="loading" viewModel={null} />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("grid-cols-2");
    expect(markup).not.toContain("No charger data available");
  });
});
