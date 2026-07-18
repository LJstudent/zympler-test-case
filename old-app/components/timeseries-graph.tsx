import {
  Bar,
  Cell,
  ComposedChart,
  DefaultZIndexes,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
  ZIndexLayer,
} from "recharts";
import type { AxisDomain } from "recharts/types/util/types";
import { Duration, type DurationLikeObject } from "luxon";
import { DateTime } from "luxon";
import type { Serie, TimeResolution, Graph } from "~/utils/graphs";
import {
  DECIMAL_FORMAT,
  DefaultGraph,
  getSeriesKey,
  GraphType,
  PERCENTAGE_FORMAT,
  POWER_FORMAT,
} from "~/utils/graphs";
import { AxisLabelColor, TodayColor, ReferenceLineColor } from "~/utils/colors";
import { format_intl_number, getStartOfDate, measureTextSize } from "~/utils/functions";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { clsx } from "clsx";
import type { NumberFormat } from "~/utils/types";

type XTick = {
  x: number;
  label: string;
  showLabel: boolean;
};

function get_time_span(resolution: TimeResolution): DurationLikeObject {
  switch (resolution) {
    case "day":
      return { days: 1 };
  }
}

function get_tick_source(resolution: TimeResolution): number[] {
  switch (resolution) {
    case "day":
      return [0, 3, 6, 9, 12, 15, 18, 21, 24];
  }
}

function get_tick_source_hide_label(resolution: TimeResolution): number[] {
  switch (resolution) {
    case "day":
      return [0, 24];
  }
}

function get_from_object_per_tick_fn(
  resolution: TimeResolution,
): (local_date: DateTime, d: number) => DateTime {
  switch (resolution) {
    case "day":
      return (local_date: DateTime, d: number): DateTime => {
        // check nr of hours in day
        const hours_in_day = local_date.plus({ days: 1 }).diff(local_date).as("hours");
        return local_date.plus({ hours: d > 0 && hours_in_day > 24 ? d + 1 : d });
      };
  }
}

function get_floor_tick_fn(resolution: TimeResolution): (data_date: DateTime) => DateTime {
  switch (resolution) {
    case "day":
      // truncate to 3 hours
      return (data_date: DateTime): DateTime =>
        data_date.set({
          hour: Math.floor(data_date.hour / 3) * 3,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
  }
}

function get_tick_date_format_fn(resolution: TimeResolution): (tick_date: DateTime) => string {
  switch (resolution) {
    case "day":
      return (tick_date: DateTime): string => tick_date.toFormat("H");
  }
}

function get_x_ticks(
  resolution: TimeResolution,
  first_local_date: DateTime,
  last_local_date: DateTime,
): XTick[] {
  const tick_source: number[] = get_tick_source(resolution);
  const tick_source_hide_completely: number[] = get_tick_source_hide_label(resolution);
  const from_object_per_tick_fn: (local_date: DateTime, d: number) => DateTime =
    get_from_object_per_tick_fn(resolution);
  const floor_tick_fn: (data_date: DateTime) => DateTime = get_floor_tick_fn(resolution);
  const tick_date_format_fn: (tick_date: DateTime) => string = get_tick_date_format_fn(resolution);

  const first_local_date_millis = first_local_date.toMillis();
  const last_local_date_millis = last_local_date.toMillis();

  return tick_source
    .map((d) => {
      const tick_date = floor_tick_fn(from_object_per_tick_fn(first_local_date, d));
      const tick_data_tuple: [number, DateTime<boolean>] = [d, tick_date];

      return tick_data_tuple;
    })
    .filter((t: [number, DateTime<boolean>]) => {
      const [, tick_date] = t;

      const tick_millis = tick_date.toMillis();

      return tick_millis >= first_local_date_millis && tick_millis <= last_local_date_millis;
    })
    .map((t: [number, DateTime<boolean>]) => {
      const [d, tick_date] = t;

      const tick_millis = tick_date.toMillis();

      return {
        x: tick_millis,
        label: tick_date_format_fn(tick_date),
        showLabel: !tick_source_hide_completely.includes(d),
      };
    });
}

const Q = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function niceNumber(x: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.abs(x))));
  const f = Math.abs(x) / exp; // f ∈ [1, 10)

  let best = Q[0];
  for (const q of Q) {
    if (f <= q) {
      best = q;
      break;
    }
  }

  return best * exp;
}

const FORMATS_WITH_NICE_NUMBERS = [POWER_FORMAT];

const usesNiceNumbers = (format: NumberFormat | undefined): boolean => {
  return (format as NumberFormat)
    ? FORMATS_WITH_NICE_NUMBERS.includes(format as NumberFormat)
    : false;
};

function getBase1000(value: number) {
  if (value === 0) return 1;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const thousands = Math.floor(magnitude / 3);
  return 10 ** (thousands * 3);
}

function get_y_ticks(
  minValue: number,
  maxValue: number,
  y_format: NumberFormat | undefined,
  { maxTicks = 6, paddingPctTop = 0.05, paddingPctBottom = 0.05 } = {},
): number[] {
  if (minValue === maxValue) {
    return [minValue];
  }

  const range = maxValue - minValue;
  if (y_format !== PERCENTAGE_FORMAT) {
    maxValue += range * paddingPctTop;
  }
  if (minValue !== 0) {
    minValue -= range * paddingPctBottom;
  }

  const span = maxValue - minValue;
  const stepRaw = span / (maxTicks - 1);
  const step = niceNumber(stepRaw);
  const start = Math.floor(minValue / step) * step;
  const hi = Math.ceil(maxValue / step) * step;

  const y_ticks: number[] = [];

  for (let v = start; v <= hi + 0.5 * step; v += step) {
    y_ticks.push(v);
  }

  return y_ticks;
}

