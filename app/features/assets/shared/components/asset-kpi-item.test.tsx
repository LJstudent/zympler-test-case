import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AssetKpiItem } from "./asset-kpi-item";

describe("AssetKpiItem", () => {
  it("renders its metric content, context, warning tone, and custom class", () => {
    const markup = renderToStaticMarkup(
      <AssetKpiItem
        label="Primary metric"
        iconSrc="/metric.svg"
        tooltip="Metric explanation"
        value="42 kWh"
        supportingText="Supporting content"
        context={[
          { text: "Normal context", tone: "muted" },
          { text: "Warning context", tone: "warning" },
        ]}
        className="xl:col-span-4"
      />,
    );

    expect(markup).toContain("Primary metric");
    expect(markup).toContain('src="/metric.svg"');
    expect(markup).toContain('alt="" aria-hidden="true"');
    expect(markup).toContain('aria-label="More information about primary metric"');
    expect(markup).toContain("42 kWh");
    expect(markup).toContain("Supporting content");
    expect(markup).toContain("Normal context");
    expect(markup).toContain("Warning context");
    expect(markup).toContain("font-medium text-orange-600");
    expect(markup).toContain("xl:col-span-4");
  });

  it("preserves the display value and marks an unavailable value accessibly", () => {
    const markup = renderToStaticMarkup(
      <AssetKpiItem
        label="Unavailable metric"
        iconSrc="/metric.svg"
        tooltip="Metric explanation"
        value="—"
        valueAvailable={false}
      />,
    );

    expect(markup).toContain('aria-label="Value unavailable"');
    expect(markup).toContain(">—<");
  });
});
