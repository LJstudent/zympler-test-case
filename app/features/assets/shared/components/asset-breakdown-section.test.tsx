import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AssetBreakdownSection } from "./asset-breakdown-section";

describe("AssetBreakdownSection", () => {
  it("renders a labelled section, separator, children, and custom class", () => {
    const markup = renderToStaticMarkup(
      <AssetBreakdownSection title="Breakdown" className="section-class">
        <p>Breakdown content</p>
      </AssetBreakdownSection>,
    );
    const titleId = markup.match(/<h3 id="([^"]+)"/)?.[1];

    expect(titleId).toBeDefined();
    expect(markup).toContain(`aria-labelledby="${titleId}"`);
    expect(markup).toContain("my-6");
    expect(markup).toContain(">Breakdown<");
    expect(markup).toContain("Breakdown content");
    expect(markup).toContain("section-class");
  });
});
