import type { GridCapacityLimits, GridMeasurementUnit } from "./grid-capacity-config";
import type { EnergyDataRow, EnergyMeasurement } from "./types";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;

export interface GridCapacityViolation {
  direction: "import" | "export";
  start: Date;
  end: Date;
  measuredKw: number;
  limitKw: number;
  exceededByKw: number;
}

export interface GridComplianceDirection {
  violationCount: number;
  peakKw: number;
  limitKw: number;
  peakAt: Date | null;
  exceededByKw: number;
  headroomKw: number;
}

export interface GridComplianceKpi {
  compliancePercentage: number;
  totalIntervals: number;
  compliantIntervals: number;
  hasValidMeasurements: boolean;
  import: GridComplianceDirection;
  export: GridComplianceDirection;
  violations: GridCapacityViolation[];
}

export type GridMeasurementRow = Pick<EnergyDataRow, "start" | "end"> & {
  measurement: Pick<EnergyMeasurement, "gridImportKwh" | "gridExportKwh">;
};

interface ValidGridInterval {
  start: Date;
  end: Date;
  importPowerKw: number;
  exportPowerKw: number;
}

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function getPowerKw(
  value: number | null,
  intervalDurationHours: number,
  measurementUnit: GridMeasurementUnit,
): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) {
    return null;
  }

  const powerKw = measurementUnit === "energy-kwh" ? value / intervalDurationHours : value;
  return Number.isFinite(powerKw) ? powerKw : null;
}

function toValidInterval(
  row: GridMeasurementRow,
  measurementUnit: GridMeasurementUnit,
): ValidGridInterval | null {
  if (!isValidDate(row.start) || !isValidDate(row.end)) {
    return null;
  }

  const intervalDurationHours = (row.end.getTime() - row.start.getTime()) / MILLISECONDS_PER_HOUR;

  if (!Number.isFinite(intervalDurationHours) || intervalDurationHours <= 0) {
    return null;
  }

  const importPowerKw = getPowerKw(
    row.measurement.gridImportKwh,
    intervalDurationHours,
    measurementUnit,
  );
  const exportPowerKw = getPowerKw(
    row.measurement.gridExportKwh,
    intervalDurationHours,
    measurementUnit,
  );

  if (importPowerKw === null || exportPowerKw === null) {
    return null;
  }

  return { start: row.start, end: row.end, importPowerKw, exportPowerKw };
}

function createDirectionResult(
  peakKw: number,
  peakAt: Date | null,
  limitKw: number,
  violationCount: number,
): GridComplianceDirection {
  return {
    violationCount,
    peakKw,
    limitKw,
    peakAt,
    exceededByKw: Math.max(peakKw - limitKw, 0),
    headroomKw: Math.max(limitKw - peakKw, 0),
  };
}

export function calculateGridComplianceKpi(
  rows: readonly GridMeasurementRow[],
  limits: GridCapacityLimits,
  measurementUnit: GridMeasurementUnit,
): GridComplianceKpi {
  const validIntervals = rows
    .map((row) => toValidInterval(row, measurementUnit))
    .filter((interval): interval is ValidGridInterval => interval !== null);
  const violations: GridCapacityViolation[] = [];
  let compliantIntervals = 0;
  let peakImportKw = 0;
  let peakImportAt: Date | null = null;
  let peakExportKw = 0;
  let peakExportAt: Date | null = null;

  for (const interval of validIntervals) {
    const importViolated = interval.importPowerKw > limits.importKw;
    const exportViolated = interval.exportPowerKw > limits.exportKw;

    if (!importViolated && !exportViolated) {
      compliantIntervals += 1;
    }

    if (peakImportAt === null || interval.importPowerKw > peakImportKw) {
      peakImportKw = interval.importPowerKw;
      peakImportAt = interval.start;
    }

    if (peakExportAt === null || interval.exportPowerKw > peakExportKw) {
      peakExportKw = interval.exportPowerKw;
      peakExportAt = interval.start;
    }

    if (importViolated) {
      violations.push({
        direction: "import",
        start: interval.start,
        end: interval.end,
        measuredKw: interval.importPowerKw,
        limitKw: limits.importKw,
        exceededByKw: interval.importPowerKw - limits.importKw,
      });
    }

    if (exportViolated) {
      violations.push({
        direction: "export",
        start: interval.start,
        end: interval.end,
        measuredKw: interval.exportPowerKw,
        limitKw: limits.exportKw,
        exceededByKw: interval.exportPowerKw - limits.exportKw,
      });
    }
  }

  const totalIntervals = validIntervals.length;
  const importViolationCount = violations.filter(
    (violation) => violation.direction === "import",
  ).length;
  const exportViolationCount = violations.length - importViolationCount;

  return {
    compliancePercentage: totalIntervals > 0 ? (compliantIntervals / totalIntervals) * 100 : 0,
    totalIntervals,
    compliantIntervals,
    hasValidMeasurements: totalIntervals > 0,
    import: createDirectionResult(
      peakImportKw,
      peakImportAt,
      limits.importKw,
      importViolationCount,
    ),
    export: createDirectionResult(
      peakExportKw,
      peakExportAt,
      limits.exportKw,
      exportViolationCount,
    ),
    violations,
  };
}
