import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OverviewSection } from "./overview-section";

describe("OverviewSection", () => {
  it("uses the overview loading state for both the heading and cards", () => {
    const markup = renderToStaticMarkup(<OverviewSection state="loading" />);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('class="space-y-6 p-5"');
    expect(markup).toContain("animate-pulse rounded-md bg-slate-200/80");
    expect(markup).toContain("h-7 w-40");
    expect(markup).not.toContain("Zympler overview");
  });
});