function get_y_domain(
  y_ticks: number[],
  y_soft_zero: boolean,
  y_minimum?: number,
  y_maximum?: number,
): AxisDomain {
  let y_max = Math.max(...y_ticks);
  let y_min = Math.min(...y_ticks);

  if (y_minimum && y_minimum < y_min) {
    y_min = y_minimum;
  }
  if (y_maximum && y_maximum > y_max) {
    y_max = y_maximum;
  }

  if (y_min == 0 && y_min == y_max) {
    return [0, 0];
  } else if (y_min >= 0) {
    // both y_min and y_max positive
    return [y_soft_zero ? 0 : y_min, y_max];
  } else if (y_max < 0) {
    // both y_min and y_max negative
    return [y_min, y_soft_zero ? 0 : y_max];
  } else {
    // y_min negative, y_max positive
    return [y_min, y_max];
  }
}

function get_wide_bars(
  first_local_date: DateTime,
  last_local_date: DateTime,
  bar_width: number,
  stack_bars: boolean,
): boolean {
  const total_millis_for_graph = last_local_date.diff(first_local_date).as("milliseconds");
  const total_bars = total_millis_for_graph / bar_width;
  return total_bars < 50 && stack_bars;
}

function get_first_local_date(
  resolution: TimeResolution,
  local_combined_data: any[],
  x_property_name: string,
  timezone: string,
): DateTime {
  const first_local_date = (
    local_combined_data.length > 0 && _.get(local_combined_data[0], x_property_name)
      ? DateTime.fromISO(_.get(local_combined_data[0], x_property_name))
      : DateTime.utc()
  ).setZone(timezone);

  switch (resolution) {
    default:
      return getStartOfDate(resolution, first_local_date);
  }
}

function get_last_local_date(
  resolution: TimeResolution,
  local_combined_data: any[],
  x_property_name: string,
  timezone: string,
): DateTime {
  const first_local_date = (
    local_combined_data &&
    local_combined_data.length > 0 &&
    _.get(local_combined_data[0], x_property_name)
      ? DateTime.fromISO(_.get(local_combined_data[0], x_property_name))
      : DateTime.utc()
  ).setZone(timezone);
  const timespan = get_time_span(resolution);

  switch (resolution) {
    default:
      return getStartOfDate(
        resolution,
        getStartOfDate(resolution, first_local_date).plus(timespan),
      );
  }
}

function get_today(now: DateTime, resolution: TimeResolution): DateTime {
  switch (resolution) {
    default:
      return getStartOfDate(resolution, now);
  }
}

function get_default_interval_duration(resolution: TimeResolution): DurationLikeObject {
  switch (resolution) {
    default:
      return { minutes: 15 };
  }
}

function get_default_bar_size(resolution: TimeResolution): number {
  switch (resolution) {
    default:
      return 7;
  }
}

function get_bar_size(resolution: TimeResolution, local_data: any[]): number | undefined {
  const default_bar_size = get_default_bar_size(resolution);

  return local_data.length > 1 ? undefined : default_bar_size;
}

