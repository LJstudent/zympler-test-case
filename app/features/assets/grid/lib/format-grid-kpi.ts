const KWH_PER_MWH = 1_000;
const KWH_PER_GWH = 1_000_000;

function number(value: number, locale: string, maximumFractionDigits: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

export function formatGridEnergy(kwh: number, locale = "en"): string {
  if (kwh >= KWH_PER_GWH) return `${number(kwh / KWH_PER_GWH, locale, 2)} GWh`;
  if (kwh >= KWH_PER_MWH) return `${number(kwh / KWH_PER_MWH, locale, 1)} MWh`;
  return `${number(kwh, locale, kwh < 10 ? 1 : 0)} kWh`;
}

export function formatGridPower(kw: number, locale = "en"): string {
  if (kw >= 1_000) return `${number(kw / 1_000, locale, 2)} MW`;
  return `${number(kw, locale, 1)} kW`;
}

export function formatGridPercentage(value: number, locale = "en"): string {
  return `${number(value, locale, 1)}%`;
}

export function formatGridCount(value: number, locale = "en"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatGridDuration(minutes: number, locale = "en"): string {
  const roundedMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(roundedMinutes / 60);
  const remainder = roundedMinutes % 60;
  if (hours === 0) return `${number(remainder, locale, 0)} min`;
  if (remainder === 0) return `${number(hours, locale, 0)} h`;
  return `${number(hours, locale, 0)} h ${number(remainder, locale, 0)} min`;
}

export function formatGridDate(date: Date, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
