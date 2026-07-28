import type { AssetChartDatum, AssetChartSeries } from "../../shared";

export type ChargerSeriesKey =
  | "totalCharged"
  | "solarToCharger"
  | "batterySolarToCharger"
  | "batteryGridToCharger"
  | "gridToCharger";

export type ChargerBreakdownSeriesKey = Exclude<ChargerSeriesKey, "totalCharged">;

export type ChargerInterval = {
  totalChargedKwh: number;
  solarToChargerKwh: number;
  batterySolarToChargerKwh: number;
  batteryGridToChargerKwh: number;
  gridToChargerKwh: number;
};

export type ChargerChartDatum = AssetChartDatum & {
  totalCharged: number;
  solarToCharger: number;
  batterySolarToCharger: number;
  batteryGridToCharger: number;
  gridToCharger: number;
};

export type ChargerChartSeries = AssetChartSeries<ChargerSeriesKey>;

export type ChargerBreakdownValidationIssue = {
  timestamp: Date;
  totalChargedKwh: number;
  breakdownTotalKwh: number;
  differenceKwh: number;
};
