export type PowerReading = {
  power?: number | null;
  power_max?: number | null;
  energy?: number | null;
};

export type EnergyRecord = {
  interval?: {
    start?: string | null;
    end?: string | null;
  } | null;
  from_grid?: PowerReading | null;
  to_grid?: PowerReading | null;
  from_grid_limit?: PowerReading | null;
  to_grid_limit?: PowerReading | null;
  total_used?: PowerReading | null;
  breakdown?: {
    used_from_grid?: PowerReading | null;
    used_from_solar?: PowerReading | null;
    used_from_battery?: PowerReading | null;
    grid_to_battery?: PowerReading | null;
  } | null;
};

export type CapacityDirection = "import" | "export";
export type CapacityMode = "planned" | "actual";
export type CapacityStatus = "within-limit" | "approaching-limit" | "exceeded" | "unavailable";

export type GridCapacityPoint = {
  timestamp: string | null;
  powerWatts: number;
  limitWatts: number;
  utilisationPercentage: number;
  headroomWatts: number;
  exceededByWatts: number;
  visualPercentage: number;
};

export type GridCapacityMetrics = {
  maximumUtilisationPoint: GridCapacityPoint | null;
  maximumPowerPoint: GridCapacityPoint | null;
  status: CapacityStatus;
};

export type ZymplerAction = {
  id:
    | "grid-charging"
    | "battery-supply"
    | "solar-usage"
    | "grid-import"
    | "grid-export"
    | "capacity-warning";
  title: string;
  supportingValue?: string;
  tone?: "success" | "warning" | "danger";
};

export const NEAR_CAPACITY_THRESHOLD_PERCENTAGE = 90;

const positiveFinite = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

const nonNegativeFinite = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

// Direction is encoded by separate import/export fields in these models, not by the value sign.
const getPower = (reading: PowerReading | null | undefined): number | null =>
  nonNegativeFinite(reading?.power) ?? nonNegativeFinite(reading?.power_max);

export function wattsToKilowatts(watts: number): number {
  return watts / 1_000;
}

export function formatPower(watts: number | null): string {
  if (watts === null) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(wattsToKilowatts(watts))} kW`;
}

export function formatDashboardTime(timestamp: string | null, timeZone?: string): string {
  if (!timestamp) return "Time unavailable";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(date);
  } catch {
    return "Time unavailable";
  }
}

function toCapacityPoint(
  record: EnergyRecord,
  direction: CapacityDirection,
): GridCapacityPoint | null {
  const power = getPower(direction === "import" ? record.from_grid : record.to_grid);
  const limit = positiveFinite(
    getPower(direction === "import" ? record.from_grid_limit : record.to_grid_limit),
  );
  if (power === null || limit === null) return null;

  const utilisationPercentage = (power / limit) * 100;
  return {
    timestamp: record.interval?.start ?? null,
    powerWatts: power,
    limitWatts: limit,
    utilisationPercentage,
    headroomWatts: Math.max(0, limit - power),
    exceededByWatts: Math.max(0, power - limit),
    visualPercentage: Math.min(100, Math.max(0, utilisationPercentage)),
  };
}

function timestampOrder(timestamp: string | null): number {
  if (!timestamp) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function selectMaximumPoint(
  points: readonly GridCapacityPoint[],
  value: (point: GridCapacityPoint) => number,
): GridCapacityPoint | null {
  return points.reduce<GridCapacityPoint | null>((selected, point) => {
    if (!selected || value(point) > value(selected)) return point;
    if (
      value(point) === value(selected) &&
      timestampOrder(point.timestamp) < timestampOrder(selected.timestamp)
    ) {
      return point;
    }
    return selected;
  }, null);
}

export function getGridCapacityMetrics(
  records: readonly EnergyRecord[],
  direction: CapacityDirection = "import",
): GridCapacityMetrics {
  const points = records
    .map((record) => toCapacityPoint(record, direction))
    .filter((point): point is GridCapacityPoint => point !== null);
  const maximumUtilisationPoint = selectMaximumPoint(
    points,
    (point) => point.utilisationPercentage,
  );
  const maximumPowerPoint = selectMaximumPoint(points, (point) => point.powerWatts);

  if (!maximumUtilisationPoint) {
    return { maximumUtilisationPoint: null, maximumPowerPoint: null, status: "unavailable" };
  }

  const utilisation = maximumUtilisationPoint.utilisationPercentage;
  const status: CapacityStatus =
    utilisation > 100
      ? "exceeded"
      : utilisation >= NEAR_CAPACITY_THRESHOLD_PERCENTAGE
        ? "approaching-limit"
        : "within-limit";

  return { maximumUtilisationPoint, maximumPowerPoint, status };
}

export const getGridImportCapacityMetrics = (records: readonly EnergyRecord[]) =>
  getGridCapacityMetrics(records, "import");

export const getGridExportCapacityMetrics = (records: readonly EnergyRecord[]) =>
  getGridCapacityMetrics(records, "export");

function getIntervalHours(record: EnergyRecord): number {
  const start = record.interval?.start ? Date.parse(record.interval.start) : Number.NaN;
  const end = record.interval?.end ? Date.parse(record.interval.end) : Number.NaN;
  const milliseconds = end - start;
  return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds / 3_600_000 : 0;
}

export function getBatterySupplyDurationHours(records: readonly EnergyRecord[]): number {
  return records.reduce((hours, record) => {
    const suppliedPower = getPower(record.breakdown?.used_from_battery);
    return hours + (suppliedPower !== null && suppliedPower > 0 ? getIntervalHours(record) : 0);
  }, 0);
}

export function getDirectSolarEnergy(records: readonly EnergyRecord[]): number {
  return records.reduce((total, record) => {
    const solar = record.breakdown?.used_from_solar;
    const measuredEnergy = positiveFinite(solar?.energy);
    if (measuredEnergy !== null) return total + measuredEnergy;
    const solarPower = getPower(solar);
    return total + (solarPower !== null ? solarPower * getIntervalHours(record) : 0);
  }, 0);
}

function getSiteDemand(record: EnergyRecord): number | null {
  const directTotal = getPower(record.total_used);
  if (directTotal !== null) return directTotal;
  const components = [
    getPower(record.breakdown?.used_from_grid),
    getPower(record.breakdown?.used_from_solar),
    getPower(record.breakdown?.used_from_battery),
  ].filter((value) => value !== null);
  return components.length > 0 ? components.reduce((total, value) => total + value, 0) : null;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function formatDuration(hours: number): string {
  const rounded = Math.round(hours * 4) / 4;
  if (rounded < 1) return `${Math.round(rounded * 60)} minutes`;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(rounded)} ${rounded === 1 ? "hour" : "hours"}`;
}

