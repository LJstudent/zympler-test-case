import { read, utils } from "xlsx";

import workbookUrl from "~/data/hbe-export-nagel-2025.xlsx?url";

import { getEnergyColumnIndexes } from "./excel-columns";
import { parseEnergyRow } from "./parse-energy-row";
import { parseEnergyTotals } from "./parse-energy-totals";
import { calculateSolarChargingKpi } from "./solar-charging-kpi";
import type { EnergyDataset } from "./types";

const WORKSHEET_NAME = "Sheet1";
const HEADER_ROW_INDEX = 3;
const TOTALS_ROW_INDEX = 4;
const FIRST_DATA_ROW_INDEX = 5;

let energyDataPromise: Promise<EnergyDataset> | undefined;

function getRowValues(
  worksheet: import("xlsx").WorkSheet,
  rowIndex: number,
  lastColumnIndex: number,
): unknown[] {
  const values: unknown[] = new Array(lastColumnIndex + 1);

  for (let columnIndex = 0; columnIndex <= lastColumnIndex; columnIndex += 1) {
    values[columnIndex] = worksheet[utils.encode_cell({ r: rowIndex, c: columnIndex })]?.v;
  }

  return values;
}

async function fetchAndParseEnergyData(): Promise<EnergyDataset> {
  let response: Response;

  try {
    response = await fetch(workbookUrl);
  } catch (error: unknown) {
    throw new Error("The energy workbook could not be loaded.", { cause: error });
  }

  if (!response.ok) {
    throw new Error(`The energy workbook could not be loaded (HTTP ${response.status}).`);
  }

  let workbook: ReturnType<typeof read>;

  try {
    workbook = read(await response.arrayBuffer(), { cellDates: false });
  } catch (error: unknown) {
    throw new Error("The energy workbook could not be parsed.", { cause: error });
  }

  const worksheet = workbook.Sheets[WORKSHEET_NAME];

  if (worksheet === undefined) {
    throw new Error(`The energy workbook is missing worksheet "${WORKSHEET_NAME}".`);
  }

  if (worksheet["!ref"] === undefined) {
    throw new Error(`${WORKSHEET_NAME} is empty.`);
  }

  const range = utils.decode_range(worksheet["!ref"]);
  const headers = getRowValues(worksheet, HEADER_ROW_INDEX, range.e.c);
  const columns = getEnergyColumnIndexes(headers);
  const totals = parseEnergyTotals(getRowValues(worksheet, TOTALS_ROW_INDEX, range.e.c), columns);
  const rows: EnergyDataset["rows"] = [];
  let invalidDateRows = 0;

  for (let rowIndex = FIRST_DATA_ROW_INDEX; rowIndex <= range.e.r; rowIndex += 1) {
    const values = getRowValues(worksheet, rowIndex, range.e.c);

    if (values.every((value) => value === undefined || value === null || value === "")) {
      continue;
    }

    const row = parseEnergyRow(values, columns);

    if (row === null) {
      invalidDateRows += 1;
    } else {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    throw new Error(
      `No valid measurements were found in ${WORKSHEET_NAME}; start and end dates must be valid.`,
    );
  }

  if (import.meta.env.DEV && invalidDateRows > 0) {
    console.warn(`Skipped ${invalidDateRows} energy rows with invalid start or end dates.`);
  }

  if (import.meta.env.DEV && Object.values(totals).some((value) => value < 0)) {
    console.warn("The energy workbook contains negative aggregate energy totals.");
  }

  const solarChargingKpi = calculateSolarChargingKpi(totals);

  if (import.meta.env.DEV && !solarChargingKpi.isDataConsistent) {
    console.warn(
      "The charger energy total differs from the combined solar and grid charger totals.",
    );
  }

  return { rows, totals };
}

export function loadEnergyData(): Promise<EnergyDataset> {
  energyDataPromise ??= fetchAndParseEnergyData();
  return energyDataPromise;
}
