import type { Format } from "@number-flow/react";

export type NumberFormat = {
  format: Format;
  suffix?: string;
  fixedScaleFactor?: number;
};
