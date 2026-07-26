import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GridAssetCard } from "./grid-asset-card";

describe("GridAssetCard", () => {
  it("renders accessible daily totals and a decorative chart", () => {
    const markup = renderToStaticMarkup(
      <GridAssetCard
        viewModel={{
          activity: [
            { timestamp: 1, netGridKwh: 4 },
            { timestamp: 2, netGridKwh: -2 },
          ],
          importDisplay: "1.82 MWh",
          exportDisplay: "324 kWh",
        }}
      />,
    );

    expect(markup).toContain(">Grid<");
    expect(markup).toContain(">Import<");
    expect(markup).toContain("1.82 MWh");
    expect(markup).toContain(">Export<");
    expect(markup).toContain("324 kWh");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain("tooltip");
  });

  it("uses the shared empty state instead of zero totals", () => {
    const markup = renderToStaticMarkup(<GridAssetCard viewModel={null} />);

    expect(markup).toContain("No grid data available");
    expect(markup).not.toContain("0 kWh");
  });

  it("keeps the chart and metric skeleton layout while loading", () => {
    const markup = renderToStaticMarkup(<GridAssetCard state="loading" viewModel={null} />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("grid-cols-2");
    expect(markup).not.toContain("No grid data available");
  });
});