function get_interval_duration(
  resolution: TimeResolution,
  local_data: any[],
  x_property_name: string,
): Duration {
  const expected = Duration.fromObject(get_default_interval_duration(resolution));

  if (local_data.length > 1) {
    const actual = DateTime.fromISO(_.get(local_data[1], x_property_name)).diff(
      DateTime.fromISO(_.get(local_data[0], x_property_name)),
    );

    const actualMs = actual.toMillis();
    const expectedMs = expected.toMillis();

    // only use actual if it's reasonable (within 4x of expected)
    if (actualMs > 0 && actualMs >= expectedMs * 0.25 && actualMs <= expectedMs * 4) {
      return actual;
    }
  }

  return expected;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface LabelPosition {
  // center of the label
  x: number;
  y: number;
  width: number;
  height: number;

  text: string;

  relativePosition: "above" | "below";
  isForecast?: boolean;

  arrowEndX: number;
  arrowEndY: number;
}

const LABEL_FONT_SIZE = 14;
const LABEL_PADDING_X = 6;
const LABEL_PADDING_Y = 6;
const LABEL_MINIMAL_Y_DISTANCE = 20;
const ARROW_MARGIN = 2;
const CANVAS_TOP_MARGIN = 20;
const CANVAS_LEFT_MARGIN = 20;
const CANVAS_BOTTOM_MARGIN = 30;
const CANVAS_RIGHT_MARGIN = 20;

const newLabel = (
  x: number,
  y: number,
  value: number,
  format: NumberFormat | undefined,
  isForecast: boolean = false,
): LabelPosition => {
  // get label size
  const text = format_intl_number(value, format);
  const { width: textWidth, height: textHeight } = measureTextSize(text, LABEL_FONT_SIZE);
  const width = textWidth + LABEL_PADDING_X * 2;
  const height = textHeight + LABEL_PADDING_Y * 2;

  return {
    x,
    y,
    width,
    height,

    text,

    relativePosition: value > 0 ? "above" : "below",
    isForecast,

    arrowEndX: x,
    arrowEndY: y,
  };
};
const getLabelLeftX = (position: LabelPosition): number => position.x - position.width / 2;
const getLabelRightX = (position: LabelPosition): number => position.x + position.width / 2;
const getLabelTopY = (position: LabelPosition): number => position.y - position.height / 2;
const getLabelBottomY = (position: LabelPosition): number => position.y + position.height / 2;
const getLabelWidth = (position: LabelPosition): number => position.width;
const getLabelHeight = (position: LabelPosition): number => position.height;
const getLabelText = (position: LabelPosition): string => position.text;
const shiftLabel = (position: LabelPosition, dx: number, dy: number): LabelPosition => {
  return {
    ...position,
    x: position.x + dx,
    y: position.y + dy,
  };
};
const repositionLabel = (position: LabelPosition, canvasSize: CanvasSize): LabelPosition => {
  const aboveGraph = getAboveGraph(position);

  const labelHeight = getLabelHeight(position);
  const labelLeftX = getLabelLeftX(position);
  const labelRightX = getLabelRightX(position);

  // determine amount of needed offset to avoid collissions
  const leftSide = CANVAS_LEFT_MARGIN;
  const rightSide = (canvasSize.width > 0 ? canvasSize.width : 5000) - CANVAS_RIGHT_MARGIN;

  const dx =
    labelLeftX < leftSide
      ? leftSide - labelLeftX
      : labelRightX > rightSide
        ? rightSide - labelRightX
        : 0;

  const yOffset = aboveGraph
    ? (position.arrowEndY - (LABEL_MINIMAL_Y_DISTANCE + labelHeight) - CANVAS_TOP_MARGIN) / 1.5
    : canvasSize.height > 0
      ? (canvasSize.height -
          position.arrowEndY -
          (LABEL_MINIMAL_Y_DISTANCE + labelHeight) -
          CANVAS_BOTTOM_MARGIN) /
        1.5
      : 0;
  const dy = aboveGraph
    ? -LABEL_MINIMAL_Y_DISTANCE - labelHeight / 2 - yOffset
    : +LABEL_MINIMAL_Y_DISTANCE + labelHeight / 2 + yOffset;

  return shiftLabel(position, dx, dy);
};
const getAboveGraph = (position: LabelPosition): boolean => position.relativePosition === "above";
const getArrowDx = (position: LabelPosition): number => position.x - position.arrowEndX;
const getArrowWidth = (): number => 6;
const getArrowHeight = (position: LabelPosition): number =>
  getAboveGraph(position)
    ? position.arrowEndY - getLabelBottomY(position) - ARROW_MARGIN
    : getLabelTopY(position) - position.arrowEndY - ARROW_MARGIN;

const MinMaxLabel = React.memo(({ label }: { label: LabelPosition }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  const labelTopY = getLabelTopY(label);
  const labelLeftX = getLabelLeftX(label);
  const labelWidth = getLabelWidth(label);
  const labelHeight = getLabelHeight(label);
  const labelText = getLabelText(label);

  const aboveGraph = getAboveGraph(label);
  const arrowHeight = getArrowHeight(label);
  const arrowWidth = getArrowWidth();
  const arrowDx = getArrowDx(label);

  return (
    <g
      transform={`translate(${labelLeftX}, ${labelTopY})`}
      className={clsx([
        "transition-opacity duration-100 ease-in-out",
        visible ? "opacity-100" : "opacity-0",
      ])}
    >
      <polygon
        points={
          aboveGraph
            ? // pointing down (below rect)
              `${labelWidth / 2 - arrowWidth / 2},${labelHeight}
                 ${labelWidth / 2 + arrowWidth / 2},${labelHeight}
                 ${labelWidth / 2 - arrowDx},${labelHeight + arrowHeight}`
            : // pointing up (above rect)
              `${labelWidth / 2 - arrowWidth / 2},0
                 ${labelWidth / 2 + arrowWidth / 2},0
                 ${labelWidth / 2 - arrowDx},${-arrowHeight}`
        }
        className={label.isForecast ? "fill-slate-100" : "fill-slate-200"}
        strokeWidth={0}
      />
      <rect
        width={labelWidth}
        height={labelHeight}
        rx={4}
        className={label.isForecast ? "fill-slate-100" : "fill-slate-200"}
        strokeWidth={0}
      />
      <text
        x={labelWidth / 2}
        y={labelHeight / 2 + LABEL_FONT_SIZE / 3}
        textAnchor={"middle"}
        fontSize={LABEL_FONT_SIZE}
        fontFamily="Poppins"
        pointerEvents="none"
        strokeWidth={0}
        className={label.isForecast ? "fill-slate-600" : "fill-slate-800"}
      >
        {labelText}
      </text>
    </g>
  );
});
MinMaxLabel.displayName = "MinMaxLabel";

function get_y_max_fn(
  stackable_series: Serie[],
  non_stackable_series: Serie[],
  data: any[],
  showLimits: boolean,
): [max: number, index: number] {
  stackable_series = stackable_series.filter((s) => !s.is_limit || showLimits);
  non_stackable_series = non_stackable_series.filter((s) => !s.is_limit || showLimits);

  if (data.length == 0 || (stackable_series.length == 0 && non_stackable_series.length == 0)) {
    return [0, -1];
  }

  const stackable_data = data
    .map((d) => {
      // sum all the data key values for this data point
      const filtered_stackable_values: number[] = stackable_series
        .map((s) => _.get(d, s.data_key))
        .filter((v) => typeof v === "number");

      if (filtered_stackable_values.length === 0) {
        return Number.NEGATIVE_INFINITY;
      } else if (
        filtered_stackable_values.every((v) => v > 0) ||
        filtered_stackable_values.every((v) => v < 0)
      ) {
        return filtered_stackable_values.reduce((sum, v) => sum + v, 0);
      } else {
        // since we're stacking by sign we only want to sum the positive values
        return filtered_stackable_values.reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
      }
    })
    .filter((v) => typeof v == "number");
  const stackable_data_finite = stackable_data.filter((v) => Number.isFinite(v));
  const stackable_max_y = Math.max(...stackable_data_finite);
  const stackable_max_index = stackable_data.indexOf(stackable_max_y);

  const non_stackable_data = data
    .map((d) => {
      return Math.max(
        ...non_stackable_series
          .map((s) => _.get(d, s.data_key))
          .filter((v) => typeof v == "number"),
      );
    })
    .filter((v) => typeof v == "number");
  const non_stackable_data_finite = non_stackable_data.filter((v) => Number.isFinite(v));
  const non_stackable_max_y = Math.max(...non_stackable_data_finite);
  const non_stackable_max_index = non_stackable_data.indexOf(non_stackable_max_y);

  if (stackable_data_finite.length == 0 || stackable_max_index === -1) {
    return [non_stackable_max_y, non_stackable_max_index];
  } else if (non_stackable_data_finite.length == 0 || non_stackable_max_index === -1) {
    return [stackable_max_y, stackable_max_index];
  } else if (non_stackable_max_y > stackable_max_y) {
    return [non_stackable_max_y, non_stackable_max_index];
  } else {
    return [stackable_max_y, stackable_max_index];
  }
}

function get_y_min_fn(
  stackable_series: Serie[],
  non_stackable_series: Serie[],
  data: any[],
  showLimits: boolean,
): [max: number, index: number] {
  stackable_series = stackable_series.filter((s) => !s.is_limit || showLimits);
  non_stackable_series = non_stackable_series.filter((s) => !s.is_limit || showLimits);

  if (data.length == 0 || (stackable_series.length == 0 && non_stackable_series.length == 0)) {
    return [0, -1];
  }

  const stackable_data = data
    .map((d) => {
      // sum all the data key values for this data point
      const filtered_stackable_values: number[] = stackable_series
        .map((s) => _.get(d, s.data_key))
        .filter((v) => typeof v === "number");

      if (filtered_stackable_values.length === 0) {
        return Number.POSITIVE_INFINITY;
      } else if (
        filtered_stackable_values.every((v) => v > 0) ||
        filtered_stackable_values.every((v) => v < 0)
      ) {
        return filtered_stackable_values.reduce((sum, v) => sum + v, 0);
      } else {
        // since we're stacking by sign we only want to sum the positive values
        return filtered_stackable_values.reduce((sum, v) => sum + (v < 0 ? v : 0), 0);
      }
    })
    .filter((v) => typeof v == "number");
  const stackable_data_finite = stackable_data.filter((v) => Number.isFinite(v));
  const stackable_min_y = Math.min(...stackable_data_finite);
  const stackable_min_index = stackable_data.indexOf(stackable_min_y);

  const non_stackable_data = data
    .map((d) => {
      return Math.min(
        ...non_stackable_series
          .map((s) => _.get(d, s.data_key))
          .filter((v) => typeof v == "number"),
      );
    })
    .filter((v) => typeof v == "number" && Number.isFinite(v));
  const non_stackable_data_finite = non_stackable_data.filter((v) => Number.isFinite(v));
  const non_stackable_min_y = Math.min(...non_stackable_data_finite);
  const non_stackable_min_index = non_stackable_data.indexOf(non_stackable_min_y);

  if (stackable_data_finite.length == 0 || stackable_min_index === -1) {
    return [non_stackable_min_y, non_stackable_min_index];
  } else if (non_stackable_data_finite.length == 0 || non_stackable_min_index === -1) {
    return [stackable_min_y, stackable_min_index];
  } else if (non_stackable_min_y < stackable_min_y) {
    return [non_stackable_min_y, non_stackable_min_index];
  } else {
    return [stackable_min_y, stackable_min_index];
  }
}

type InternalProps = {
  local_data: any[];
  local_series: Serie[];
  local_forecast_series: Serie[];
  bar_off_set: number;
  bar_size: number | undefined;
  defaultColor: string;
  defaultNegativeColor: string;
  defaultPositiveColor: string;
  first_local_date: DateTime;
  has_data: boolean;
  has_forecast_data: boolean;
  has_graph_type_bar: boolean;
  has_limit_series: boolean;
  is_today: boolean;
  isAnimationActive: boolean;
  last_local_date: DateTime;
  now_label: string;
  now: DateTime;
  stack_bars: boolean;
  has_stacked_bars: boolean;
  wide_bars: boolean;
  x_ticks: XTick[];
  y_domain: AxisDomain;
  y_format: NumberFormat | undefined;
  y_max_wo_limits: number;
  y_max_index_wo_limits: number;
  y_min_wo_limits: number;
  y_min_index_wo_limits: number;
  maxValue: number;
  minValue: number;
  y_ticks: number[];
  y_label: string;
  y_base: number;
};

const DEFAULT_INTERNAL_PROPS: InternalProps = {
  local_data: [],
  local_series: [],
  local_forecast_series: [],
  bar_off_set: 0,
  bar_size: undefined,
  defaultColor: DefaultGraph.defaultColor(),
  defaultNegativeColor: DefaultGraph.defaultNegativeColor(),
  defaultPositiveColor: DefaultGraph.defaultPositiveColor(),

  first_local_date: DateTime.fromMillis(0),
  has_data: false,
  has_forecast_data: false,
  has_graph_type_bar: false,
  has_limit_series: false,
  is_today: false,
  isAnimationActive: false,
  last_local_date: DateTime.fromMillis(0),
  now_label: "",
  now: DateTime.fromMillis(0),
  stack_bars: false,
  has_stacked_bars: false,
  wide_bars: false,
  x_ticks: [],
  y_domain: [],
  y_format: undefined,
  y_max_wo_limits: 0,
  y_max_index_wo_limits: -1,
  y_min_wo_limits: 0,
  y_min_index_wo_limits: -1,
  maxValue: 0,
  minValue: 0,
  y_ticks: [],
  y_label: "",
  y_base: 1,
};

const matchDataKey = (a: string, b: string): boolean => {
  return (
    a.replace(/power_max$|power$|energy$/g, "") === b.replace(/power_max$|power$|energy$/g, "")
  );
};

const MinMaxLabelLayer = ({
  data,
  y,
  xIndex,
  xPropertyName,
  xOffset,
  format,
  canvasSize,
}: {
  data: any[];
  y: number;
  xIndex: number;
  xPropertyName: string;
  xOffset: number;
  format: NumberFormat | undefined;
  canvasSize: React.RefObject<CanvasSize>;
}) => {
  const xScale = useXAxisScale("line");
  const yScale = useYAxisScale();

  if (!xScale || !yScale || xIndex < 0 || y === 0 || y === Infinity || y === -Infinity) return null;

  const dataPoint = data[xIndex];
  if (!dataPoint) return null;

  const ts = DateTime.fromISO(_.get(dataPoint, xPropertyName)).toMillis();
  const scaledX = xScale(ts + xOffset);
  const scaledY = yScale(y);

  if (typeof scaledX !== "number" || typeof scaledY !== "number") return null;

  const label = repositionLabel(newLabel(scaledX, scaledY, y, format, false), canvasSize.current);

  return <MinMaxLabel label={label} />;
};

export type TimeseriesGraphProps = {
  graph: Graph;
  data: any[] | undefined;
  forecast_data?: any[] | undefined;
  background_data?: any[] | undefined;
  x_property_name: string;
  forecast_x_property_name?: string;
  background_x_property_name?: string;
  y_maximum?: number;
  y_minimum?: number;
  timezone?: string;
  resolution?: TimeResolution;
  darkMode?: boolean;
  forecasted_label?: string;
  subtitle?: string;
  has_background?: boolean;
  has_padding?: boolean;
  show_no_data?: boolean;
  tip?: React.ReactNode;
  className?: string;
};

export const MemoizedTimeseriesGraph = React.memo(TimeseriesGraph, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.forecast_data === next.forecast_data &&
    prev.background_data === next.background_data &&
    prev.graph === next.graph
  );
});

