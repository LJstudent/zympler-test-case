import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AssetKpiPanel } from "./asset-kpi-panel";

describe("AssetKpiPanel", () => {
  it("renders a labelled panel with its period and children", () => {
    const markup = renderToStaticMarkup(
      <AssetKpiPanel title="Performance" periodLabel="2025" className="min-h-64">
        <p>Panel content</p>
      </AssetKpiPanel>,
    );
    const titleId = markup.match(/<h2 id="([^"]+)"/)?.[1];

    expect(titleId).toBeDefined();
    expect(markup).toContain(`aria-labelledby="${titleId}"`);
    expect(markup).toContain(">Performance<");
    expect(markup).toContain("Summary for 2025");
    expect(markup).toContain("Panel content");
    expect(markup).toContain("min-h-64");
  });
});
