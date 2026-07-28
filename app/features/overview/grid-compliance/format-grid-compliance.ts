const POWER_FORMATTER_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 1,
};

export function formatPowerValue(powerKw: number, locale = "en"): string {
  const safePowerKw = Number.isFinite(powerKw) && powerKw >= 0 ? powerKw : 0;
  return new Intl.NumberFormat(locale, POWER_FORMATTER_OPTIONS).format(safePowerKw);
}

export function formatPeakTimestamp(date: Date | null, locale = "en-GB"): string {
  if (date === null || !Number.isFinite(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(date);
}

export function formatViolationCount(direction: "import" | "export", count: number): string {
  if (count === 0) {
    return `No ${direction} violations`;
  }

  return `${count} ${direction} ${count === 1 ? "violation" : "violations"}`;
}
