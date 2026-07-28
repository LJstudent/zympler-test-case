export type AssetTimeView = "year" | "month" | "day";
export type AssetAggregation = "raw" | "combined";
export type AssetMetric = "energy" | "power";

export type AssetPeriodOption = {
  key: string;
  label: string;
  start: Date;
};

export type AssetChartDatum = {
  timestamp: string;
  timestampMs: number;
  intervalEndMs: number;
  label: string;
  [key: string]: unknown;
};

export type AssetChartSeries<Key extends string = string> = {
  key: Key;
  label: string;
  color: string;
  stackId?: string;
  stackPosition?: "top" | "bottom";
};

export type AssetViewSelection = {
  timeView: AssetTimeView;
  aggregation: AssetAggregation;
  breakdown: boolean;
  periodKey: string;
};

export type AssetTooltipTotal = {
  key: string;
  label: string;
};

export type AssetReferenceLine = {
  value: number;
  label: string;
  labelPosition: "insideTopRight" | "insideBottomRight";
};
