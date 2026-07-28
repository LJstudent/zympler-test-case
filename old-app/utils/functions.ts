import { DateTime, Settings, type DateTimeUnit } from "luxon";
import { BESPOKE_NUMBER_FORMAT_SUFFIXES } from "./constants";
import type { NumberFormat } from "./types";
import { type TimeResolution } from "./graphs";

const TERA_THRESHOLD: number = 1_000_000_000_000;
const GIGA_THRESHOLD: number = 1_000_000_000;
const MEGA_THRESHOLD: number = 1_000_000;
const KILO_THRESHOLD: number = 1_000;

const MILLI_THRESHOLD: number = 0.001;
const MICRO_THRESHOLD: number = 0.000001;
const NANO_THRESHOLD: number = 0.000000001;
const PICO_THRESHOLD: number = 0.000000000001;

export function get_compact_prefix_and_value(value: number): [string, number] {
  if (value >= TERA_THRESHOLD || value <= -1 * TERA_THRESHOLD) {
    return ["T", value / TERA_THRESHOLD];
  } else if (value >= GIGA_THRESHOLD || value <= -1 * GIGA_THRESHOLD) {
    return ["G", value / GIGA_THRESHOLD];
  } else if (value >= MEGA_THRESHOLD || value <= -1 * MEGA_THRESHOLD) {
    return ["M", value / MEGA_THRESHOLD];
  } else if (value >= KILO_THRESHOLD || value <= -1 * KILO_THRESHOLD) {
    return ["k", value / KILO_THRESHOLD];
  } else if (value === 0) {
    return ["", value];
  } else if (value < 100 * PICO_THRESHOLD && value > -1 * 100 * PICO_THRESHOLD) {
    return ["p", value / PICO_THRESHOLD];
  } else if (value < 100 * NANO_THRESHOLD && value > -1 * 100 * NANO_THRESHOLD) {
    return ["n", value / NANO_THRESHOLD];
  } else if (value < 100 * MICRO_THRESHOLD && value > -1 * 100 * MICRO_THRESHOLD) {
    return ["µ", value / MICRO_THRESHOLD];
  } else if (value < 100 * MILLI_THRESHOLD && value > -1 * 100 * MILLI_THRESHOLD) {
    return ["m", value / MILLI_THRESHOLD];
  } else {
    return ["", value];
  }
}

export function format_intl_number(value: number, format?: NumberFormat): string {
  if (typeof value !== "number") {
    return `- ${format?.suffix ?? ""}`;
  }

  let prefix = "";
  if (typeof format?.fixedScaleFactor === "number") {
    value = value / format.fixedScaleFactor;
  } else if (BESPOKE_NUMBER_FORMAT_SUFFIXES.includes(format?.suffix ?? "")) {
    const [p, v] = get_compact_prefix_and_value(value);
    prefix = p;
    value = v;
  }

  const formattedValue = new Intl.NumberFormat(
    Settings.defaultLocale ?? "en-US",
    format?.format,
  ).format(value);

  return `${formattedValue} ${prefix}${format?.suffix ?? ""}`;
}

export function getStartOfDate(resolution: TimeResolution, date: DateTime): DateTime {
  return date.startOf(getRoundTo(resolution));
}

export function measureTextSize(
  text: string,
  fontSize: number = 18,
): { width: number; height: number } {
  if (typeof document === "undefined") {
    return { width: text.length * 0.5 * fontSize, height: fontSize };
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: 0, height: 0 };

  const font = `${fontSize}px Poppins`;
  ctx.font = font;
  const metrics = ctx.measureText(text);

  const width = metrics.width;
  const height =
    typeof metrics.actualBoundingBoxAscent === "number"
      ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      : parseInt(font, 10); // fallback

  return { width, height };
}

export function getRoundTo(resolution: TimeResolution): DateTimeUnit {
  switch (resolution) {
    case "day":
      return "day";
  }
}
