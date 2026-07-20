import type { SystemId } from "~/types/system-status";

export type SupportedLocale = "en" | "nl";

type SystemStatusLabels = {
  online: string;
  errors: (count: number) => string;
  lastThirtyDaysErrors: (count: number) => string;
  tooltip: string;
  moreInformationLabel: (systemName: string) => string;
  onlineDescription: (systemName: string) => string;
  systemNames: Record<SystemId, string>;
};

export const systemStatusTranslations: Record<SupportedLocale, SystemStatusLabels> = {
  en: {
    online: "Online",
    errors: (count) => `${count} ${count === 1 ? "error" : "errors"}`,
    lastThirtyDaysErrors: (count) => `Last 30 days: ${count} ${count === 1 ? "error" : "errors"}`,
    tooltip: "More information about this system will be added later.",
    moreInformationLabel: (systemName) => `More information about ${systemName}`,
    onlineDescription: (systemName) => `${systemName} system is online`,
    systemNames: {
      solar: "Solar",
      charger: "Charger",
      battery: "Battery",
    },
  },
  nl: {
    online: "Online",
    errors: (count) => `${count} ${count === 1 ? "foutmelding" : "foutmeldingen"}`,
    lastThirtyDaysErrors: (count) =>
      `Laatste 30 dagen: ${count} ${count === 1 ? "foutmelding" : "foutmeldingen"}`,
    tooltip: "Meer informatie over dit systeem wordt later toegevoegd.",
    moreInformationLabel: (systemName) => `Meer informatie over ${systemName}`,
    onlineDescription: (systemName) => `${systemName} is online`,
    systemNames: {
      solar: "Zonnepanelen",
      charger: "Lader",
      battery: "Batterij",
    },
  },
};
