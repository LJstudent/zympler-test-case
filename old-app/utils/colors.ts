export const AzureColor = "fill-azure-500 stroke-azure-500 text-azure-500 bg-azure/(--bg-opacity)";
export const MintColor = "fill-mint-700 stroke-mint-700 text-mint-700 bg-mint/(--bg-opacity)";
export const AxisLabelColor = "fill-slate-400 stroke-slate-400 text-slate-400";
export const ReferenceLineColor = "fill-slate-200 stroke-slate-200";
export const TodayColor = "fill-azure-500 stroke-azure-500 text-azure-500";
export const GridColor =
  "fill-grid stroke-grid text-grid bg-grid/(--bg-opacity) bg-grid-500/(--bg-opacity)";
export const GridNegativeColor =
  "fill-grid-700 stroke-grid-700 text-grid-700 bg-grid-700/(--bg-opacity) bg-grid-700/(--bg-opacity)";
export const SolarColor = "fill-solar stroke-solar text-solar bg-solar/(--bg-opacity)";
export const SolarNegativeColor =
  "fill-solar-700 stroke-solar-700 text-solar-700 bg-solar-700/(--bg-opacity)";
export const BatteryColor = "fill-battery stroke-battery text-battery bg-battery/(--bg-opacity)";
export const BatteryNegativeColor =
  "fill-battery-700 stroke-battery-700 text-battery-700 bg-battery-700/(--bg-opacity)";
export const ChargerColor = "fill-charger stroke-charger text-charger bg-charger/(--bg-opacity)";
export const ChargerNegativeColor =
  "fill-charger-700 stroke-charger-700 text-charger-700 bg-charger-700/(--bg-opacity)";
export const HeatingColor = "fill-heating stroke-heating text-heating bg-heating/(--bg-opacity)";
export const CoolingColor = "fill-cooling stroke-cooling text-cooling bg-cooling/(--bg-opacity)";
export const UsageColor = "fill-usage stroke-usage text-usage bg-usage/(--bg-opacity)";
export const GeneratorColor =
  "fill-generator stroke-generator text-generator bg-generator/(--bg-opacity)";
export const UnknownColor =
  "fill-slate-400 stroke-slate-400 text-slate-400 bg-slate-400/(--bg-opacity)";
export const GreenColor =
  "fill-green-600 stroke-green-600 text-green-600 bg-green-600/(--bg-opacity)";
export const RedColor = "fill-red-600 stroke-red-600 text-red-600 bg-red-600/(--bg-opacity)";
export const OrangeColor =
  "fill-orange-500 stroke-orange-500 text-orange-500 bg-orange-500/(--bg-opacity)";
export const FromWindColor = "fill-cyan-600 stroke-cyan-600 bg-cyan-600/(--bg-opacity)";
export const CurtailedSolarColor =
  "fill-slate-300 stroke-slate-300 text-slate-400 bg-slate-300/(--bg-opacity)";
export const StateOfChargeGreenColor = GreenColor;
export const StateOfChargeGreyColor = GridColor;

// grid

export const sourceGridColor = (): string => {
  return GridColor;
};

export const targetGridColor = (): string => {
  return GridColor;
};

export const fromGridColor = (): string => {
  return GridColor;
};

export const toGridColor = (): string => {
  return GridNegativeColor;
};

export const usedFromGridColor = (): string => {
  return GridColor;
};

export const gridToBatteryColor = (): string => {
  return GridColor;
};

export const gridToChargerColor = (): string => {
  return GridColor;
};

// generator

export const fromGeneratorColor = (): string => {
  return GeneratorColor;
};

export const sourceGeneratorColor = (): string => {
  return GeneratorColor;
};

// solar

export const sourceSolarColor = (): string => {
  return SolarColor;
};

export const fromSolarColor = (): string => {
  return SolarColor;
};

export const usedFromSolarColor = (): string => {
  return SolarColor;
};

export const solarToBatteryColor = (): string => {
  return SolarColor;
};

export const solarToChargerColor = (): string => {
  return fromSolarColor();
};

export const solarToGridColor = (): string => {
  return SolarNegativeColor;
};

// battery

export const sourceBatteryColor = (): string => {
  return BatteryColor;
};

export const targetBatteryColor = (): string => {
  return BatteryColor;
};

export const toBatteryColor = (): string => {
  return BatteryColor;
};

export const fromBatteryColor = (): string => {
  return BatteryNegativeColor;
};

export const usedFromBatteryColor = (): string => {
  return BatteryColor;
};

export const batteryToChargerColor = (): string => {
  return BatteryColor;
};

export const batteryToGridColor = (): string => {
  return BatteryNegativeColor;
};

// charger

export const sourceChargerColor = (): string => {
  return ChargerColor;
};

export const targetChargerColor = (): string => {
  return ChargerColor;
};

export const toChargerColor = (): string => {
  return ChargerColor;
};

export const fromChargerColor = (): string => {
  return ChargerNegativeColor;
};

export const usedFromChargerColor = (): string => {
  return ChargerColor;
};

export const chargerToBatteryColor = (): string => {
  return ChargerColor;
};

export const chargerToGridColor = (): string => {
  return ChargerColor;
};

// heat pump

export const toHeatPumpColor = (): string => {
  return HeatingColor;
};

// usage

export const targetUsedColor = (): string => {
  return UsageColor;
};

// unknown

export const sourceUnknownColor = (): string => {
  return UnknownColor;
};

export const targetUnknownColor = (): string => {
  return UnknownColor;
};

export const fromUnknownColor = (): string => {
  return UnknownColor;
};

export const toUnknownColor = (): string => {
  return UnknownColor;
};

export const unknownToChargerColor = (): string => {
  return fromUnknownColor();
};

export const unknownToBatteryColor = (): string => {
  return fromUnknownColor();
};

export const unknownToGridColor = (): string => {
  return fromUnknownColor();
};

export const solarToUnknownColor = (): string => {
  return fromSolarColor();
};

export const batteryToUnknownColor = (): string => {
  return fromBatteryColor();
};

export const chargerToUnknownColor = (): string => {
  return fromChargerColor();
};

// grid limits

export const gridLimitColor = (): string => {
  return RedColor;
};

export const curtailedSolarColor = (): string => {
  return CurtailedSolarColor;
};

export const DefaultPositiveColor = AzureColor;
export const DefaultNegativeColor = MintColor;