function capacityAction(
  metrics: GridCapacityMetrics,
  direction: CapacityDirection,
): ZymplerAction | null {
  const point = metrics.maximumUtilisationPoint;
  if (!point) return null;
  const label = `grid ${direction}`;
  const percentage = Math.round(point.utilisationPercentage);

  if (metrics.status === "exceeded") {
    return {
      id: "capacity-warning",
      title: `Planned ${label} limit exceeded`,
      supportingValue: `${formatPower(point.exceededByWatts)} over the applicable limit`,
      tone: "danger",
    };
  }
  if (metrics.status === "approaching-limit") {
    return {
      id: "capacity-warning",
      title: `Planned ${label} is approaching capacity`,
      supportingValue: `${percentage}% maximum utilisation`,
      tone: "warning",
    };
  }
  if (point.powerWatts <= 0) return null;
  return {
    id: direction === "import" ? "grid-import" : "grid-export",
    title: `Kept planned ${label} below ${percentage}% of capacity`,
    tone: "success",
  };
}

export function getDailyZymplerActions(planRecords: readonly EnergyRecord[]): ZymplerAction[] {
  const warnings = [
    capacityAction(getGridImportCapacityMetrics(planRecords), "import"),
    capacityAction(getGridExportCapacityMetrics(planRecords), "export"),
  ].filter(
    (action): action is ZymplerAction => action !== null && action.id === "capacity-warning",
  );
  const actions: ZymplerAction[] = [...warnings];
  const demandValues = planRecords.map(getSiteDemand).filter((value) => value !== null);
  const medianDemand = median(demandValues);
  const chargingRecords = planRecords.filter(
    (record) => (getPower(record.breakdown?.grid_to_battery) ?? 0) > 0,
  );

  if (chargingRecords.length > 0) {
    // Median demand is resistant to daytime spikes and makes "low demand" relative to this day.
    const chargedAtLowDemand =
      medianDemand !== null &&
      chargingRecords.some((record) => {
        const demand = getSiteDemand(record);
        return demand !== null && demand <= medianDemand;
      });
    actions.push({
      id: "grid-charging",
      title: chargedAtLowDemand
        ? "Charged battery during low site demand"
        : "Charged battery from the grid",
      supportingValue: chargedAtLowDemand ? "At or below median site demand" : undefined,
      tone: "success",
    });
  }

  const batteryHours = getBatterySupplyDurationHours(planRecords);
  if (batteryHours > 0) {
    actions.push({
      id: "battery-supply",
      title: "Supplied the site from battery",
      supportingValue: formatDuration(batteryHours),
      tone: "success",
    });
  }

  if (getDirectSolarEnergy(planRecords) > 0) {
    actions.push({
      id: "solar-usage",
      title: "Used available solar energy directly",
      supportingValue: "Solar supplied site demand",
      tone: "success",
    });
  }

  for (const candidate of [
    capacityAction(getGridImportCapacityMetrics(planRecords), "import"),
    capacityAction(getGridExportCapacityMetrics(planRecords), "export"),
  ]) {
    if (candidate && candidate.id !== "capacity-warning" && actions.length < 4) {
      actions.push(candidate);
    }
  }

  return actions.slice(0, 4);
}
