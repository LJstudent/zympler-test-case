import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import gridIcon from "~/assets/systems/utility-pole.svg";

import { GRID_CAPACITY_LIMITS } from "../constants/grid-constants";
import type {
  GridBreakdownId,
  GridBreakdownPresentationItem,
  GridKpiId,
  GridKpiContextLine,
  GridKpiPresentationInput,
  GridKpiPresentationItem,
} from "../types/grid-kpi-types";
import {
  formatGridCount,
  formatGridDate,
  formatGridDuration,
  formatGridEnergy,
  formatGridPercentage,
  formatGridPower,
} from "./format-grid-kpi";

const UNAVAILABLE = "—";

type Definition = {
  id: GridKpiId;
  label: string;
  tooltip: string;
  iconSrc: string;
};

const definitions: Record<GridKpiId, Definition> = {
  "imported-energy": {
    id: "imported-energy",
    label: "Imported energy",
    tooltip: "Total electrical energy drawn from the grid during the selected period.",
    iconSrc: gridIcon,
  },
  "exported-energy": {
    id: "exported-energy",
    label: "Exported energy",
    tooltip: "Total electrical energy supplied back to the grid during the selected period.",
    iconSrc: gridIcon,
  },
  "peak-import": {
    id: "peak-import",
    label: "Peak import",
    tooltip: "The highest grid import power recorded during the selected period.",
    iconSrc: gridIcon,
  },
  "peak-export": {
    id: "peak-export",
    label: "Peak export",
    tooltip: "The highest grid export power recorded during the selected period.",
    iconSrc: gridIcon,
  },
  "import-violations": {
    id: "import-violations",
    label: "Import limit violations",
    tooltip: `Number of measurement intervals where grid import exceeded the configured ${GRID_CAPACITY_LIMITS.importKw} kW limit.`,
    iconSrc: gridIcon,
  },
  "export-violations": {
    id: "export-violations",
    label: "Export limit violations",
    tooltip: `Number of measurement intervals where grid export exceeded the configured ${GRID_CAPACITY_LIMITS.exportKw} kW limit.`,
    iconSrc: gridIcon,
  },
  "days-near-capacity": {
    id: "days-near-capacity",
    label: "Days above 90% capacity",
    tooltip: `Number of days containing at least one interval where grid import exceeded 90% of the configured ${GRID_CAPACITY_LIMITS.importKw} kW import limit.`,
    iconSrc: gridIcon,
  },
  "average-daily-peak": {
    id: "average-daily-peak",
    label: "Average daily peak import",
    tooltip: "The average of each day’s highest grid import value during the selected month.",
    iconSrc: gridIcon,
  },
  "worst-day": {
    id: "worst-day",
    label: "Worst day",
    tooltip: "The day with the highest recorded grid import peak during the selected month.",
    iconSrc: gridIcon,
  },
  "remaining-headroom": {
    id: "remaining-headroom",
    label: "Remaining import headroom",
    tooltip: `The remaining capacity between the day’s highest grid import peak and the configured ${GRID_CAPACITY_LIMITS.importKw} kW import limit.`,
    iconSrc: gridIcon,
  },
  "time-near-capacity": {
    id: "time-near-capacity",
    label: "Time above 90% capacity",
    tooltip: `Total duration during the selected day where grid import exceeded 90% of the configured ${GRID_CAPACITY_LIMITS.importKw} kW import limit.`,
    iconSrc: gridIcon,
  },
};

function item(
  id: GridKpiId,
  value: string | null,
  supportingText?: string,
  context?: GridKpiContextLine[],
): GridKpiPresentationItem {
  const definition = definitions[id];
  return {
    ...definition,
    accessibleLabel: `More information about ${definition.label.toLowerCase()}`,
    value: value ?? UNAVAILABLE,
    valueAvailable: value !== null,
    supportingText,
    context,
  };
}

function peakContext(
  peakKw: number | null,
  limitKw: number,
  locale: string,
): GridKpiContextLine[] | undefined {
  if (peakKw === null) return undefined;
  const exceededByKw = Math.max(0, peakKw - limitKw);
  const remainingKw = Math.max(0, limitKw - peakKw);
  const tone = exceededByKw > 0 ? "warning" : "muted";

  return [
    { text: `Limit: ${formatGridPower(limitKw, locale)}`, tone },
    {
      text:
        exceededByKw > 0
          ? `Exceeded by ${formatGridPower(exceededByKw, locale)}`
          : `${formatGridPower(remainingKw, locale)} remaining`,
      tone,
    },
  ];
}

