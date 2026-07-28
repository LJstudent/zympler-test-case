import { Menu } from "lucide-react";
import { useState, useSyncExternalStore, type MouseEvent } from "react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import type { ContentState } from "~/components/ui/content-state";
import type { EnergyDataRow } from "~/features/energy-data";

import { DashboardSidebar } from "./sidebar";

const DESKTOP_MEDIA_QUERY = "(min-width: 64rem)";

function subscribeToDesktopViewport(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function isDesktopViewport() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

function useIsDesktopViewport() {
  return useSyncExternalStore(subscribeToDesktopViewport, isDesktopViewport, () => true);
}

type ResponsiveDashboardSidebarProps = {
  state?: ContentState;
  rows?: readonly EnergyDataRow[];
  activePage?: "overview" | "grid" | "solar" | "charger" | "battery";
};

export function ResponsiveDashboardSidebar(props: ResponsiveDashboardSidebarProps) {
  const isDesktop = useIsDesktopViewport();
  const [isOpen, setIsOpen] = useState(false);

  if (isDesktop) {
    return (
      <div className="hidden lg:block">
        <DashboardSidebar {...props} />
      </div>
    );
  }

  function closeAfterNavigation(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a[href]") !== null) {
      setIsOpen(false);
    }
  }

  return (
    <div className="h-10">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open navigation">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="h-dvh w-screen max-w-none border-0 p-3 pr-3 sm:p-4 sm:pr-4"
          onClickCapture={closeAfterNavigation}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DashboardSidebar {...props} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
