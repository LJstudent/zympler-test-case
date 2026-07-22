const KWH_PER_MWH = 1_000;

export function formatEnergy(kilowattHours: number, locale = "en"): string {
  const safeKilowattHours =
    Number.isFinite(kilowattHours) && kilowattHours >= 0 ? kilowattHours : 0;
  const useMegawattHours = safeKilowattHours >= KWH_PER_MWH;
  const value = useMegawattHours ? safeKilowattHours / KWH_PER_MWH : safeKilowattHours;
  const maximumFractionDigits = useMegawattHours ? 1 : value < 10 ? 1 : 0;
  const formattedValue = new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);

  return `${formattedValue} ${useMegawattHours ? "MWh" : "kWh"}`;
}
