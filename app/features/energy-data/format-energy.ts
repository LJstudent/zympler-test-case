const KWH_PER_MWH = 1_000;
const KWH_PER_GWH = 1_000_000;

type EnergyFormatOptions = {
  kwhMaximumFractionDigits?: number;
  mwhMaximumFractionDigits?: number;
  gwhMaximumFractionDigits?: number;
};

export function formatEnergy(
  kilowattHours: number,
  locale = "en",
  options: EnergyFormatOptions = {},
): string {
  const safeKilowattHours =
    Number.isFinite(kilowattHours) && kilowattHours >= 0 ? kilowattHours : 0;
  const unit =
    safeKilowattHours >= KWH_PER_GWH ? "GWh" : safeKilowattHours >= KWH_PER_MWH ? "MWh" : "kWh";
  const value =
    unit === "GWh"
      ? safeKilowattHours / KWH_PER_GWH
      : unit === "MWh"
        ? safeKilowattHours / KWH_PER_MWH
        : safeKilowattHours;
  const maximumFractionDigits =
    unit === "GWh"
      ? (options.gwhMaximumFractionDigits ?? 2)
      : unit === "MWh"
        ? (options.mwhMaximumFractionDigits ?? 1)
        : (options.kwhMaximumFractionDigits ?? (value < 10 ? 1 : 0));
  const formattedValue = new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);

  return `${formattedValue} ${unit}`;
}
