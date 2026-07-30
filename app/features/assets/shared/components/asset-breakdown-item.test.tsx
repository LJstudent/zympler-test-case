import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AssetBreakdownItem } from "./asset-breakdown-item";

describe("AssetBreakdownItem", () => {
  it("uses a list item root and renders metric content with a custom class", () => {
    const markup = renderToStaticMarkup(
      <AssetBreakdownItem
        label="Breakdown metric"
        iconSrc="/metric.svg"
        tooltip="Breakdown explanation"
        value="12 kWh"
        supportingText="25% of total"
        className="custom-item"
      />,
    );

    expect(markup).toMatch(/<li [^>]*>.*<\/li>$/);
    expect(markup).toContain("Breakdown metric");
    expect(markup).toContain('aria-label="More information about breakdown metric"');
    expect(markup).toContain("12 kWh");
    expect(markup).toContain("25% of total");
    expect(markup).toContain("custom-item");
  });

  it("preserves the display value and marks an unavailable value accessibly", () => {
    const markup = renderToStaticMarkup(
      <AssetBreakdownItem
        label="Unavailable breakdown"
        iconSrc="/metric.svg"
        tooltip="Breakdown explanation"
        value="—"
        valueAvailable={false}
      />,
    );

    expect(markup).toContain('aria-label="Value unavailable"');
    expect(markup).toContain(">—<");
  });
});
