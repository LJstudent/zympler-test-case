import { useEffect, useState } from "react";

export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export function getHasFinePointer(target: Pick<Window, "matchMedia"> | undefined): boolean {
  return target?.matchMedia(FINE_POINTER_QUERY).matches ?? true;
}

/**
 * Defaults to the desktop variant so the server render and first client render
 * are identical. The actual input capability is applied immediately after hydration.
 */
export function useHasFinePointer(): boolean {
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    const update = () => setHasFinePointer(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return hasFinePointer;
}