export function createGridKpiPresentation({
  summary,
  timeView,
  locale = "en",
}: GridKpiPresentationInput): GridKpiPresentationItem[] {
  const shared = [
    item(
      "imported-energy",
      summary.importedEnergyKwh === null
        ? null
        : formatGridEnergy(summary.importedEnergyKwh, locale),
    ),
    item(
      "exported-energy",
      summary.exportedEnergyKwh === null
        ? null
        : formatGridEnergy(summary.exportedEnergyKwh, locale),
    ),
    item(
      "peak-import",
      summary.peakImportKw === null ? null : formatGridPower(summary.peakImportKw, locale),
      undefined,
      peakContext(summary.peakImportKw, GRID_CAPACITY_LIMITS.importKw, locale),
    ),
    item(
      "peak-export",
      summary.peakExportKw === null ? null : formatGridPower(summary.peakExportKw, locale),
      undefined,
      peakContext(summary.peakExportKw, GRID_CAPACITY_LIMITS.exportKw, locale),
    ),
  ];

  if (timeView === "year") {
    return [
      ...shared,
      item("import-violations", formatGridCount(summary.importViolationCount, locale)),
      item("export-violations", formatGridCount(summary.exportViolationCount, locale)),
      item(
        "days-near-capacity",
        formatGridCount(summary.daysAboveNinetyPercentCapacity, locale),
        summary.daysAboveNinetyPercentCapacity === 1 ? "1 day" : "Calendar days",
      ),
    ];
  }

  if (timeView === "month") {
    return [
      ...shared,
      item(
        "average-daily-peak",
        summary.averageDailyPeakImportKw === null
          ? null
          : formatGridPower(summary.averageDailyPeakImportKw, locale),
      ),
      item("import-violations", formatGridCount(summary.importViolationCount, locale)),
      item("export-violations", formatGridCount(summary.exportViolationCount, locale)),
      item(
        "worst-day",
        summary.worstDay === null ? null : formatGridDate(summary.worstDay.date, locale),
        summary.worstDay === null
          ? undefined
          : `${formatGridPower(summary.worstDay.peakImportKw, locale)} peak import`,
      ),
    ];
  }

  return [
    ...shared,
    item(
      "remaining-headroom",
      summary.remainingImportHeadroomKw === null
        ? null
        : formatGridPower(summary.remainingImportHeadroomKw, locale),
      summary.importLimitExceededByKw !== null && summary.importLimitExceededByKw > 0
        ? `Exceeded limit by ${formatGridPower(summary.importLimitExceededByKw, locale)}`
        : "Capacity available at peak",
    ),
    item(
      "time-near-capacity",
      summary.durationAboveNinetyPercentMinutes === null
        ? null
        : formatGridDuration(summary.durationAboveNinetyPercentMinutes, locale),
    ),
    item("import-violations", formatGridCount(summary.importViolationCount, locale)),
    item("export-violations", formatGridCount(summary.exportViolationCount, locale)),
  ];
}

const breakdownDefinitions: Record<
  GridBreakdownId,
  {
    label: string;
    tooltip: string;
    iconSrc: string;
  }
> = {
  battery: {
    label: "Battery",
    tooltip: "Energy imported from or exported through the battery during the selected period.",
    iconSrc: batteryIcon,
  },
  "own-use": {
    label: "Own use",
    tooltip: "Energy consumed directly on site.",
    iconSrc: gridIcon,
  },
  solar: {
    label: "Solar",
    tooltip: "Energy generated by the PV installation.",
    iconSrc: solarIcon,
  },
  charger: {
    label: "Charger",
    tooltip: "Energy supplied to connected EV chargers.",
    iconSrc: chargerIcon,
  },
};

export function createGridBreakdownPresentation(
  items: GridKpiPresentationInput["summary"]["importedBreakdown"],
  direction: "imported" | "exported",
  locale = "en",
): GridBreakdownPresentationItem[] {
  return items.map((breakdownItem) => {
    const definition = breakdownDefinitions[breakdownItem.id];
    const percentageText = formatGridPercentage(breakdownItem.percentage, locale);
    return {
      id: breakdownItem.id,
      ...definition,
      accessibleLabel: `More information about ${definition.label.toLowerCase()}`,
      value: formatGridEnergy(breakdownItem.energyKwh, locale),
      percentageText: `${percentageText} of ${direction} energy`,
    };
  });
}
