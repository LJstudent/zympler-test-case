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
  from_grid_limit?: PowerReading | null;
  total_used?: PowerReading | null;
  breakdown?: {
    used_from_grid?: PowerReading | null;
    used_from_solar?: PowerReading | null;
    used_from_battery?: PowerReading | null;
    grid_to_battery?: PowerReading | null;
  } | null;
};

export type GridCapacityMetrics = {
  peakPlannedLoadWatts: number | null;
  contractLimitWatts: number | null;
  availableHeadroomWatts: number | null;
  exceededByWatts: number;
  utilisationPercentage: number | null;
  progressPercentage: number;
  status: "within-limit" | "exceeded" | "unavailable";
};

export type ZymplerAction = {
  id: "grid-charging" | "battery-supply" | "solar-usage" | "grid-optimisation";
  title: string;
  supportingValue?: string;
};

const positiveFinite = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

const nonNegativeFinite = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

const getPower = (reading: PowerReading | null | undefined): number | null =>
  nonNegativeFinite(reading?.power_max) ?? nonNegativeFinite(reading?.power);

export function wattsToKilowatts(watts: number): number {
  return watts / 1_000;
}

export function getGridCapacityMetrics(records: readonly EnergyRecord[]): GridCapacityMetrics {
  const loads = records.map((record) => getPower(record.from_grid)).filter((v) => v !== null);
  const limits = records
    .map((record) => getPower(record.from_grid_limit))
    .filter((value): value is number => value !== null && value > 0);

  const peakPlannedLoadWatts = loads.length > 0 ? Math.max(...loads) : null;
  // A changing import limit is represented conservatively by its lowest valid daily value.
  const contractLimitWatts = limits.length > 0 ? Math.min(...limits) : null;

  if (peakPlannedLoadWatts === null || contractLimitWatts === null) {
    return {
      peakPlannedLoadWatts,
      contractLimitWatts,
      availableHeadroomWatts: null,
      exceededByWatts: 0,
      utilisationPercentage: null,
      progressPercentage: 0,
      status: "unavailable",
    };
  }

  const headroom = contractLimitWatts - peakPlannedLoadWatts;
  const utilisationPercentage = (peakPlannedLoadWatts / contractLimitWatts) * 100;

  return {
    peakPlannedLoadWatts,
    contractLimitWatts,
    availableHeadroomWatts: Math.max(0, headroom),
    exceededByWatts: Math.max(0, -headroom),
    utilisationPercentage,
    progressPercentage: Math.min(100, Math.max(0, utilisationPercentage)),
    status: headroom >= 0 ? "within-limit" : "exceeded",
  };
}

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

export function getDailyZymplerActions(
  planRecords: readonly EnergyRecord[],
  activityRecords: readonly EnergyRecord[] = planRecords,
): ZymplerAction[] {
  const actions: ZymplerAction[] = [];
  const demandValues = activityRecords.map(getSiteDemand).filter((value) => value !== null);
  const medianDemand = median(demandValues);
  const chargingRecords = activityRecords.filter(
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
    });
  }

  const batteryHours = getBatterySupplyDurationHours(activityRecords);
  if (batteryHours > 0) {
    actions.push({
      id: "battery-supply",
      title: "Supplied the site from battery",
      supportingValue: formatDuration(batteryHours),
    });
  }

  const directSolarEnergy = getDirectSolarEnergy(activityRecords);
  if (directSolarEnergy > 0) {
    actions.push({
      id: "solar-usage",
      title: "Used available solar energy directly",
      supportingValue: "Solar supplied site demand",
    });
  }

  const capacity = getGridCapacityMetrics(planRecords);
  if (capacity.status === "within-limit" && capacity.utilisationPercentage !== null) {
    actions.push({
      id: "grid-optimisation",
      title: "Kept planned grid load within capacity",
      supportingValue: `${Math.round(capacity.utilisationPercentage)}% maximum utilisation`,
    });
  }

  return actions.slice(0, 4);
}
