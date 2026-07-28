import { formatEnergy } from "~/features/energy-data";

export const CHARGER_KPI_UNAVAILABLE = "—";

export function formatChargerEnergy(value: number, locale = "en"): string {
  return formatEnergy(value, locale, {
    kwhMaximumFractionDigits: value < 10 ? 1 : 0,
    mwhMaximumFractionDigits: 1,
    gwhMaximumFractionDigits: 2,
  });
}

export function formatChargerPercentage(value: number | null, locale = "en"): string {
  return value === null
    ? CHARGER_KPI_UNAVAILABLE
    : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}
