export type SystemId = "solar" | "charger" | "battery";

export type SystemStatus = {
  id: SystemId;
  name: string;
  status: "online";
  statusLabel: string;
  currentErrorCount: number;
  lastThirtyDaysErrorCount: number;
  tooltip: string;
};

export const SYSTEM_STATUSES: readonly SystemStatus[] = [
  {
    id: "solar",
    name: "Solar",
    status: "online",
    statusLabel: "Online",
    currentErrorCount: 0,
    lastThirtyDaysErrorCount: 0,
    tooltip: "More information about the solar system will be added later.",
  },
  {
    id: "charger",
    name: "Charger",
    status: "online",
    statusLabel: "Online",
    currentErrorCount: 0,
    lastThirtyDaysErrorCount: 0,
    tooltip: "More information about the charger system will be added later.",
  },
  {
    id: "battery",
    name: "Battery",
    status: "online",
    statusLabel: "Online",
    currentErrorCount: 0,
    lastThirtyDaysErrorCount: 0,
    tooltip: "More information about the battery system will be added later.",
  },
];
