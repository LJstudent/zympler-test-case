import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { AssetDetailLayout } from "./asset-detail-layout";

describe("AssetDetailLayout", () => {
  it("keeps the desktop sidebar independent from the detail page height", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AssetDetailLayout rows={[]} activePage="grid">
          <div>Asset details</div>
        </AssetDetailLayout>
      </MemoryRouter>,
    );

    expect(markup).toContain("overflow-x-clip");
    expect(markup).toContain("items-start");
    expect(markup).toContain("lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)] lg:self-start");
    expect(markup).toContain("min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain");
  });
});
