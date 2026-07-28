import { describe, expect, it } from "vitest";

import { FINE_POINTER_QUERY, getHasFinePointer } from "./use-fine-pointer";

describe("getHasFinePointer", () => {
  it("uses the desktop variant during SSR", () => {
    expect(getHasFinePointer(undefined)).toBe(true);
  });

  it("queries input capability instead of viewport width", () => {
    let receivedQuery = "";
    const target = {
      matchMedia(query: string) {
        receivedQuery = query;
        return { matches: false } as MediaQueryList;
      },
    };

    expect(getHasFinePointer(target)).toBe(false);
    expect(receivedQuery).toBe(FINE_POINTER_QUERY);
  });
});