export default function TimeseriesGraph({
  graph,
  data,
  forecast_data,
  background_data,
  x_property_name,
  forecast_x_property_name = x_property_name,
  background_x_property_name = x_property_name,
  y_maximum,
  y_minimum,
  timezone = "Europe/Amsterdam",
  resolution = "day",
}: TimeseriesGraphProps) {
  const [
    {
      local_data,
      local_series,
      local_forecast_series,
      bar_off_set,
      bar_size,
      defaultColor,
      defaultNegativeColor,
      defaultPositiveColor,
      first_local_date,
      has_data,
      has_forecast_data,
      has_graph_type_bar,
      is_today,
      isAnimationActive,
      last_local_date,
      now_label,
      now,
      stack_bars,
      has_stacked_bars,
      wide_bars,
      x_ticks,
      y_domain,
      y_format,
      y_max_wo_limits,
      y_max_index_wo_limits,
      y_min_wo_limits,
      y_min_index_wo_limits,
      maxValue,
      minValue,
      y_ticks,
      y_label,
      y_base,
    },
    setInternalProps,
  ] = useState<InternalProps>(DEFAULT_INTERNAL_PROPS);

  const [activeSerie, setActiveSerie] = useState<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasSize = useRef<CanvasSize>({ width: 0, height: 0 });
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new ResizeObserver(
      _.debounce(([entry]) => {
        const { width, height } = entry.contentRect;
        if (canvasSize.current.width !== width || canvasSize.current.height !== height) {
          canvasSize.current = { width, height };
          if (!canvasReady && width > 0 && height > 0) {
            setCanvasReady(true);
          }
        }
      }, 50),
    );

    observer.observe(canvasRef.current);

    return () => observer.disconnect();
  }, [has_data, has_forecast_data]);

  useEffect(() => {
    // merge data, forecast_data and background_data
    const local_data: any[] = [];
    const local_forecast_data: any[] = [];

    const local_series_map: Map<string, Serie> = new Map<string, Serie>();
    const local_forecast_series_map: Map<string, Serie> = new Map<string, Serie>();

    let i = 0,
      j = 0;
    const k = 0;
    while (
      (!!data && i < data.length) ||
      (!!forecast_data && j < forecast_data.length) ||
      (!!background_data && k < background_data.length)
    ) {
      const d = data ? data[i] : undefined;
      const f = forecast_data ? forecast_data[j] : undefined;
      const b = background_data ? background_data[k] : undefined;

      const dataTs = d ? _.get(d, x_property_name) : null;
      const forecastDataTs = f ? _.get(f, forecast_x_property_name) : null;
      const backgroundDataTs = b ? _.get(b, background_x_property_name) : null;

      // Find the minimum ISO timestamp string (skip nulls)
      const minTs = [dataTs, forecastDataTs, backgroundDataTs]
        .filter((ts) => ts !== null && ts !== undefined)
        .sort()[0];

      // Find the minimum ISO retrieved_at string (skip nulls)
      const minRetrievedAt = [d?.retrieved_at, f?.retrieved_at, b?.retrieved_at]
        .filter((ts) => ts !== null && ts !== undefined)
        .sort()[0];

      // Build merged entry
      const entry = { retrieved_at: minRetrievedAt };
      _.set(entry, x_property_name, minTs);
      let hasMergedValues = false;

      // copy data if present for timestamp
      if (dataTs === minTs) {
        // reference or convert each value for which we have a serie
        graph.series.forEach((s) => {
          const value = _.get(d, s.data_key);
          if (typeof value == "number") {
            const converted_value = s.conversion_fn ? s.conversion_fn(value) : value;
            if (typeof converted_value == "number") {
              _.set(entry, s.data_key, converted_value);
              hasMergedValues = true;

              const serie_key = getSeriesKey(s);
              if (!local_series_map.has(serie_key)) {
                local_series_map.set(serie_key, s);
              }
            }
          }
        });

        i++;
      }

      // copy forecast data if present for timestamp
      if (forecastDataTs === minTs) {
        if (!dataTs) {
          const forecastEntry = { retrieved_at: minRetrievedAt };
          _.set(forecastEntry, forecast_x_property_name, minTs);
          let hasValues = false;

          // reference or convert each value for which we have a serie
          graph.forecast_series?.forEach((s) => {
            const value = _.get(f, s.data_key);
            if (typeof value == "number") {
              const converted_value = s.conversion_fn ? s.conversion_fn(value) : value;
              if (typeof converted_value == "number") {
                _.set(entry, `fc.${s.data_key}`, converted_value);
                hasMergedValues = true;
                _.set(forecastEntry, s.data_key, converted_value);
                hasValues = true;

                const serie_key = getSeriesKey(s);
                if (!local_forecast_series_map.has(serie_key)) {
                  local_forecast_series_map.set(serie_key, s);
                }
              }
            }
          });

          if (hasValues) {
            local_forecast_data.push(forecastEntry);
          }
        }

        j++;
      }

      if (hasMergedValues) {
        local_data.push(entry);
      }
    }

    const local_series: Serie[] = Array.from(local_series_map.values());
    const local_forecast_series: Serie[] = Array.from(local_forecast_series_map.values());

    // fill in defaults for missing graph properties
    graph = { ...DefaultGraph, ...graph };
    const defaultColor = graph.defaultColor ? graph.defaultColor() : DefaultGraph.defaultColor();
    const defaultPositiveColor = graph.defaultPositiveColor
      ? graph.defaultPositiveColor()
      : DefaultGraph.defaultPositiveColor();
    const defaultNegativeColor = graph.defaultNegativeColor
      ? graph.defaultNegativeColor()
      : DefaultGraph.defaultNegativeColor();

    const stack_bars = graph.stack_bars ?? true;

    const has_data: boolean = local_data.length > 0;
    const has_forecast_data: boolean = local_forecast_data.length > 0;

    const show_forecasts = has_forecast_data;

    const combined_series =
      graph.forecast_series && show_forecasts
        ? graph.series.concat(...graph.forecast_series)
        : graph.series;

    const y_soft_zero = combined_series.find((s) => s.y_soft_zero)?.y_soft_zero ?? false;
    const y_format: NumberFormat | undefined = combined_series.find((s) => s.format)?.format;

    const has_graph_type_bar: boolean = combined_series.some((s) => s.graph_type == GraphType.Bar);

    const stackable_series = graph.series.filter(
      (s) => s.graph_type == GraphType.Bar && stack_bars,
    );
    const stackable_forecast_series = graph.forecast_series
      ? graph.forecast_series.filter((s) => s.graph_type == GraphType.Bar && stack_bars)
      : [];

    const non_stackable_series = graph.series.filter(
      (s) => !(s.graph_type == GraphType.Bar && stack_bars),
    );
    const non_stackable_forecast_series = graph.forecast_series
      ? graph.forecast_series.filter((s) => !(s.graph_type == GraphType.Bar && stack_bars))
      : [];

    const has_stacked_bars = stackable_series.length > 1 || stackable_forecast_series.length > 1;

    const has_limit_series =
      stackable_series.some((s) => s.is_limit) ||
      stackable_forecast_series.some((s) => s.is_limit) ||
      non_stackable_series.some((s) => s.is_limit) ||
      non_stackable_forecast_series.some((s) => s.is_limit);

    const now = DateTime.fromISO("2026-03-23T11:26:24Z");
    const now_date_format = "H:mm";
    const now_label = now.setZone(timezone).toFormat(now_date_format);

    const first_local_date = get_first_local_date(
      resolution,
      local_data,
      x_property_name,
      timezone,
    );
    const last_local_date = get_last_local_date(resolution, local_data, x_property_name, timezone);

    const today = get_today(now, resolution);
    const is_today =
      first_local_date.toISODate() == today.toISODate() && ["day", "week"].includes(resolution);

    const interval_duration = get_interval_duration(resolution, local_data, x_property_name);
    const bar_size = get_bar_size(resolution, local_data);
    const bar_width = interval_duration.as("milliseconds");
    const bar_off_set = bar_width / 2;

    const x_ticks: XTick[] = get_x_ticks(resolution, first_local_date, last_local_date);

    // min/max optionally including limits to use for the domain
    const [y_max]: [number, number] = get_y_max_fn(
      stackable_series,
      non_stackable_series,
      local_data,
      true,
    );
    const [y_max_forecasts]: [number, number] = get_y_max_fn(
      stackable_forecast_series,
      non_stackable_forecast_series,
      local_forecast_data,
      true,
    );
    const [y_min]: [number, number] = get_y_min_fn(
      stackable_series,
      non_stackable_series,
      local_data,
      true,
    );
    const [y_min_forecasts]: [number, number] = get_y_min_fn(
      stackable_forecast_series,
      non_stackable_forecast_series,
      local_forecast_data,
      true,
    );

    // min/max excluding limits to use for min/max tooltips
    const [y_max_wo_limits, y_max_index_wo_limits]: [number, number] = get_y_max_fn(
      stackable_series,
      non_stackable_series,
      local_data,
      false,
    );
    const [y_min_wo_limits, y_min_index_wo_limits]: [number, number] = get_y_min_fn(
      stackable_series,
      non_stackable_series,
      local_data,
      false,
    );

    const maxValue =
      has_data && has_forecast_data
        ? Math.max(y_max, y_max_forecasts, y_soft_zero ? 0 : y_max)
        : has_data
          ? Math.max(y_max, y_soft_zero ? 0 : y_max)
          : Math.max(y_max_forecasts, y_soft_zero ? 0 : y_max_forecasts);

    const minValue =
      has_data && has_forecast_data
        ? Math.min(y_min, y_min_forecasts, y_soft_zero ? 0 : y_min)
        : has_data
          ? Math.min(y_min, y_soft_zero ? 0 : y_min)
          : Math.min(y_min_forecasts, y_soft_zero ? 0 : y_min_forecasts);

    const y_ticks: number[] = get_y_ticks(minValue, maxValue, y_format);
    const y_domain: AxisDomain = get_y_domain(y_ticks, y_soft_zero, y_minimum, y_maximum);
    // const simple_y_ticks = y_ticks.length > 0 && y_ticks[0] <= 0 && y_ticks[y_ticks.length - 1] >= 0 || y_soft_zero ? [0] : [];

    const y_abs_max = Math.max(Math.abs(maxValue), Math.abs(minValue));
    const y_label: string = format_intl_number(y_abs_max, y_format).replace(/^[\d.,\s]+/, "");
    const y_base = getBase1000(y_abs_max);

    const wide_bars = get_wide_bars(first_local_date, last_local_date, bar_width, stack_bars);
    const isAnimationActive = true;

    setInternalProps({
      local_data,
      local_series,
      local_forecast_series,
      bar_off_set,
      bar_size,
      defaultColor,
      defaultNegativeColor,
      defaultPositiveColor,
      first_local_date,
      has_data,
      has_forecast_data,
      has_graph_type_bar,
      has_limit_series,
      is_today,
      isAnimationActive,
      last_local_date,
      now_label,
      now,
      stack_bars,
      has_stacked_bars,
      wide_bars,
      x_ticks,
      y_domain,
      y_format,
      y_max_wo_limits,
      y_max_index_wo_limits,
      y_min_wo_limits,
      y_min_index_wo_limits,
      maxValue,
      minValue,
      y_ticks,
      y_label,
      y_base,
    });
  }, [data, forecast_data, background_data, graph, canvasReady]);

  return has_data || has_forecast_data ? (
    <div
      className={clsx([
        "@container",
        "font-medium flex-1 w-full max-w-full min-w-0 flex flex-col items-center-safe justify-between",
      ])}
      onClick={() => setActiveSerie("")}
    >
      <div className="flex-1 w-full flex justify-center-safe items-center">
        <div
          className={clsx([
            "w-full z-25 pointer-coarse:pointer-events-none",
            "aspect-3/1 @5xl:aspect-4/1",
            "max-w-[1136px]",
          ])}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            debounce={100}
            className="mx-auto group/graph"
            ref={canvasRef}
          >
            <ComposedChart
              data={local_data}
              margin={{
                top: CANVAS_TOP_MARGIN,
                right: 0,
                left: 0,
                bottom: 0,
              }}
              barGap={"10%"}
              barCategoryGap={wide_bars ? "8%" : "4%"}
              stackOffset="sign"
            >
              <YAxis
                className={AxisLabelColor}
                axisLine={false}
                style={{ fontFamily: "Poppins", fill: "inherit" }}
                tickLine={false}
                domain={y_domain}
                allowDataOverflow={true}
                width="auto"
                tickFormatter={(value) => {
                  return usesNiceNumbers(y_format)
                    ? format_intl_number(value / y_base, DECIMAL_FORMAT)
                    : format_intl_number(value as number, y_format);
                }}
                label={{
                  value: usesNiceNumbers(y_format) ? y_label : "",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
                ticks={y_ticks}
                interval={"preserveStartEnd"}
                padding={{
                  top: maxValue > 0 ? 30 : 1,
                  bottom: minValue < 0 ? 30 : 1,
                }}
              />

              <XAxis
                xAxisId="line"
                type="number"
                scale="time"
                hide={true}
                dataKey={(x) => DateTime.fromISO(_.get(x, x_property_name)).toMillis()}
                domain={[first_local_date.toMillis(), last_local_date.toMillis()]}
                allowDataOverflow={true}
                padding={{ left: 5, right: 5 }}
              />
              <XAxis
                xAxisId="bar"
                type="number"
                scale="time"
                dataKey={(x) =>
                  DateTime.fromISO(_.get(x, x_property_name)).toMillis() + bar_off_set
                }
                domain={[first_local_date.toMillis(), last_local_date.toMillis()]}
                allowDataOverflow={true}
                className={AxisLabelColor}
                axisLine={false}
                style={{ fontFamily: "Poppins", fill: "inherit" }}
                tickLine={false}
                ticks={x_ticks.filter((t) => t.showLabel).map((t) => t.x)}
                tickFormatter={(value) =>
                  get_tick_date_format_fn(resolution)(DateTime.fromMillis(value))
                }
                tickMargin={has_stacked_bars ? 5 : 5}
                padding={{ left: 5, right: 5 }}
              />

              {y_ticks.map((y_tick) => (
                <ReferenceLine
                  key={y_tick}
                  y={y_tick}
                  className={
                    maxValue > 0 && minValue < 0 && y_tick === 0
                      ? "stroke-slate-200"
                      : "stroke-transparent group-hover/graph:stroke-slate-200"
                  }
                  stroke=""
                  strokeWidth={2}
                  xAxisId="line"
                  zIndex={DefaultZIndexes.scatter - 2}
                />
              ))}
              {x_ticks.map((x_tick) => (
                <ReferenceLine
                  key={x_tick.x}
                  x={x_tick.x}
                  className={ReferenceLineColor}
                  stroke=""
                  strokeWidth={2}
                  xAxisId="line"
                  zIndex={DefaultZIndexes.scatter - 2}
                />
              ))}
              {is_today && (
                <ReferenceLine
                  x={now.toMillis()}
                  className={TodayColor}
                  stroke=""
                  strokeWidth={1}
                  xAxisId="line"
                  zIndex={DefaultZIndexes.scatter + 1}
                >
                  <Label
                    value={now_label}
                    className={TodayColor}
                    strokeWidth={0}
                    style={{ fontFamily: "Poppins" }}
                    position="top"
                  />
                </ReferenceLine>
              )}

              {local_series
                .filter((s) => s.graph_type == GraphType.Bar)
                .map((s) => (
                  <Bar
                    key={getSeriesKey(s)}
                    name={s.data_key}
                    dataKey={s.data_key}
                    scale="time"
                    className={s.color ?? defaultColor}
                    fillOpacity={
                      activeSerie === "" || matchDataKey(activeSerie, s.data_key) ? 1 : 0.25
                    }
                    strokeWidth={0}
                    radius={[wide_bars ? 2 : 0, wide_bars ? 2 : 0, 0, 0]}
                    isAnimationActive={isAnimationActive}
                    animationDuration={100}
                    animationEasing="ease-in-out"
                    stackId={stack_bars ? "stack" : undefined}
                    xAxisId="bar"
                    barSize={bar_size}
                    zIndex={DefaultZIndexes.scatter}
                  >
                    {!s.color &&
                      local_data?.map((entry, index) => {
                        const color =
                          _.get(entry, s.data_key) >= 0
                            ? defaultPositiveColor
                            : defaultNegativeColor;
                        return <Cell key={index} className={color} />;
                      })}
                  </Bar>
                ))}
              {local_series
                .filter((s) => s.graph_type == GraphType.Line)
                .map((s) => (
                  <Line
                    key={getSeriesKey(s)}
                    type={s.curve_type ?? "monotoneX"}
                    data={local_data}
                    name={s.data_key}
                    dataKey={s.data_key}
                    scale="time"
                    className={s.color ?? defaultColor}
                    stroke=""
                    strokeOpacity={
                      activeSerie === "" || matchDataKey(activeSerie, s.data_key) ? 1 : 0.25
                    }
                    dot={false}
                    activeDot={false}
                    strokeWidth={s.is_limit ? 1 : 2}
                    isAnimationActive={isAnimationActive}
                    animationDuration={100}
                    animationEasing="ease-in-out"
                    xAxisId="line"
                    connectNulls={false}
                    zIndex={DefaultZIndexes.scatter}
                  ></Line>
                ))}

              {local_forecast_series
                .filter((s) => s.graph_type == GraphType.Bar)
                .map((s) => (
                  <Bar
                    key={`fc.${getSeriesKey(s)}`}
                    name={s.data_key}
                    dataKey={`fc.${s.data_key}`}
                    scale="time"
                    className={s.color ?? defaultColor}
                    fillOpacity={0}
                    strokeWidth={2}
                    strokeOpacity={
                      activeSerie === "" || matchDataKey(activeSerie, s.data_key) ? 1 : 0.25
                    }
                    radius={[wide_bars ? 2 : 0, wide_bars ? 2 : 0, 0, 0]}
                    isAnimationActive={isAnimationActive}
                    animationDuration={100}
                    animationEasing="ease-in-out"
                    stackId={stack_bars ? "stack" : undefined}
                    xAxisId="bar"
                    barSize={bar_size}
                    zIndex={DefaultZIndexes.scatter}
                  >
                    {!s.color &&
                      local_data?.map((entry, index) => {
                        const color =
                          _.get(entry, `fc.${s.data_key}`) >= 0
                            ? defaultPositiveColor
                            : defaultNegativeColor;
                        return <Cell key={index} className={color} />;
                      })}
                  </Bar>
                ))}
              {local_forecast_series
                .filter((s) => s.graph_type == GraphType.Line)
                .map((s) => (
                  <Line
                    key={`fc.${getSeriesKey(s)}`}
                    type={s.curve_type ?? "monotoneX"}
                    name={s.data_key}
                    dataKey={`fc.${s.data_key}`}
                    scale="time"
                    className={s.color ?? defaultColor}
                    stroke=""
                    strokeOpacity={
                      activeSerie === "" || matchDataKey(activeSerie, s.data_key) ? 1 : 0.25
                    }
                    dot={false}
                    activeDot={false}
                    strokeWidth={s.is_limit ? 1 : 2}
                    isAnimationActive={isAnimationActive}
                    animationDuration={100}
                    animationEasing="ease-in-out"
                    strokeDasharray={s.is_limit ? undefined : "10 5"}
                    xAxisId="line"
                    connectNulls={false}
                    zIndex={DefaultZIndexes.scatter}
                  ></Line>
                ))}

              {has_data && (
                <ZIndexLayer zIndex={DefaultZIndexes.scatter + 2}>
                  <MinMaxLabelLayer
                    data={local_data}
                    y={y_max_wo_limits}
                    xIndex={y_max_index_wo_limits}
                    xPropertyName={x_property_name}
                    xOffset={has_graph_type_bar ? bar_off_set : 0}
                    format={y_format}
                    canvasSize={canvasSize}
                  />
                  <MinMaxLabelLayer
                    data={local_data}
                    y={y_min_wo_limits}
                    xIndex={y_min_index_wo_limits}
                    xPropertyName={x_property_name}
                    xOffset={has_graph_type_bar ? bar_off_set : 0}
                    format={y_format}
                    canvasSize={canvasSize}
                  />
                </ZIndexLayer>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
