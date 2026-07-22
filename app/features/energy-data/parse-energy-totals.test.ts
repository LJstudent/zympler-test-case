import { describe, expect, it } from "vitest";

import { EXCEL_COLUMNS, getEnergyColumnIndexes } from "./excel-columns";
import { parseEnergyTotals } from "./parse-energy-totals";

describe("parseEnergyTotals", () => {
  it("resolves and reads aggregate totals using configured Excel column names", () => {
    const headers = [
      EXCEL_COLUMNS.totalGridToCharger,
      EXCEL_COLUMNS.solarGeneration,
      EXCEL_COLUMNS.chargerEnergy,
      EXCEL_COLUMNS.totalSolarToCharger,
      ...Object.values(EXCEL_COLUMNS).filter(
        (header) =>
          header !== EXCEL_COLUMNS.totalGridToCharger &&
          header !== EXCEL_COLUMNS.solarGeneration &&
          header !== EXCEL_COLUMNS.chargerEnergy &&
          header !== EXCEL_COLUMNS.totalSolarToCharger,
      ),
    ];
    const columns = getEnergyColumnIndexes(headers);
    const values: unknown[] = [];

    values[columns.solarGeneration] = 187_746.6;
    values[columns.chargerEnergy] = 77_013.27103;
    values[columns.totalSolarToCharger] = 15_249.67097;
    values[columns.totalGridToCharger] = 61_472.94476;

    expect(parseEnergyTotals(values, columns)).toEqual({
      solarGenerationKwh: 187_746.6,
      chargerEnergyKwh: 77_013.27103,
      totalSolarToChargerKwh: 15_249.67097,
      totalGridToChargerKwh: 61_472.94476,
    });
  });

  it("normalizes non-finite imported totals", () => {
    const columns = getEnergyColumnIndexes(Object.values(EXCEL_COLUMNS));
    const values: unknown[] = [];

    values[columns.totalSolarToCharger] = Number.NaN;
    values[columns.totalGridToCharger] = Number.POSITIVE_INFINITY;

    expect(parseEnergyTotals(values, columns)).toMatchObject({
      totalSolarToChargerKwh: 0,
      totalGridToChargerKwh: 0,
    });
  });
});
