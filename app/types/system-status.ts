export type SystemId = "solar" | "charger" | "battery";

export type SystemAvailability = "online";

export type SystemStatus = {
  id: SystemId;
  name: string;
  iconSrc: string;
  status: SystemAvailability;
  currentErrors: number;
  errorsLastThirtyDays: number;
};
