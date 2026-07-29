import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { DashboardLayout } from "~/layouts/dashboard-layout";

describe("dashboard hydration fallback", () => {
  it("does not mount the onboarding modal or manual action while loading", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <DashboardLayout state="loading" />
      </MemoryRouter>,
    );

    expect(markup).not.toContain("Welcome to Zympler");
    expect(markup).not.toContain("View tutorial");
    expect(markup).toContain("Loading system information");
  });
});
