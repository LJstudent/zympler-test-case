import assetsDesktopScreenshot from "../assets/assets-desktop.webp";
import chartScreenshot from "../assets/chart.webp";
import kpisScreenshot from "../assets/kpis.webp";
import mobileNavigationClosedScreenshot from "../assets/mobile-navigation-closed.webp";
import mobileNavigationOpenBottomScreenshot from "../assets/mobile-navigation-open-bottom.webp";
import mobileNavigationOpenScreenshot from "../assets/mobile-navigation-open.webp";
import overviewDesktopScreenshot from "../assets/overview-desktop.webp";
import type { OnboardingStep } from "../types/onboarding-types";

export const ONBOARDING_STORAGE_KEY = "zympler-dashboard-onboarding-v1";

export const ONBOARDING_TEXT = {
  dialogTitle: "Welcome to Zympler",
  dialogDescription: "A quick guide to the dashboard and your connected energy assets.",
  close: "Close tutorial",
  manualTrigger: "View tutorial",
  skip: "Skip",
  back: "Back",
  next: "Next",
  getStarted: "Get started",
  progress: (current: number, total: number) => `${current} of ${total}`,
} as const;

export const ONBOARDING_STEPS = [
  {
    id: "overview",
    title: "Your energy system at a glance",
    description:
      "The status cards show whether your connected systems are operating correctly. The insights below explain how Zympler has managed energy for your organisation.",
    desktopImage: {
      src: overviewDesktopScreenshot,
      alt: "Overview of system status and energy management insights in Zympler",
    },
  },
  {
    id: "assets",
    title: "Explore your assets",
    description:
      "Select Grid, Charger, Battery or Solar to view detailed performance. On smaller screens, open the asset navigation using the menu button in the top-left corner.",
    desktopImage: {
      src: assetsDesktopScreenshot,
      alt: "Zympler dashboard and asset navigation",
    },
    mobileImages: [
      {
        src: mobileNavigationClosedScreenshot,
        alt: "Mobile dashboard with the navigation menu button in the top-left corner",
      },
      {
        src: mobileNavigationOpenScreenshot,
        alt: "Top of the open mobile asset navigation showing Grid and Charger",
      },
      {
        src: mobileNavigationOpenBottomScreenshot,
        alt: "Lower part of the mobile asset navigation showing Battery and Solar",
      },
    ],
  },
  {
    id: "charts",
    title: "Understand energy over time",
    description:
      "Switch between yearly, monthly and daily views. Hover or tap the chart to inspect an interval, and use Breakdown to see where the energy came from or where it went.",
    desktopImage: {
      src: chartScreenshot,
      alt: "Charger energy chart with period, detail and Breakdown controls",
    },
  },
  {
    id: "kpis",
    title: "Focus on the metrics that matter",
    description:
      "The KPI cards summarise the most important results for the selected asset and period. Additional metrics may appear when Breakdown is enabled. Use the information icons for more context.",
    desktopImage: {
      src: kpisScreenshot,
      alt: "Charger chart and KPI cards with Breakdown enabled",
    },
  },
] as const satisfies readonly OnboardingStep[];
