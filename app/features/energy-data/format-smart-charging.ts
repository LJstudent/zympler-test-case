const NUMBER_LOCALE = "en";

export function formatPricePerKwh(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formattedPrice = new Intl.NumberFormat(NUMBER_LOCALE, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(safeValue);

  return `${formattedPrice} / kWh`;
}

export function formatPercentage(value: number, fractionDigits = 1): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return `${safeValue.toFixed(fractionDigits)}%`;
}
