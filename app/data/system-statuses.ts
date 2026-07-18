import batteryIcon from "~/assets/systems/battery.svg";
import chargerIcon from "~/assets/systems/charger.svg";
import solarIcon from "~/assets/systems/solar.svg";
import type { SystemStatus } from "~/types/system-status";

export const systemStatuses: readonly SystemStatus[] = [
  {
    id: "solar",
    name: "Solar",
    iconSrc: solarIcon,
    status: "online",
    currentErrors: 0,
    errorsLastThirtyDays: 0,
  },
  {
    id: "charger",
    name: "Charger",
    iconSrc: chargerIcon,
    status: "online",
    currentErrors: 0,
    errorsLastThirtyDays: 0,
  },
  {
    id: "battery",
    name: "Battery",
    iconSrc: batteryIcon,
    status: "online",
    currentErrors: 0,
    errorsLastThirtyDays: 0,
  },
];
