import type { NumberFormat } from "./types";
import {
  batteryToGridColor,
  chargerToGridColor,
  curtailedSolarColor,
  DefaultNegativeColor,
  DefaultPositiveColor,
  fromBatteryColor,
  fromChargerColor,
  fromGridColor,
  fromSolarColor,
  gridLimitColor,
  solarToGridColor,
  sourceBatteryColor,
  sourceChargerColor,
  sourceGeneratorColor,
  sourceGridColor,
  sourceSolarColor,
  sourceUnknownColor,
  targetBatteryColor,
  targetChargerColor,
  targetGridColor,
  targetUnknownColor,
  targetUsedColor,
  toBatteryColor,
  toChargerColor,
  toGridColor,
  unknownToGridColor,
} from "./colors";
import type { CurveType } from "recharts/types/shape/Curve";

export const DECIMAL_FORMAT: NumberFormat = {
  format: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 2,
  },
};

export const POWER_FORMAT: NumberFormat = {
  format: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  },
  suffix: "W",
};

export const ENERGY_FORMAT: NumberFormat = {
  format: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  },
  suffix: "Wh",
};

export const WATT_PEAK_FORMAT: NumberFormat = {
  format: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  },
  suffix: "Wp",
};

export const PERCENTAGE_FORMAT: NumberFormat = {
  format: {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

export type TimeResolution = "day";

export type PowerType = "pmax" | "pavg" | "energy";

export enum GraphType {
  Bar,
  Line,
}

export type Serie = {
  graph_type: GraphType;
  data_key: string;
  curve_type?: CurveType;
  color?: string;
  format?: NumberFormat;
  icon?: React.ReactNode;
  is_forecast?: boolean;
  y_soft_zero?: boolean;
  show_in_legend?: boolean;
  is_limit?: boolean;
  strokeDasharray?: string | number | undefined;
  conversion_fn?: (input: number) => number | undefined;
};

export type Graph = {
  series: Serie[];
  forecast_series?: Serie[];
  stack_bars?: boolean;

  defaultColor?: () => string;
  defaultPositiveColor?: () => string;
  defaultNegativeColor?: () => string;
};

export const DefaultGraph = {
  defaultColor: () => {
    return DefaultPositiveColor;
  },
  defaultPositiveColor: () => {
    return DefaultPositiveColor;
  },
  defaultNegativeColor: () => {
    return DefaultNegativeColor;
  },
};

export function getSeriesKey(serie: Serie): string {
  return `${serie.graph_type}-${serie.data_key}`;
}

export const MergedMeasurementSourceGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    // SOLAR
    {
      graph_type: GraphType.Bar,
      data_key: `source_from_solar.${metric_name}`,
      color: sourceSolarColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `breakdown.solar_to_grid.${metric_name}`,
      color: solarToGridColor(),
      format: format,
      conversion_fn: (input: number) => input * -1.0,
    },

    // BATTERY
    {
      graph_type: GraphType.Bar,
      data_key: `source_from_battery.${metric_name}`,
      color: sourceBatteryColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `breakdown.battery_to_grid.${metric_name}`,
      color: batteryToGridColor(),
      format: format,
      conversion_fn: (input: number) => input * -1.0,
    },

    // CHARGER
    {
      graph_type: GraphType.Bar,
      data_key: `source_from_charger.${metric_name}`,
      color: sourceChargerColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `breakdown.charger_to_grid.${metric_name}`,
      color: chargerToGridColor(),
      format: format,
      conversion_fn: (input: number) => input * -1.0,
    },

    // GENERATOR
    {
      graph_type: GraphType.Bar,
      data_key: `source_from_generator.${metric_name}`,
      color: sourceGeneratorColor(),
      format: format,
    },

    // GRID
    {
      graph_type: GraphType.Bar,
      data_key: `source_from_grid.${metric_name}`,
      color: sourceGridColor(),
      format: format,
    },

    // UNKNOWN
    {
      graph_type: GraphType.Bar,
      data_key: `source_unknown.${metric_name}`,
      color: sourceUnknownColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `breakdown.unknown_to_grid.${metric_name}`,
      color: unknownToGridColor(),
      format: format,
      conversion_fn: (input: number) => input * -1.0,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};

export const MergedMeasurementTargetGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    // USAGE
    {
      graph_type: GraphType.Bar,
      data_key: `target_to_used.${metric_name}`,
      color: targetUsedColor(),
      format: format,
    },

    // BATTERY
    {
      graph_type: GraphType.Bar,
      data_key: `target_to_battery.${metric_name}`,
      color: targetBatteryColor(),
      format: format,
    },

    // CHARGER
    {
      graph_type: GraphType.Bar,
      data_key: `target_to_charger.${metric_name}`,
      color: targetChargerColor(),
      format: format,
    },

    // GRID
    {
      graph_type: GraphType.Bar,
      data_key: `target_to_grid.${metric_name}`,
      color: targetGridColor(),
      format: format,
      conversion_fn: (input: number) => input * -1.0,
    },

    // UNKNOWN
    {
      graph_type: GraphType.Bar,
      data_key: `target_unknown.${metric_name}`,
      color: targetUnknownColor(),
      format: format,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};

export const MergedGridMeterMeasurementGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    {
      graph_type: GraphType.Bar,
      data_key: `from_grid.${metric_name}`,
      format: format,
      color: fromGridColor(),
    },
    {
      graph_type: GraphType.Bar,
      data_key: `to_grid.${metric_name}`,
      format: format,
      color: toGridColor(),
      conversion_fn: (input: number) => input * -1.0,
    },
    {
      graph_type: GraphType.Line,
      curve_type: "stepAfter",
      data_key: `from_grid_limit.${metric_name}`,
      color: gridLimitColor(),
      format: format,
      is_limit: true,
    },
    {
      graph_type: GraphType.Line,
      curve_type: "stepAfter",
      data_key: `to_grid_limit.${metric_name}`,
      color: gridLimitColor(),
      format: format,
      is_limit: true,
      conversion_fn: (input: number) => input * -1.0,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};

export const MergedBatteryMeasurementGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    {
      graph_type: GraphType.Bar,
      data_key: `to_battery.${metric_name}`,
      format: format,
      color: toBatteryColor(),
    },
    {
      graph_type: GraphType.Bar,
      data_key: `from_battery.${metric_name}`,
      format: format,
      color: fromBatteryColor(),
      conversion_fn: (input: number) => input * -1.0,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};

export const MergedBatteryStateOfChargeMeasurementGraph = (): Graph => {
  const series: Serie[] = [
    {
      graph_type: GraphType.Line,
      curve_type: "stepBefore",
      data_key: `battery_state_of_charge_percentage`,
      format: PERCENTAGE_FORMAT,
      conversion_fn: (input: number) => input / 100,
    },
  ];

  return {
    series: series,
    forecast_series: series,
  };
};

export const MergedChargerMeasurementGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    {
      graph_type: GraphType.Bar,
      data_key: `to_charger.${metric_name}`,
      format: format,
      color: toChargerColor(),
    },
    {
      graph_type: GraphType.Bar,
      data_key: `from_charger.${metric_name}`,
      format: format,
      color: fromChargerColor(),
      conversion_fn: (input: number) => input * -1.0,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};

export const MergedSolarWithCurtailmentMeasurementGraph = (): Graph => {
  const metric_name = "power_max";
  const format = POWER_FORMAT;

  const series: Serie[] = [
    {
      graph_type: GraphType.Bar,
      data_key: `from_solar.${metric_name}`,
      color: fromSolarColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `measured_solar.${metric_name}`,
      color: fromSolarColor(),
      format: format,
    },
    {
      graph_type: GraphType.Bar,
      data_key: `curtailed_solar.${metric_name}`,
      color: curtailedSolarColor(),
      format: format,
    },
  ];

  const forecast_series = series;

  return {
    series: series,
    forecast_series: forecast_series,
  };
};
